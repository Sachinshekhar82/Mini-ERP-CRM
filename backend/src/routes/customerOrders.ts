import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { CustomerOrderService } from '../services/customerOrderService';

const router = Router();

// GET /api/customer-orders - List customer orders & reservations
router.get('/', authenticate, async (req, res, next) => {
  try {
    const orders = await CustomerOrderService.getCustomerOrders();
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// POST /api/customer-orders - Create customer order & reserve stock (ADMIN, SALES)
router.post('/', authenticate, requireRole('ADMIN', 'SALES'), async (req: AuthRequest, res, next) => {
  try {
    const { customerName, inventoryItemId, quantity } = req.body;
    const order = await CustomerOrderService.createOrderAndReserveStock(
      {
        customerName,
        inventoryItemId,
        quantity: Number(quantity),
      },
      req.user!.id
    );
    return res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// POST /api/customer-orders/:id/cancel - Cancel order and release reserved stock (ADMIN, SALES)
router.post('/:id/cancel', authenticate, requireRole('ADMIN', 'SALES'), async (req, res, next) => {
  try {
    const order = await CustomerOrderService.cancelOrderAndReleaseStock(req.params.id);
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

export default router;
