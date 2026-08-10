import { prisma } from '../config/prisma';

export class InventoryService {
  static async stockIn(productId: string, quantity: number, reason: string, userId: string) {
    if (quantity <= 0) {
      const error: any = new Error('Stock IN quantity must be a positive integer greater than 0');
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        const error: any = new Error(`Product with ID '${productId}' not found`);
        error.statusCode = 404;
        throw error;
      }

      const updatedStock = product.currentStock + quantity;

      const [updatedProduct, log] = await Promise.all([
        tx.product.update({
          where: { id: productId },
          data: { currentStock: updatedStock },
        }),
        tx.stockMovement.create({
          data: {
            productId,
            quantityChanged: quantity,
            movementType: 'IN',
            reason,
            createdById: userId,
          },
          include: { createdBy: { select: { id: true, name: true, role: true } } },
        }),
      ]);

      return { product: updatedProduct, movement: log };
    });
  }

  static async stockOut(productId: string, quantity: number, reason: string, userId: string) {
    if (quantity <= 0) {
      const error: any = new Error('Stock OUT quantity must be a positive integer greater than 0');
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        const error: any = new Error(`Product with ID '${productId}' not found`);
        error.statusCode = 404;
        throw error;
      }

      if (product.currentStock < quantity) {
        const error: any = new Error(
          `Insufficient stock for product '${product.productName}' (${product.sku}). Available stock: ${product.currentStock}, Requested stock out: ${quantity}`
        );
        error.statusCode = 400;
        throw error;
      }

      const updatedStock = product.currentStock - quantity;

      const [updatedProduct, log] = await Promise.all([
        tx.product.update({
          where: { id: productId },
          data: { currentStock: updatedStock },
        }),
        tx.stockMovement.create({
          data: {
            productId,
            quantityChanged: quantity,
            movementType: 'OUT',
            reason,
            createdById: userId,
          },
          include: { createdBy: { select: { id: true, name: true, role: true } } },
        }),
      ]);

      return { product: updatedProduct, movement: log };
    });
  }

  static async getMovements(options: {
    productId?: string;
    movementType?: 'IN' | 'OUT';
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 15));
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (options.productId) whereClause.productId = options.productId;
    if (options.movementType) whereClause.movementType = options.movementType;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          product: { select: { id: true, productName: true, sku: true, category: true } },
          createdBy: { select: { id: true, name: true, role: true } },
        },
      }),
      prisma.stockMovement.count({ where: whereClause }),
    ]);

    return {
      movements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
