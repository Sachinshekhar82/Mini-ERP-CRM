import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../types/auth';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getCurrentUser(userId);
      return res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}
