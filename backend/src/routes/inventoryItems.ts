import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { InventoryItemService } from '../services/inventoryItemService';

const router = Router();

// GET /api/inventory-items - Get inventory items (All authenticated roles)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { search, location, category } = req.query;
    const items = await InventoryItemService.getInventoryItems({
      search: search as string,
      location: location as string,
      category: category as string,
    });
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory-items/:id - Get item details
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await InventoryItemService.getInventoryItemById(req.params.id);
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory-items - Create new inventory item (ADMIN, OPERATIONS, WAREHOUSE)
router.post('/', authenticate, requireRole('ADMIN', 'OPERATIONS', 'WAREHOUSE'), async (req, res, next) => {
  try {
    const item = await InventoryItemService.createInventoryItem(req.body);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

// PUT /api/inventory-items/:id/quantity - Update physical stock quantity (ADMIN, OPERATIONS, WAREHOUSE)
router.put('/:id/quantity', authenticate, requireRole('ADMIN', 'OPERATIONS', 'WAREHOUSE'), async (req, res, next) => {
  try {
    const { physicalQty } = req.body;
    const item = await InventoryItemService.updateInventoryQty(req.params.id, Number(physicalQty));
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

export default router;
