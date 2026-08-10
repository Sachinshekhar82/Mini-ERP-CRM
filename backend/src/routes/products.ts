import { Router, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { prisma } from '../config/prisma';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const productSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    sku: z.string().min(2, 'SKU code is required'),
    category: z.string().min(2, 'Category is required'),
    unitPrice: z.number().positive('Price must be greater than 0'),
    currentStock: z.number().int().nonnegative('Stock cannot be negative'),
    minStockAlert: z.number().int().nonnegative().default(5),
    location: z.string().min(2, 'Warehouse location is required'),
    imageUrl: z.string().optional(),
  }),
});

// GET /api/products (List with search, filter, pagination)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const category = req.query.category as string;
    const lowStockOnly = req.query.lowStock === 'true';

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (category) whereClause.category = category;

    const [allProducts, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    let products = allProducts;
    if (lowStockOnly) {
      products = products.filter((p) => p.currentStock <= p.minStockAlert);
    }

    const paginatedProducts = products.slice(skip, skip + limit);

    return res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        total: lowStockOnly ? products.length : totalCount,
        page,
        limit,
        totalPages: Math.ceil((lowStockOnly ? products.length : totalCount) / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id (Get single product)
router.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        stockLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id/stock-movements (Product specific stock logs)
router.get('/:id/stock-movements', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.stockMovementLog.findMany({
      where: { productId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products (Add product - Admin/Warehouse)
router.post(
  '/',
  authenticateJWT,
  requireRole('ADMIN', 'WAREHOUSE'),
  validateRequest(productSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, sku, category, unitPrice, currentStock, minStockAlert, location, imageUrl } = req.body;

      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku) {
        return res.status(409).json({ success: false, message: `Product SKU '${sku}' already exists` });
      }

      const product = await prisma.product.create({
        data: {
          name,
          sku,
          category,
          unitPrice,
          currentStock,
          minStockAlert,
          location,
          imageUrl,
        },
      });

      if (currentStock > 0) {
        await prisma.stockMovementLog.create({
          data: {
            productId: product.id,
            productName: product.name,
            quantityChanged: currentStock,
            movementType: 'IN',
            reason: 'Initial Product Stock Setup',
            createdBy: req.user?.name || 'System',
          },
        });
      }

      return res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/products/:id (Edit product)
router.put(
  '/:id',
  authenticateJWT,
  requireRole('ADMIN', 'WAREHOUSE'),
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await prisma.product.update({
        where: { id: req.params.id },
        data: req.body,
      });

      return res.json({ success: true, data: product });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/products/:id (Delete product - Admin Only)
router.delete(
  '/:id',
  authenticateJWT,
  requireRole('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      await prisma.product.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/products/upload-image (Upload image)
router.post(
  '/upload-image',
  authenticateJWT,
  requireRole('ADMIN', 'WAREHOUSE'),
  upload.single('image'),
  (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      imageUrl,
      message: 'Product image uploaded successfully',
    });
  }
);

export default router;
