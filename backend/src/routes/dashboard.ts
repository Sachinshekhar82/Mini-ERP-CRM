import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      leadCustomers,
      totalProducts,
      allProducts,
      totalChallans,
      confirmedChallans,
      recentStockLogs,
      recentChallans,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.customer.count({ where: { status: 'LEAD' } }),
      prisma.product.count(),
      prisma.product.findMany(),
      prisma.salesChallan.count(),
      prisma.salesChallan.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.stockMovementLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.salesChallan.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: { select: { name: true, businessName: true } } },
      }),
    ]);

    // Calculate Low Stock alerts & Inventory valuation
    const lowStockItems = allProducts.filter((p) => p.currentStock <= p.minStockAlert);
    const totalInventoryValue = allProducts.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0);

    return res.json({
      success: true,
      data: {
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          leads: leadCustomers,
        },
        products: {
          total: totalProducts,
          lowStockCount: lowStockItems.length,
          totalValue: totalInventoryValue,
          lowStockAlerts: lowStockItems,
        },
        challans: {
          total: totalChallans,
          confirmedCount: confirmedChallans._count || 0,
          totalRevenue: confirmedChallans._sum.totalAmount || 0,
        },
        recentActivity: {
          stockLogs: recentStockLogs,
          recentChallans,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
