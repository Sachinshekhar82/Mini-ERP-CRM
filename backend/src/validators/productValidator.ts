import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    productName: z.string().min(2, 'Product name is required'),
    sku: z.string().min(2, 'SKU is required'),
    category: z.string().min(2, 'Category is required'),
    unitPrice: z.number().positive('Unit price must be greater than 0'),
    currentStock: z.number().int().nonnegative('Current stock cannot be negative'),
    minimumStock: z.number().int().nonnegative().default(5),
    warehouseLocation: z.string().min(2, 'Warehouse location is required'),
    imageUrl: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    productName: z.string().min(2).optional(),
    sku: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    unitPrice: z.number().positive().optional(),
    minimumStock: z.number().int().nonnegative().optional(),
    warehouseLocation: z.string().min(2).optional(),
    imageUrl: z.string().optional(),
  }),
});
