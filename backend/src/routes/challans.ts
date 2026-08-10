import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';
import { generateChallanPDF } from '../utils/pdfGenerator';

const router = Router();

const challanItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    status: z.enum(['DRAFT', 'CONFIRMED']).default('DRAFT'),
    notes: z.string().optional(),
    items: z.array(challanItemSchema).min(1, 'At least one product item is required'),
  }),
});

async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.salesChallan.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `CH-${year}-${nextNum}`;
}

// GET /api/challans (List Challans)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { challanNumber: { contains: search } },
        { customer: { businessName: { contains: search } } },
        { customer: { customerName: { contains: search } } },
      ];
    }
    if (status) whereClause.status = status;

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, customerName: true, businessName: true, email: true, mobile: true } },
          createdBy: { select: { name: true } },
          items: true,
        },
      }),
      prisma.salesChallan.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      data: challans,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/challans/:id
router.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const challan = await prisma.salesChallan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Sales challan not found' });
    }

    return res.json({ success: true, data: challan });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/challans
router.post(
  '/',
  authenticateJWT,
  requireRole('ADMIN', 'SALES'),
  validateRequest(createChallanSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { customerId, status, notes, items } = req.body;
      const userId = req.user!.id;

      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      const productIds = items.map((i: any) => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      for (const item of items) {
        if (!productMap.has(item.productId)) {
          return res.status(400).json({
            success: false,
            message: `Product with ID '${item.productId}' does not exist`,
          });
        }
      }

      if (status === 'CONFIRMED') {
        for (const item of items) {
          const product = productMap.get(item.productId)!;
          if (product.currentStock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Cannot confirm challan. Insufficient stock for product '${product.productName}' (${product.sku}). Available stock: ${product.currentStock}, Requested quantity: ${item.quantity}`,
            });
          }
        }
      }

      let totalAmount = 0;
      let totalQuantity = 0;

      const challanItemsData = items.map((item: any) => {
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

      const challanNumber = await generateChallanNumber();

      const result = await prisma.$transaction(async (tx) => {
        const challan = await tx.salesChallan.create({
          data: {
            challanNumber,
            customerId: customer.id,
            totalAmount,
            totalQuantity,
            status,
            createdById: userId,
            notes,
            items: {
              create: challanItemsData,
            },
          },
          include: { items: true },
        });

        if (status === 'CONFIRMED') {
          for (const item of items) {
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
                reason: `Sales Challan Issued #${challanNumber}`,
                createdById: userId,
              },
            });
          }
        }

        return challan;
      });

      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Helper for Confirming Challan
async function confirmChallanAction(challanId: string, userId: string, res: Response) {
  const existingChallan = await prisma.salesChallan.findUnique({
    where: { id: challanId },
    include: { items: { include: { product: true } } },
  });

  if (!existingChallan) {
    return res.status(404).json({ success: false, message: 'Sales challan not found' });
  }

  if (existingChallan.status === 'CONFIRMED') {
    return res.status(400).json({
      success: false,
      message: `Challan #${existingChallan.challanNumber} is already CONFIRMED. Duplicate confirmation is not allowed.`,
    });
  }

  if (existingChallan.status === 'CANCELLED') {
    return res.status(400).json({
      success: false,
      message: `Cannot confirm a CANCELLED challan.`,
    });
  }

  for (const item of existingChallan.items) {
    if (item.product.currentStock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm challan. Insufficient stock for product '${item.productNameSnapshot}' (${item.skuSnapshot}). Available stock: ${item.product.currentStock}, Requested quantity: ${item.quantity}`,
      });
    }
  }

  const updatedChallan = await prisma.$transaction(async (tx) => {
    const updated = await tx.salesChallan.update({
      where: { id: challanId },
      data: { status: 'CONFIRMED' },
      include: { items: true },
    });

    for (const item of existingChallan.items) {
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
          reason: `Confirmed Sales Challan #${existingChallan.challanNumber}`,
          createdById: userId,
        },
      });
    }

    return updated;
  });

  return res.json({ success: true, data: updatedChallan });
}

router.post(
  '/:id/confirm',
  authenticateJWT,
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  async (req: AuthRequest, res: Response) => {
    return confirmChallanAction(req.params.id, req.user!.id, res);
  }
);

router.post(
  '/:id/cancel',
  authenticateJWT,
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  async (req: AuthRequest, res: Response) => {
    try {
      const existingChallan = await prisma.salesChallan.findUnique({
        where: { id: req.params.id },
      });

      if (!existingChallan) {
        return res.status(404).json({ success: false, message: 'Sales challan not found' });
      }

      if (existingChallan.status === 'CONFIRMED') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a challan that is already CONFIRMED.',
        });
      }

      const cancelledChallan = await prisma.salesChallan.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' },
      });

      return res.json({ success: true, data: cancelledChallan });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.get('/:id/pdf', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const challan = await prisma.salesChallan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        createdBy: true,
        items: true,
      },
    });

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Sales challan not found' });
    }

    const pdfBuffer = await generateChallanPDF({
      challanNumber: challan.challanNumber,
      createdAt: challan.createdAt,
      status: challan.status,
      customerName: challan.customer.businessName || challan.customer.customerName,
      customerAddress: challan.customer.address,
      customerGst: challan.customer.gstNumber || undefined,
      createdByName: challan.createdBy.name,
      totalAmount: challan.totalAmount,
      totalQuantity: challan.totalQuantity,
      items: challan.items.map((i) => ({
        productName: i.productNameSnapshot,
        sku: i.skuSnapshot,
        unitPrice: i.unitPriceSnapshot,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
      })),
      notes: challan.notes,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Challan-${challan.challanNumber}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
