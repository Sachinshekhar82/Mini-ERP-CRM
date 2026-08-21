import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export class InternalTransferService {
  static async getTransfers() {
    return prisma.internalTransfer.findMany({
      include: {
        inventoryItem: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createTransfer(
    data: {
      sourceLocation: string;
      destinationLocation: string;
      inventoryItemId: string;
      quantity: number;
    },
    userId: string
  ) {
    if (data.quantity <= 0) {
      throw new ApiError(400, 'Transfer quantity must be greater than zero');
    }

    if (data.sourceLocation === data.destinationLocation) {
      throw new ApiError(400, 'Source and destination locations must be different');
    }

    const sourceItem = await prisma.inventoryItem.findUnique({
      where: { id: data.inventoryItemId },
    });

    if (!sourceItem) {
      throw new ApiError(404, 'Source inventory item not found');
    }

    // Rule: Cannot transfer more than available stock at source
    if (data.quantity > sourceItem.availableQty) {
      throw new ApiError(
        400,
        `Cannot transfer ${data.quantity} units. Only ${sourceItem.availableQty} available at ${sourceItem.location}`
      );
    }

    const count = await prisma.internalTransfer.count();
    const transferNumber = `TR-2026-${String(count + 1).padStart(4, '0')}`;

    return prisma.internalTransfer.create({
      data: {
        transferNumber,
        sourceLocation: data.sourceLocation,
        destinationLocation: data.destinationLocation,
        inventoryItemId: data.inventoryItemId,
        quantity: data.quantity,
        status: 'REQUESTED',
        createdById: userId,
      },
      include: {
        inventoryItem: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async dispatchTransfer(id: string) {
    return prisma.$transaction(async (tx) => {
      const transfer = await tx.internalTransfer.findUnique({
        where: { id },
        include: { inventoryItem: true },
      });

      if (!transfer) {
        throw new ApiError(404, 'Transfer record not found');
      }

      if (transfer.status !== 'REQUESTED') {
        throw new ApiError(400, `Transfer cannot be dispatched because status is already ${transfer.status}`);
      }

      const sourceItem = transfer.inventoryItem;
      if (transfer.quantity > sourceItem.availableQty) {
        throw new ApiError(
          400,
          `Cannot dispatch transfer. Available stock at ${sourceItem.location} dropped to ${sourceItem.availableQty}`
        );
      }

      // Rule: On Dispatch, Source physical inventory reduces
      const newSourcePhysical = sourceItem.physicalQty - transfer.quantity;
      const newSourceAvailable = newSourcePhysical - sourceItem.reservedQty;

      await tx.inventoryItem.update({
        where: { id: sourceItem.id },
        data: {
          physicalQty: newSourcePhysical,
          availableQty: newSourceAvailable,
        },
      });

      // Update transfer status to DISPATCHED
      // Destination stock DOES NOT increase yet!
      return tx.internalTransfer.update({
        where: { id },
        data: {
          status: 'DISPATCHED',
          dispatchedAt: new Date(),
        },
        include: {
          inventoryItem: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    });
  }

  static async receiveTransfer(id: string) {
    return prisma.$transaction(async (tx) => {
      const transfer = await tx.internalTransfer.findUnique({
        where: { id },
        include: { inventoryItem: true },
      });

      if (!transfer) {
        throw new ApiError(404, 'Transfer record not found');
      }

      // Mandatory Rule: Same transfer cannot be received twice!
      if (transfer.status === 'RECEIVED') {
        throw new ApiError(400, 'Transfer has already been received');
      }

      if (transfer.status !== 'DISPATCHED') {
        throw new ApiError(400, `Transfer cannot be received because status is ${transfer.status}. Must be DISPATCHED first.`);
      }

      const sourceItem = transfer.inventoryItem;

      // Find or create matching InventoryItem at Destination Location
      let destItem = await tx.inventoryItem.findFirst({
        where: {
          sku: sourceItem.sku,
          location: transfer.destinationLocation,
          batch: sourceItem.batch,
        },
      });

      if (!destItem) {
        destItem = await tx.inventoryItem.create({
          data: {
            itemName: sourceItem.itemName,
            sku: sourceItem.sku,
            category: sourceItem.category,
            location: transfer.destinationLocation,
            batch: sourceItem.batch,
            physicalQty: transfer.quantity,
            reservedQty: 0,
            availableQty: transfer.quantity,
            unitPrice: sourceItem.unitPrice,
          },
        });
      } else {
        const newDestPhysical = destItem.physicalQty + transfer.quantity;
        const newDestAvailable = newDestPhysical - destItem.reservedQty;

        await tx.inventoryItem.update({
          where: { id: destItem.id },
          data: {
            physicalQty: newDestPhysical,
            availableQty: newDestAvailable,
          },
        });
      }

      // Mark transfer status as RECEIVED
      return tx.internalTransfer.update({
        where: { id },
        data: {
          status: 'RECEIVED',
          receivedAt: new Date(),
        },
        include: {
          inventoryItem: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    });
  }
}
