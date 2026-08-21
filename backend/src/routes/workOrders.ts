import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { WorkOrderService } from '../services/workOrderService';

const router = Router();

// GET /api/work-orders - List work orders (All authenticated roles)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const orders = await WorkOrderService.getWorkOrders();
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// POST /api/work-orders - Create work order (ADMIN Only as per Case Study specification!)
router.post('/', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { location, inventoryItemId, requiredQty, assignedUserId, notes } = req.body;
    const workOrder = await WorkOrderService.createWorkOrder({
      location,
      inventoryItemId,
      requiredQty: Number(requiredQty),
      assignedUserId,
      notes,
    });
    return res.status(201).json({ success: true, data: workOrder });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/work-orders/:id/status - Update work order status (ADMIN, OPERATIONS)
router.patch('/:id/status', authenticate, requireRole('ADMIN', 'OPERATIONS'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const workOrder = await WorkOrderService.updateWorkOrderStatus(req.params.id, status);
    return res.status(200).json({ success: true, data: workOrder });
  } catch (err) {
    next(err);
  }
});

export default router;
