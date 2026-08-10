import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']).optional(),
  }),
});

// GET /api/users (Admin Only - List users)
router.get('/', authenticateJWT, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users (Admin Only - Create user)
router.post(
  '/',
  authenticateJWT,
  requireRole('ADMIN'),
  validateRequest(createUserSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password, role } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, message: `Email '${email}' is already registered` });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      return res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/users/:id (Admin Only - Update user)
router.put(
  '/:id',
  authenticateJWT,
  requireRole('ADMIN'),
  validateRequest(updateUserSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password, role } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (password) updateData.password = await bcrypt.hash(password, 10);

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/users/:id (Admin Only - Delete user)
router.delete('/:id', authenticateJWT, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
