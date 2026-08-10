import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { loginSchema } from '../validators/authValidator';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', validateRequest(loginSchema), AuthController.login);

// GET /api/auth/me
router.get('/me', authenticateJWT, AuthController.me);

export default router;
