import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export class WorkOrderService {
  static async getWorkOrders() {
    return prisma.workOrder.findMany({
      include: {
        inventoryItem: true,
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createWorkOrder(data: {
    location: string;
    inventoryItemId: string;
    requiredQty: number;
    assignedUserId: string;
    notes?: string;
  }) {
    if (data.requiredQty <= 0) {
      throw new ApiError(400, 'Required quantity must be greater than zero');
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: data.inventoryItemId },
    });

    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }

    const assignedUser = await prisma.user.findUnique({
      where: { id: data.assignedUserId },
    });

    if (!assignedUser) {
      throw new ApiError(404, 'Assigned user not found');
    }

    // Auto-calculate material shortage: max(0, requiredQty - availableQty)
    const shortageQty = Math.max(0, data.requiredQty - item.availableQty);

    const count = await prisma.workOrder.count();
    const workOrderNumber = `WO-2026-${String(count + 1).padStart(4, '0')}`;

    return prisma.workOrder.create({
      data: {
        workOrderNumber,
        location: data.location,
        inventoryItemId: data.inventoryItemId,
        requiredQty: data.requiredQty,
        shortageQty,
        assignedUserId: data.assignedUserId,
        status: 'ASSIGNED',
        notes: data.notes,
      },
      include: {
        inventoryItem: true,
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  static async updateWorkOrderStatus(id: string, status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED') {
    const wo = await prisma.workOrder.findUnique({ where: { id } });
    if (!wo) {
      throw new ApiError(404, 'Work order not found');
    }

    return prisma.workOrder.update({
      where: { id },
      data: { status },
      include: {
        inventoryItem: true,
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }
}
