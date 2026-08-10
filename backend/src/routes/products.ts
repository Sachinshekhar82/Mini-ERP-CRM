import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { createProductSchema, updateProductSchema } from '../validators/productValidator';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// GET /api/products (ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  ProductController.getProducts
);

// POST /api/products (ADMIN, WAREHOUSE)
router.post(
  '/',
  requireRole('ADMIN', 'WAREHOUSE'),
  validateRequest(createProductSchema),
  ProductController.createProduct
);

// GET /api/products/:id (ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get(
  '/:id',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  ProductController.getProductById
);

// PUT /api/products/:id (ADMIN, WAREHOUSE)
router.put(
  '/:id',
  requireRole('ADMIN', 'WAREHOUSE'),
  validateRequest(updateProductSchema),
  ProductController.updateProduct
);

// GET /api/products/:id/stock-movements (ADMIN, WAREHOUSE)
router.get(
  '/:id/stock-movements',
  requireRole('ADMIN', 'WAREHOUSE'),
  ProductController.getProductMovements
);

export default router;
