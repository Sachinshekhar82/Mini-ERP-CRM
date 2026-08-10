import { prisma } from '../config/prisma';

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ProductService {
  static async getProducts(options: ProductQueryOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;
    const search = options.search?.trim() || '';
    const category = options.category;
    const lowStock = options.lowStock;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { productName: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
        { warehouseLocation: { contains: search } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    const [allProducts, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    let products = allProducts;
    if (lowStock) {
      products = products.filter((p) => p.currentStock <= p.minimumStock);
    }

    const paginatedProducts = products.slice(skip, skip + limit);

    return {
      products: paginatedProducts,
      pagination: {
        total: lowStock ? products.length : totalCount,
        page,
        limit,
        totalPages: Math.ceil((lowStock ? products.length : totalCount) / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { createdBy: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!product) {
      const error: any = new Error(`Product with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  static async createProduct(
    data: {
      productName: string;
      sku: string;
      category: string;
      unitPrice: number;
      currentStock: number;
      minimumStock?: number;
      warehouseLocation: string;
      imageUrl?: string;
    },
    createdById: string
  ) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku.trim() },
    });

    if (existingSku) {
      const error: any = new Error(`Product with SKU '${data.sku}' already exists`);
      error.statusCode = 409;
      throw error;
    }

    // Atomic transaction for Product creation and initial StockMovement log
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          productName: data.productName,
          sku: data.sku.trim(),
          category: data.category,
          unitPrice: data.unitPrice,
          currentStock: data.currentStock,
          minimumStock: data.minimumStock ?? 5,
          warehouseLocation: data.warehouseLocation,
          imageUrl: data.imageUrl,
        },
      });

      if (data.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantityChanged: data.currentStock,
            movementType: 'IN',
            reason: 'Initial Product Inventory Setup',
            createdById,
          },
        });
      }

      return product;
    });
  }

  static async updateProduct(
    id: string,
    data: Partial<{
      productName: string;
      sku: string;
      category: string;
      unitPrice: number;
      minimumStock: number;
      warehouseLocation: string;
      imageUrl: string;
    }>
  ) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      const error: any = new Error(`Product with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Rule 9: Strip direct currentStock updates! Inventory mutations MUST use stock-in/stock-out APIs.
    const safeData = { ...data };
    delete (safeData as any).currentStock;

    if (safeData.sku && safeData.sku !== existing.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: safeData.sku } });
      if (existingSku) {
        const error: any = new Error(`Product with SKU '${safeData.sku}' already exists`);
        error.statusCode = 409;
        throw error;
      }
    }

    return prisma.product.update({
      where: { id },
      data: safeData,
    });
  }

  static async getProductMovements(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      const error: any = new Error(`Product with ID '${productId}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });
  }
}
