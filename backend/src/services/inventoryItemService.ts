import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export class InventoryItemService {
  static async getInventoryItems(params?: {
    search?: string;
    location?: string;
    category?: string;
  }) {
    const where: any = {};

    if (params?.search) {
      where.OR = [
        { itemName: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
        { category: { contains: params.search, mode: 'insensitive' } },
        { location: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.location) {
      where.location = params.location;
    }

    if (params?.category) {
      where.category = params.category;
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: [{ location: 'asc' }, { itemName: 'asc' }],
    });

    return items;
  }

  static async getInventoryItemById(id: string) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }

    return item;
  }

  static async createInventoryItem(data: {
    itemName: string;
    sku: string;
    category: string;
    location: string;
    batch: string;
    physicalQty: number;
    unitPrice: number;
  }) {
    if (data.physicalQty < 0) {
      throw new ApiError(400, 'Physical quantity cannot be negative');
    }

    const existing = await prisma.inventoryItem.findUnique({
      where: {
        sku_location_batch: {
          sku: data.sku,
          location: data.location,
          batch: data.batch,
        },
      },
    });

    if (existing) {
      throw new ApiError(409, 'Inventory record for this SKU, Location, and Batch already exists');
    }

    const availableQty = data.physicalQty; // initial reservedQty = 0

    return prisma.inventoryItem.create({
      data: {
        itemName: data.itemName,
        sku: data.sku,
        category: data.category,
        location: data.location,
        batch: data.batch,
        physicalQty: data.physicalQty,
        reservedQty: 0,
        availableQty: availableQty,
        unitPrice: data.unitPrice,
      },
    });
  }

  static async updateInventoryQty(id: string, physicalQty: number) {
    if (physicalQty < 0) {
      throw new ApiError(400, 'Physical quantity cannot be negative');
    }

    return prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { id } });
      if (!item) throw new ApiError(404, 'Inventory item not found');

      if (physicalQty < item.reservedQty) {
        throw new ApiError(
          400,
          `Cannot reduce physical quantity to ${physicalQty} because ${item.reservedQty} units are reserved by customer orders`
        );
      }

      const availableQty = physicalQty - item.reservedQty;

      return tx.inventoryItem.update({
        where: { id },
        data: {
          physicalQty,
          availableQty,
        },
      });
    });
  }
}
