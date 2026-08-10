import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

const stockInSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    reason: z.string().min(2, 'Reason for stock IN is required'),
  }),
});

const stockOutSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    reason: z.string().min(2, 'Reason for stock OUT is required'),
  }),
});

const adjustStockSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    movementType: z.enum(['IN', 'OUT']),
    reason: z.string().min(2, 'Reason for adjustment is required'),
  }),
});

// Helper for Stock Adjustment
async function performStockAdjustment(
  productId: string,
  quantity: number,
  movementType: 'IN' | 'OUT',
  reason: string,
  userName: string,
  res: Response
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (movementType === 'OUT' && product.currentStock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock for product '${product.name}'. Current stock: ${product.currentStock}, Requested reduction: ${quantity}`,
    });
  }

  const newStock = movementType === 'IN' ? product.currentStock + quantity : product.currentStock - quantity;

  const [updatedProduct, log] = await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { currentStock: newStock },
    }),
    prisma.stockMovementLog.create({
      data: {
        productId,
        productName: product.name,
        quantityChanged: quantity,
        movementType,
        reason,
        createdBy: userName,
      },
    }),
  ]);

  return res.json({
    success: true,
    data: { product: updatedProduct, movementLog: log },
  });
}

// GET /api/stock/logs & GET /api/inventory/movements
const getMovementsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const productId = req.query.productId as string;

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (productId) whereClause.productId = productId;

    const [logs, total] = await Promise.all([
      prisma.stockMovementLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockMovementLog.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      data: logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.get('/logs', authenticateJWT, getMovementsHandler);
router.get('/movements', authenticateJWT, getMovementsHandler);

// POST /api/inventory/stock-in
router.post(
  '/stock-in',
  authenticateJWT,
  requireRole('ADMIN', 'WAREHOUSE'),
  validateRequest(stockInSchema),
  async (req: AuthRequest, res: Response) => {
    const { productId, quantity, reason } = req.body;
    return performStockAdjustment(productId, quantity, 'IN', reason, req.user?.name || 'Warehouse', res);
  }
);

// POST /api/inventory/stock-out
router.post(
  '/stock-out',
  authenticateJWT,
  requireRole('ADMIN', 'WAREHOUSE'),
  validateRequest(stockOutSchema),
  async (req: AuthRequest, res: Response) => {
    const { productId, quantity, reason } = req.body;
    return performStockAdjustment(productId, quantity, 'OUT', reason, req.user?.name || 'Warehouse', res);
  }
);

// POST /api/stock/adjust
router.post(
  '/adjust',
  authenticateJWT,
  requireRole('ADMIN', 'WAREHOUSE'),
  validateRequest(adjustStockSchema),
  async (req: AuthRequest, res: Response) => {
    const { productId, quantity, movementType, reason } = req.body;
    return performStockAdjustment(productId, quantity, movementType, reason, req.user?.name || 'Warehouse', res);
  }
);

export default router;
