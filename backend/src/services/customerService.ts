import { prisma } from '../config/prisma';

export interface CustomerQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  customerType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CustomerService {
  static async getCustomers(options: CustomerQueryOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;
    const search = options.search?.trim() || '';
    const customerType = options.customerType;
    const status = options.status;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { customerName: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } },
        { businessName: { contains: search } },
        { gstNumber: { contains: search } },
      ];
    }

    if (customerType) {
      whereClause.customerType = customerType;
    }

    if (status) {
      whereClause.status = status;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          _count: { select: { challans: true, followUps: true } },
        },
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, name: true, email: true, role: true } } },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) {
      const error: any = new Error(`Customer with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return customer;
  }

  static async createCustomer(data: {
    customerName: string;
    mobile: string;
    email: string;
    businessName: string;
    gstNumber?: string;
    customerType: string;
    address: string;
    status?: string;
    followUpDate?: string;
    notes?: string;
  }) {
    // Check duplicate mobile or email if necessary
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [{ email: data.email }, { mobile: data.mobile }],
      },
    });

    if (existing) {
      if (existing.email === data.email) {
        const error: any = new Error(`Customer with email '${data.email}' already exists`);
        error.statusCode = 409;
        throw error;
      }
      if (existing.mobile === data.mobile) {
        const error: any = new Error(`Customer with mobile '${data.mobile}' already exists`);
        error.statusCode = 409;
        throw error;
      }
    }

    return prisma.customer.create({ data });
  }

  static async updateCustomer(
    id: string,
    data: Partial<{
      customerName: string;
      mobile: string;
      email: string;
      businessName: string;
      gstNumber: string;
      customerType: string;
      address: string;
      status: string;
      followUpDate: string;
      notes: string;
    }>
  ) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      const error: any = new Error(`Customer with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  static async deleteCustomer(id: string) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      const error: any = new Error(`Customer with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return prisma.customer.delete({ where: { id } });
  }

  static async addFollowUp(customerId: string, note: string, createdById: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      const error: any = new Error(`Customer with ID '${customerId}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return prisma.customerFollowUp.create({
      data: {
        customerId,
        note,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });
  }

  static async getFollowUps(customerId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      const error: any = new Error(`Customer with ID '${customerId}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return prisma.customerFollowUp.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });
  }
}
