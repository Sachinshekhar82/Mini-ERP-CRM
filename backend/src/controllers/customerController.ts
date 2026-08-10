import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService';
import { AuthRequest } from '../types/auth';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, customerType, status, sortBy, sortOrder } = req.query;

      const result = await CustomerService.getCustomers({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        customerType: customerType as string,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      return res.status(200).json({
        success: true,
        data: result.customers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      return res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await CustomerService.deleteCustomer(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async addFollowUp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.params.id;
      const { note } = req.body;
      const createdById = req.user!.id;

      const followUp = await CustomerService.addFollowUp(customerId, note, createdById);
      return res.status(201).json({
        success: true,
        data: followUp,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.params.id;
      const followUps = await CustomerService.getFollowUps(customerId);
      return res.status(200).json({
        success: true,
        data: followUps,
      });
    } catch (error) {
      next(error);
    }
  }
}
