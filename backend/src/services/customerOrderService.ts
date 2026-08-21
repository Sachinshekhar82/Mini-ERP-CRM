import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export class CustomerOrderService {
  static async getCustomerOrders() {
    return prisma.customerOrder.findMany({
      include: {
        inventoryItem: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createOrderAndReserveStock(
    data: {
      customerName: string;
      inventoryItemId: string;
      quantity: number;
    },
    userId: string
  ) {
    if (data.quantity <= 0) {
      throw new ApiError(400, 'Order quantity must be greater than zero');
    }

    return prisma.$transaction(async (tx) => {
      // Fetch fresh inventory item inside atomic transaction
      const item = await tx.inventoryItem.findUnique({
        where: { id: data.inventoryItemId },
      });

      if (!item) {
        throw new ApiError(404, 'Inventory item not found');
      }

      // Mandatory Rule: Cannot reserve more than available inventory!
      if (data.quantity > item.availableQty) {
        throw new ApiError(
          400,
          `Cannot reserve ${data.quantity} units. Only ${item.availableQty} available at ${item.location}`
        );
      }

      // Atomically increment reservedQty and recalculate availableQty
      const newReservedQty = item.reservedQty + data.quantity;
      const newAvailableQty = item.physicalQty - newReservedQty;

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          reservedQty: newReservedQty,
          availableQty: newAvailableQty,
        },
      });

      const count = await tx.customerOrder.count();
      const orderNumber = `ORD-2026-${String(count + 1).padStart(4, '0')}`;

      return tx.customerOrder.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          inventoryItemId: data.inventoryItemId,
          quantity: data.quantity,
          status: 'RESERVED',
          createdById: userId,
        },
        include: {
          inventoryItem: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    });
  }

  static async cancelOrderAndReleaseStock(id: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.customerOrder.findUnique({
        where: { id },
        include: { inventoryItem: true },
      });

      if (!order) {
        throw new ApiError(404, 'Customer order not found');
      }

      if (order.status !== 'RESERVED') {
        throw new ApiError(400, `Order cannot be cancelled because status is ${order.status}`);
      }

      const item = order.inventoryItem;
      const newReservedQty = Math.max(0, item.reservedQty - order.quantity);
      const newAvailableQty = item.physicalQty - newReservedQty;

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          reservedQty: newReservedQty,
          availableQty: newAvailableQty,
        },
      });

      return tx.customerOrder.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          inventoryItem: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    });
  }
}
