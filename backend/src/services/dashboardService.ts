import { prisma } from '../config/prisma';

export class DashboardService {
  static async getStats() {
    const todayStr = new Date().toISOString().split('T')[0];

    // Parallelized query execution to prevent N+1 queries
    const [
      totalCustomers,
      activeCustomers,
      leadCustomers,
      inactiveCustomers,
      totalProducts,
      allProducts,
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
      prisma.product.findMany({
        select: {
          id: true,
          productName: true,
          sku: true,
          category: true,
          unitPrice: true,
          currentStock: true,
          minimumStock: true,
          warehouseLocation: true,
        },
      }),
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

    // Calculate product stock metrics in memory
    const lowStockAlerts = allProducts.filter((p) => p.currentStock <= p.minimumStock);
    const totalStockQuantity = allProducts.reduce((sum, p) => sum + p.currentStock, 0);
    const totalStockValue = allProducts.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0);

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
