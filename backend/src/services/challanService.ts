import { prisma } from '../config/prisma';

export interface ChallanQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ChallanService {
  static async generateChallanNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.salesChallan.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `CH-${year}-${nextNum}`;
  }

  static async getChallans(options: ChallanQueryOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;
    const search = options.search?.trim() || '';
    const status = options.status;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { challanNumber: { contains: search } },
        { customer: { businessName: { contains: search } } },
        { customer: { customerName: { contains: search } } },
      ];
    }
    if (status) {
      whereClause.status = status;
    }

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, customerName: true, businessName: true, email: true, mobile: true } },
          createdBy: { select: { id: true, name: true, role: true } },
          items: true,
        },
      }),
      prisma.salesChallan.count({ where: whereClause }),
    ]);

    return {
      challans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        items: {
          include: {
            product: { select: { id: true, currentStock: true, minimumStock: true } },
          },
        },
      },
    });

    if (!challan) {
      const error: any = new Error(`Sales Challan with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return challan;
  }

  static async createChallan(
    data: {
      customerId: string;
      status?: 'DRAFT' | 'CONFIRMED';
      notes?: string;
      items: Array<{ productId: string; quantity: number }>;
    },
    userId: string
  ) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      const error: any = new Error(`Customer with ID '${data.customerId}' not found`);
      error.statusCode = 404;
      throw error;
    }

    if (!data.items || data.items.length === 0) {
      const error: any = new Error('Sales Challan must contain at least one line item');
      error.statusCode = 400;
      throw error;
    }

    // Merge duplicate product items if provided in body
    const itemMap = new Map<string, number>();
    for (const item of data.items) {
      if (item.quantity <= 0) {
        const error: any = new Error('Product quantity must be a positive integer greater than 0');
        error.statusCode = 400;
        throw error;
      }
      itemMap.set(item.productId, (itemMap.get(item.productId) || 0) + item.quantity);
    }

    const uniqueItemRequests = Array.from(itemMap.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    const productIds = uniqueItemRequests.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const reqItem of uniqueItemRequests) {
      if (!productMap.has(reqItem.productId)) {
        const error: any = new Error(`Product with ID '${reqItem.productId}' does not exist`);
        error.statusCode = 404;
        throw error;
      }
    }

    const challanStatus = data.status || 'DRAFT';
    const challanNumber = await this.generateChallanNumber();

    // Prepare snapshot items
    let totalAmount = 0;
    let totalQuantity = 0;

    const challanItemsData = uniqueItemRequests.map((item) => {
      const product = productMap.get(item.productId)!;
      const lineTotal = product.unitPrice * item.quantity;
      totalAmount += lineTotal;
      totalQuantity += item.quantity;

      return {
        productId: product.id,
        productNameSnapshot: product.productName,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        totalPrice: lineTotal,
      };
    });

    // Atomic transaction if status is CONFIRMED immediately
    return prisma.$transaction(async (tx) => {
      if (challanStatus === 'CONFIRMED') {
        // Stock pre-check
        for (const item of uniqueItemRequests) {
          const product = productMap.get(item.productId)!;
          if (product.currentStock < item.quantity) {
            const error: any = new Error(
              `Cannot confirm challan. Insufficient stock for product '${product.productName}' (${product.sku}). Available stock: ${product.currentStock}, Requested: ${item.quantity}`
            );
            error.statusCode = 400;
            throw error;
          }
        }
      }

      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: customer.id,
          totalAmount,
          totalQuantity,
          status: challanStatus,
          notes: data.notes,
          createdById: userId,
          items: {
            create: challanItemsData,
          },
        },
        include: { items: true, customer: true },
      });

      if (challanStatus === 'CONFIRMED') {
        for (const item of uniqueItemRequests) {
          const product = productMap.get(item.productId)!;
          const updatedStock = product.currentStock - item.quantity;

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: updatedStock },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantityChanged: item.quantity,
              movementType: 'OUT',
              reason: `Issued Sales Challan #${challanNumber}`,
              createdById: userId,
            },
          });
        }
      }

      return challan;
    });
  }

  static async updateChallan(
    id: string,
    data: {
      notes?: string;
      items?: Array<{ productId: string; quantity: number }>;
    }
  ) {
    const existing = await prisma.salesChallan.findUnique({ where: { id } });
    if (!existing) {
      const error: any = new Error(`Sales Challan with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    if (existing.status !== 'DRAFT') {
      const error: any = new Error(`Cannot modify a ${existing.status} Sales Challan. Only DRAFT challans can be edited.`);
      error.statusCode = 400;
      throw error;
    }

    if (data.items && data.items.length > 0) {
      const itemMap = new Map<string, number>();
      for (const item of data.items) {
        if (item.quantity <= 0) {
          const error: any = new Error('Product quantity must be greater than 0');
          error.statusCode = 400;
          throw error;
        }
        itemMap.set(item.productId, (itemMap.get(item.productId) || 0) + item.quantity);
      }

      const uniqueItems = Array.from(itemMap.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const productIds = uniqueItems.map((i) => i.productId);
      const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      let totalAmount = 0;
      let totalQuantity = 0;

      const challanItemsData = uniqueItems.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          const error: any = new Error(`Product with ID '${item.productId}' not found`);
          error.statusCode = 404;
          throw error;
        }
        const lineTotal = product.unitPrice * item.quantity;
        totalAmount += lineTotal;
        totalQuantity += item.quantity;

        return {
          productId: product.id,
          productNameSnapshot: product.productName,
          skuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          quantity: item.quantity,
          totalPrice: lineTotal,
        };
      });

      return prisma.$transaction(async (tx) => {
        await tx.salesChallanItem.deleteMany({ where: { challanId: id } });

        return tx.salesChallan.update({
          where: { id },
          data: {
            notes: data.notes,
            totalAmount,
            totalQuantity,
            items: {
              create: challanItemsData,
            },
          },
          include: { items: true },
        });
      });
    }

    return prisma.salesChallan.update({
      where: { id },
      data: { notes: data.notes },
      include: { items: true },
    });
  }

  static async confirmChallan(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Load challan and items with current product state
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });

      // 2. Verify existence & status
      if (!challan) {
        const error: any = new Error(`Sales Challan with ID '${id}' not found`);
        error.statusCode = 404;
        throw error;
      }

      if (challan.status === 'CONFIRMED') {
        const error: any = new Error(`Challan #${challan.challanNumber} is already CONFIRMED. Duplicate confirmation is not allowed.`);
        error.statusCode = 400;
        throw error;
      }

      if (challan.status === 'CANCELLED') {
        const error: any = new Error(`Cannot confirm a CANCELLED Sales Challan.`);
        error.statusCode = 400;
        throw error;
      }

      if (!challan.customer) {
        const error: any = new Error(`Customer referenced in Challan #${challan.challanNumber} no longer exists.`);
        error.statusCode = 404;
        throw error;
      }

      // 3. Strict Pre-Verification for ALL Items (Atomic Rollback Guard)
      for (const item of challan.items) {
        if (!item.product) {
          const error: any = new Error(`Product '${item.productNameSnapshot}' (${item.skuSnapshot}) no longer exists.`);
          error.statusCode = 404;
          throw error;
        }

        if (item.quantity <= 0) {
          const error: any = new Error(`Invalid item quantity ${item.quantity} for product '${item.productNameSnapshot}'.`);
          error.statusCode = 400;
          throw error;
        }

        if (item.product.currentStock < item.quantity) {
          // THROW inside $transaction -> Triggers full atomic rollback!
          const error: any = new Error(
            `Cannot confirm challan. Insufficient stock for product '${item.productNameSnapshot}' (${item.skuSnapshot}). Available stock: ${item.product.currentStock}, Requested quantity: ${item.quantity}`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      // 4. All stock checks passed -> Execute stock deductions & audit log creations
      for (const item of challan.items) {
        const newStock = item.product.currentStock - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: 'OUT',
            reason: `Confirmed Sales Challan #${challan.challanNumber}`,
            createdById: userId,
          },
        });
      }

      // 5. Update Challan Status to CONFIRMED
      const confirmedChallan = await tx.salesChallan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: { items: true, customer: true },
      });

      return confirmedChallan;
    });
  }

  static async cancelChallan(id: string) {
    const challan = await prisma.salesChallan.findUnique({ where: { id } });

    if (!challan) {
      const error: any = new Error(`Sales Challan with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    if (challan.status === 'CONFIRMED') {
      const error: any = new Error(`Cannot cancel a CONFIRMED Sales Challan.`);
      error.statusCode = 400;
      throw error;
    }

    if (challan.status === 'CANCELLED') {
      const error: any = new Error(`Sales Challan #${challan.challanNumber} is already CANCELLED.`);
      error.statusCode = 400;
      throw error;
    }

    return prisma.salesChallan.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });
  }
}
