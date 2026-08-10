import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventoryService';
import { AuthRequest } from '../types/auth';

export class InventoryController {
  static async stockIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity, reason } = req.body;
      const userId = req.user!.id;
      const result = await InventoryService.stockIn(productId, quantity, reason, userId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async stockOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity, reason } = req.body;
      const userId = req.user!.id;
      const result = await InventoryService.stockOut(productId, quantity, reason, userId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, movementType, page, limit } = req.query;
      const result = await InventoryService.getMovements({
        productId: productId as string,
        movementType: movementType as 'IN' | 'OUT',
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      return res.status(200).json({
        success: true,
        data: result.movements,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
