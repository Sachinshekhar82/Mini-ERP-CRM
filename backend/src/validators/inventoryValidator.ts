import { z } from 'zod';

export const stockInSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be a positive integer greater than 0'),
    reason: z.string().min(2, 'Reason for stock IN is required'),
  }),
});

export const stockOutSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be a positive integer greater than 0'),
    reason: z.string().min(2, 'Reason for stock OUT is required'),
  }),
});
