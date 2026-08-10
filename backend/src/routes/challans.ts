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

// Helper function to auto-generate Challan Number (CH-2026-0001)
async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.salesChallan.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `CH-${year}-${nextNum}`;
}

// GET /api/challans (List Challans with filtering & pagination)
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
        { customerName: { contains: search } },
        { createdByName: { contains: search } },
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
          customer: { select: { id: true, name: true, businessName: true, email: true, mobile: true } },
          items: true,
        },
      }),
      prisma.salesChallan.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      data: challans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/challans/:id (Get Single Challan Detail)
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

// POST /api/challans (Create Sales Challan)
router.post(
  '/',
  authenticateJWT,
  requireRole('ADMIN', 'SALES'),
  validateRequest(createChallanSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { customerId, status, notes, items } = req.body;
      const userId = req.user!.id;
      const userName = req.user!.name;

      // 1. Verify Customer
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      // 2. Fetch products & validate stock if status is CONFIRMED
      const productIds = items.map((i: any) => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // Verify all products exist
      for (const item of items) {
        if (!productMap.has(item.productId)) {
          return res.status(400).json({
            success: false,
            message: `Product with ID '${item.productId}' does not exist`,
          });
        }
      }

      // If creating as CONFIRMED, check inventory constraints
      if (status === 'CONFIRMED') {
        for (const item of items) {
          const product = productMap.get(item.productId)!;
          if (product.currentStock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for product '${product.name}' (${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`,
            });
          }
        }
      }

      // 3. Prepare item snapshot data & calculate totals
      let totalAmount = 0;
      let totalQuantity = 0;

      const challanItemsData = items.map((item: any) => {
        const product = productMap.get(item.productId)!;
        const lineTotal = product.unitPrice * item.quantity;
        totalAmount += lineTotal;
        totalQuantity += item.quantity;

        return {
          productId: product.id,
          productName: product.name, // Snapshot name
          sku: product.sku,         // Snapshot SKU
          unitPrice: product.unitPrice, // Snapshot price
          quantity: item.quantity,
          totalPrice: lineTotal,
        };
      });

      const challanNumber = await generateChallanNumber();

      // 4. Create Challan and update stock if CONFIRMED in an atomic transaction
      const result = await prisma.$transaction(async (tx) => {
        const challan = await tx.salesChallan.create({
          data: {
            challanNumber,
            customerId: customer.id,
            customerName: customer.businessName || customer.name,
            totalAmount,
            totalQuantity,
            status,
            createdById: userId,
            createdByName: userName,
            notes,
            items: {
              create: challanItemsData,
            },
          },
          include: { items: true },
        });

        // If CONFIRMED upon creation -> reduce stock & write movement logs
        if (status === 'CONFIRMED') {
          for (const item of items) {
            const product = productMap.get(item.productId)!;
            const updatedStock = product.currentStock - item.quantity;

            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: updatedStock },
            });

            await tx.stockMovementLog.create({
              data: {
                productId: product.id,
                productName: product.name,
                quantityChanged: item.quantity,
                movementType: 'OUT',
                reason: `Sales Challan Issued #${challanNumber}`,
                createdBy: userName,
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

// PUT /api/challans/:id/status (Update Challan Status e.g. DRAFT -> CONFIRMED or CANCELLED)
router.put(
  '/:id/status',
  authenticateJWT,
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { newStatus } = req.body;
      const challanId = req.params.id;
      const userName = req.user!.name;

      if (!['CONFIRMED', 'CANCELLED'].includes(newStatus)) {
        return res.status(400).json({ success: false, message: 'Status can only be updated to CONFIRMED or CANCELLED' });
      }

      const existingChallan = await prisma.salesChallan.findUnique({
        where: { id: challanId },
        include: { items: { include: { product: true } } },
      });

      if (!existingChallan) {
        return res.status(404).json({ success: false, message: 'Sales challan not found' });
      }

      if (existingChallan.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          message: `Cannot change status of a challan that is already '${existingChallan.status}'`,
        });
      }

      // If confirming, validate stock sufficiency for all items
      if (newStatus === 'CONFIRMED') {
        for (const item of existingChallan.items) {
          if (item.product.currentStock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Cannot confirm challan. Insufficient stock for '${item.productName}'. Current stock: ${item.product.currentStock}, Requested: ${item.quantity}`,
            });
          }
        }
      }

      // Execute status update and stock deduction atomically
      const updatedChallan = await prisma.$transaction(async (tx) => {
        const updated = await tx.salesChallan.update({
          where: { id: challanId },
          data: { status: newStatus },
          include: { items: true },
        });

        if (newStatus === 'CONFIRMED') {
          for (const item of existingChallan.items) {
            const newStock = item.product.currentStock - item.quantity;
            await tx.product.update({
              where: { id: item.productId },
              data: { currentStock: newStock },
            });

            await tx.stockMovementLog.create({
              data: {
                productId: item.productId,
                productName: item.productName,
                quantityChanged: item.quantity,
                movementType: 'OUT',
                reason: `Confirmed Sales Challan #${existingChallan.challanNumber}`,
                createdBy: userName,
              },
            });
          }
        }

        return updated;
      });

      return res.json({ success: true, data: updatedChallan });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/challans/:id/pdf (Export Invoice as PDF Bonus)
router.get('/:id/pdf', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const challan = await prisma.salesChallan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
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
      customerName: challan.customer.businessName || challan.customer.name,
      customerAddress: challan.customer.address,
      customerGst: challan.customer.gstNumber || undefined,
      createdByName: challan.createdByName,
      totalAmount: challan.totalAmount,
      totalQuantity: challan.totalQuantity,
      items: challan.items.map((i) => ({
        productName: i.productName,
        sku: i.sku,
        unitPrice: i.unitPrice,
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
