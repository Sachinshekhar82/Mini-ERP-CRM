import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

const customerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    mobile: z.string().min(10, 'Valid mobile number required'),
    email: z.string().email('Valid email required'),
    businessName: z.string().min(2, 'Business name required'),
    gstNumber: z.string().optional(),
    type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
    address: z.string().min(5, 'Address is required'),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
    followUpDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const noteSchema = z.object({
  body: z.object({
    note: z.string().min(2, 'Note content cannot be empty'),
  }),
});

// GET /api/customers (List with Search, Filter & Pagination)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const type = req.query.type as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { businessName: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { challans: true, followUpNotes: true } },
        },
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      data: customers,
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

// GET /api/customers/:id (Detail view)
router.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        followUpNotes: { orderBy: { createdAt: 'desc' } },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.json({ success: true, data: customer });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/customers (Add Customer)
router.post(
  '/',
  authenticateJWT,
  requireRole('ADMIN', 'SALES'),
  validateRequest(customerSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const customer = await prisma.customer.create({
        data: req.body,
      });

      return res.status(201).json({ success: true, data: customer });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/customers/:id (Edit Customer)
router.put(
  '/:id',
  authenticateJWT,
  requireRole('ADMIN', 'SALES'),
  async (req: AuthRequest, res: Response) => {
    try {
      const customer = await prisma.customer.update({
        where: { id: req.params.id },
        data: req.body,
      });

      return res.json({ success: true, data: customer });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/customers/:id (Delete Customer - Admin Only)
router.delete(
  '/:id',
  authenticateJWT,
  requireRole('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      await prisma.customer.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Helper for Follow-up Note Creation (handles both /notes and /follow-ups)
const addNoteHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { note } = req.body;
    const customerId = req.params.id;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const newNote = await prisma.customerNote.create({
      data: {
        customerId,
        note,
        createdBy: req.user?.name || 'Unknown User',
      },
    });

    return res.status(201).json({ success: true, data: newNote });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/customers/:id/notes & POST /api/customers/:id/follow-ups
router.post('/:id/notes', authenticateJWT, validateRequest(noteSchema), addNoteHandler);
router.post('/:id/follow-ups', authenticateJWT, validateRequest(noteSchema), addNoteHandler);

export default router;
