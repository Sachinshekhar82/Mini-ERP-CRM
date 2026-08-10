import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
    mobile: z.string().min(10, 'Valid 10-digit mobile number required'),
    email: z.string().email('Valid email address required'),
    businessName: z.string().min(2, 'Business name is required'),
    gstNumber: z.string().optional(),
    customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
    address: z.string().min(5, 'Address is required'),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
    followUpDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    customerName: z.string().min(2).optional(),
    mobile: z.string().min(10).optional(),
    email: z.string().email().optional(),
    businessName: z.string().min(2).optional(),
    gstNumber: z.string().optional(),
    customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).optional(),
    address: z.string().min(5).optional(),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
    followUpDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const addFollowUpSchema = z.object({
  body: z.object({
    note: z.string().min(2, 'Follow-up note content cannot be empty'),
  }),
});
