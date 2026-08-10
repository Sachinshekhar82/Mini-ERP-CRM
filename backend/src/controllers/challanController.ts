import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challanService';
import { AuthRequest } from '../types/auth';
import { generateChallanPDF } from '../utils/pdfGenerator';

export class ChallanController {
  static async getChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status, sortBy, sortOrder } = req.query;

      const result = await ChallanService.getChallans({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      return res.status(200).json({
        success: true,
        data: result.challans,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.getChallanById(req.params.id);
      return res.status(200).json({
        success: true,
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createChallan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const challan = await ChallanService.createChallan(req.body, userId);
      return res.status(201).json({
        success: true,
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateChallan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const challan = await ChallanService.updateChallan(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async confirmChallan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const challan = await ChallanService.confirmChallan(req.params.id, userId);
      return res.status(200).json({
        success: true,
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelChallan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.cancelChallan(req.params.id);
      return res.status(200).json({
        success: true,
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async generatePDF(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.getChallanById(req.params.id);

      const pdfBuffer = await generateChallanPDF({
        challanNumber: challan.challanNumber,
        createdAt: challan.createdAt,
        status: challan.status,
        customerName: challan.customer.businessName || challan.customer.customerName,
        customerAddress: challan.customer.address,
        customerGst: challan.customer.gstNumber || undefined,
        createdByName: challan.createdBy?.name || 'Sales Officer',
        totalAmount: challan.totalAmount,
        totalQuantity: challan.totalQuantity,
        items: challan.items.map((i) => ({
          productName: i.productNameSnapshot,
          sku: i.skuSnapshot,
          unitPrice: i.unitPriceSnapshot,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
        })),
        notes: challan.notes,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Challan-${challan.challanNumber}.pdf"`);
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
