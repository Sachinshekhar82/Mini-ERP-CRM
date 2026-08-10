import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { AuthRequest } from '../types/auth';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, category, lowStock, sortBy, sortOrder } = req.query;

      const result = await ProductService.getProducts({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        category: category as string,
        lowStock: lowStock === 'true',
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      return res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const createdById = req.user!.id;
      const product = await ProductService.createProduct(req.body, createdById);
      return res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const movements = await ProductService.getProductMovements(req.params.id);
      return res.status(200).json({
        success: true,
        data: movements,
      });
    } catch (error) {
      next(error);
    }
  }
}
