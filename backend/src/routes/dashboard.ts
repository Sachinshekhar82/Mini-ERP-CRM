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
      prisma.stockMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { product: { select: { productName: true } }, createdBy: { select: { name: true } } },
      }),
      prisma.salesChallan.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: { select: { customerName: true, businessName: true } } },
      }),
    ]);

    const lowStockItems = allProducts.filter((p) => p.currentStock <= p.minimumStock);
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
          stockLogs: recentStockLogs.map((log) => ({
            id: log.id,
            productName: log.product.productName,
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
            status: c.status,
            createdAt: c.createdAt,
          })),
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
