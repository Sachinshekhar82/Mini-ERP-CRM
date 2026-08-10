import { prisma } from '../config/prisma';

export class DashboardService {
  static async getStats() {
    const todayStr = new Date().toISOString().split('T')[0];

    // Execute optimized parallel database queries
    const [
      totalCustomers,
      activeCustomers,
      leadCustomers,
      inactiveCustomers,
      totalProducts,
      lowStockAlerts,
      stockValuationResult,
      totalChallans,
      draftChallansCount,
      confirmedChallansAggregate,
      cancelledChallansCount,
      totalFollowUpsCount,
      dueFollowUpsCount,
      recentStockLogs,
      recentChallans,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.customer.count({ where: { status: 'LEAD' } }),
      prisma.customer.count({ where: { status: 'INACTIVE' } }),
      prisma.product.count(),

      // 1. Direct PostgreSQL query for low-stock alert products (currentStock <= minimumStock)
      prisma.$queryRaw<Array<{
        id: string;
        productName: string;
        sku: string;
        category: string;
        unitPrice: number;
        currentStock: number;
        minimumStock: number;
        warehouseLocation: string;
      }>>`
        SELECT id, "productName", sku, category, "unitPrice", "currentStock", "minimumStock", "warehouseLocation"
        FROM "Product"
        WHERE "currentStock" <= "minimumStock"
        ORDER BY "currentStock" ASC
      `,

      // 2. Direct PostgreSQL aggregate calculation for total stock quantity and valuation
      prisma.$queryRaw<Array<{ totalStockQuantity: bigint | number; totalStockValue: number }>>`
        SELECT 
          COALESCE(SUM("currentStock"), 0) as "totalStockQuantity",
          COALESCE(SUM("currentStock" * "unitPrice"), 0) as "totalStockValue"
        FROM "Product"
      `,

      prisma.salesChallan.count(),
      prisma.salesChallan.count({ where: { status: 'DRAFT' } }),
      prisma.salesChallan.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.salesChallan.count({ where: { status: 'CANCELLED' } }),
      prisma.customerFollowUp.count(),
      prisma.customer.count({
        where: {
          followUpDate: {
            gte: todayStr,
          },
        },
      }),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          quantityChanged: true,
          movementType: true,
          reason: true,
          createdAt: true,
          product: { select: { productName: true, sku: true } },
          createdBy: { select: { name: true } },
        },
      }),
      prisma.salesChallan.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          challanNumber: true,
          totalAmount: true,
          totalQuantity: true,
          status: true,
          createdAt: true,
          customer: { select: { customerName: true, businessName: true } },
          createdBy: { select: { name: true } },
        },
      }),
    ]);

    const valuation = stockValuationResult[0] || { totalStockQuantity: 0, totalStockValue: 0 };
    const totalStockQuantity = Number(valuation.totalStockQuantity);
    const totalStockValue = Number(valuation.totalStockValue);

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        leads: leadCustomers,
        inactive: inactiveCustomers,
      },
      products: {
        total: totalProducts,
        totalStockQuantity,
        totalStockValue,
        totalValue: totalStockValue,
        lowStockCount: lowStockAlerts.length,
        lowStockAlerts,
      },
      challans: {
        total: totalChallans,
        draftCount: draftChallansCount,
        confirmedCount: confirmedChallansAggregate._count || 0,
        cancelledCount: cancelledChallansCount,
        totalRevenue: confirmedChallansAggregate._sum.totalAmount || 0,
      },
      followUps: {
        total: totalFollowUpsCount,
        dueCount: dueFollowUpsCount,
      },
      recentActivity: {
        stockLogs: recentStockLogs.map((log) => ({
          id: log.id,
          productName: log.product.productName,
          sku: log.product.sku,
          quantityChanged: log.quantityChanged,
          movementType: log.movementType,
          reason: log.reason,
          createdBy: log.createdBy.name,
          createdAt: log.createdAt,
        })),
        recentChallans: recentChallans.map((c) => ({
          id: c.id,
          challanNumber: c.challanNumber,
          customerName: c.customer.businessName || c.customer.customerName,
          totalAmount: c.totalAmount,
          totalQuantity: c.totalQuantity,
          status: c.status,
          createdBy: c.createdBy.name,
          createdAt: c.createdAt,
        })),
      },
    };
  }
}
