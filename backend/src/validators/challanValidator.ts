import { z } from 'zod';

const challanItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer greater than 0'),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    status: z.enum(['DRAFT', 'CONFIRMED']).default('DRAFT'),
    notes: z.string().optional(),
    items: z.array(challanItemInputSchema).min(1, 'At least one line item is required'),
  }),
});

export const updateChallanSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
    items: z.array(challanItemInputSchema).optional(),
  }),
});
