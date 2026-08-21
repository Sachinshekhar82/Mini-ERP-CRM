import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { InternalTransferService } from '../services/internalTransferService';

const router = Router();

// GET /api/transfers - List internal transfers
router.get('/', authenticate, async (req, res, next) => {
  try {
    const transfers = await InternalTransferService.getTransfers();
    return res.status(200).json({ success: true, data: transfers });
  } catch (err) {
    next(err);
  }
});

// POST /api/transfers - Request internal stock transfer (ADMIN, OPERATIONS)
router.post('/', authenticate, requireRole('ADMIN', 'OPERATIONS'), async (req: AuthRequest, res, next) => {
  try {
    const { sourceLocation, destinationLocation, inventoryItemId, quantity } = req.body;
    const transfer = await InternalTransferService.createTransfer(
      {
        sourceLocation,
        destinationLocation,
        inventoryItemId,
        quantity: Number(quantity),
      },
      req.user!.id
    );
    return res.status(201).json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
});

// POST /api/transfers/:id/dispatch - Dispatch stock transfer (Reduces source stock) (ADMIN, OPERATIONS)
router.post('/:id/dispatch', authenticate, requireRole('ADMIN', 'OPERATIONS'), async (req, res, next) => {
  try {
    const transfer = await InternalTransferService.dispatchTransfer(req.params.id);
    return res.status(200).json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
});

// POST /api/transfers/:id/receive - Receive stock transfer (Increases destination stock) (ADMIN, OPERATIONS)
router.post('/:id/receive', authenticate, requireRole('ADMIN', 'OPERATIONS'), async (req, res, next) => {
  try {
    const transfer = await InternalTransferService.receiveTransfer(req.params.id);
    return res.status(200).json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
});

export default router;
