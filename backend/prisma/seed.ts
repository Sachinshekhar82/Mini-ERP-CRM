import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Mini ERP + CRM database...');

  // 1. Clean existing data
  await prisma.challanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovementLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users for all 4 required roles
  const defaultPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@company.com',
      password: defaultPassword,
      role: 'ADMIN',
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Sales Manager',
      email: 'sales@company.com',
      password: defaultPassword,
      role: 'SALES',
    },
  });

  const warehouse = await prisma.user.create({
    data: {
      name: 'Warehouse Lead',
      email: 'warehouse@company.com',
      password: defaultPassword,
      role: 'WAREHOUSE',
    },
  });

  const accounts = await prisma.user.create({
    data: {
      name: 'Accounts Officer',
      email: 'accounts@company.com',
      password: defaultPassword,
      role: 'ACCOUNTS',
    },
  });

  console.log('✅ Created 4 Role Users (Password: password123)');

  // 3. Create Sample Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Sharma',
      mobile: '+91 9876543210',
      email: 'rajesh@apexdistributors.com',
      businessName: 'Apex Distributors Pvt Ltd',
      gstNumber: '27AABCU9603R1ZN',
      type: 'DISTRIBUTOR',
      address: 'Plot 45, Industrial Area Phase 1, Mumbai, Maharashtra 400001',
      status: 'ACTIVE',
      followUpDate: '2026-08-15',
      notes: 'Key distributor for Western region. Monthly bulk buyer.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Priya Patel',
      mobile: '+91 9812345678',
      email: 'priya@metroretail.in',
      businessName: 'Metro Supermart Chain',
      gstNumber: '24AAACM1234F1Z5',
      type: 'WHOLESALE',
      address: '12 Commercial Complex, CG Road, Ahmedabad, Gujarat 380009',
      status: 'ACTIVE',
      followUpDate: '2026-08-12',
      notes: 'Interested in bulk orders of electronic components.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Amit Verma',
      mobile: '+91 9900112233',
      email: 'amit@vermahardware.com',
      businessName: 'Verma Hardware & Tools',
      gstNumber: '07AAACV9876E1Z2',
      type: 'RETAIL',
      address: '88 Chandni Chowk Market, New Delhi 110006',
      status: 'LEAD',
      followUpDate: '2026-08-18',
      notes: 'New lead requested price list for heavy machinery tools.',
    },
  });

  // Create Follow-up Notes
  await prisma.customerNote.create({
    data: {
      customerId: customer1.id,
      note: 'Discussed Q3 pricing tiers. Sent updated product catalog PDF.',
      createdBy: sales.name,
    },
  });

  await prisma.customerNote.create({
    data: {
      customerId: customer2.id,
      note: 'Confirmed purchase order #PO-402. Payment terms 30 days.',
      createdBy: sales.name,
    },
  });

  console.log('✅ Created 3 Customers with CRM Notes');

  // 4. Create Sample Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Industrial Heavy Duty Drill Machine 850W',
      sku: 'SKU-DRL-850',
      category: 'Power Tools',
      unitPrice: 3499.00,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Rack A-12, Warehouse 1',
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Ergonomic Executive Mesh Office Chair',
      sku: 'SKU-CHR-EXEC',
      category: 'Furniture',
      unitPrice: 6250.00,
      currentStock: 4, // Below alert limit!
      minStockAlert: 10,
      location: 'Section B, Warehouse 2',
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'Digital Multimeter & Circuit Tester Pro',
      sku: 'SKU-ELC-MMT',
      category: 'Electronics',
      unitPrice: 1150.00,
      currentStock: 120,
      minStockAlert: 25,
      location: 'Shelf C-04, Warehouse 1',
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      name: 'Stainless Steel Bolt Set (Pack of 500)',
      sku: 'SKU-FST-BLT500',
      category: 'Fasteners',
      unitPrice: 890.00,
      currentStock: 8, // Low stock alert!
      minStockAlert: 15,
      location: 'Bin 109, Warehouse 1',
    },
  });

  console.log('✅ Created 4 Products with Stock Levels & Alerts');

  // 5. Create Initial Stock Logs
  await prisma.stockMovementLog.createMany({
    data: [
      {
        productId: prod1.id,
        productName: prod1.name,
        quantityChanged: 50,
        movementType: 'IN',
        reason: 'Initial Stock Purchase Order #PO-1001',
        createdBy: warehouse.name,
      },
      {
        productId: prod2.id,
        productName: prod2.name,
        quantityChanged: 20,
        movementType: 'IN',
        reason: 'Vendor Shipment Received',
        createdBy: warehouse.name,
      },
      {
        productId: prod2.id,
        productName: prod2.name,
        quantityChanged: 16,
        movementType: 'OUT',
        reason: 'Damage/Defect Return',
        createdBy: warehouse.name,
      },
    ],
  });

  console.log('✅ Created Stock Movement Logs');

  // 6. Create Sample Sales Challans
  // Challan 1: Confirmed (Stock reduced)
  const challan1 = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0001',
      customerId: customer1.id,
      customerName: customer1.businessName,
      totalAmount: 3499.00 * 5, // 17495.00
      totalQuantity: 5,
      status: 'CONFIRMED',
      createdById: sales.id,
      createdByName: sales.name,
      notes: 'Dispatched via Express Logistics. Payment pending.',
      items: {
        create: [
          {
            productId: prod1.id,
            productName: prod1.name,
            sku: prod1.sku,
            unitPrice: prod1.unitPrice,
            quantity: 5,
            totalPrice: prod1.unitPrice * 5,
          },
        ],
      },
    },
  });

  // Challan 2: Draft
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0002',
      customerId: customer2.id,
      customerName: customer2.businessName,
      totalAmount: 1150.00 * 10 + 6250.00 * 2, // 11500 + 12500 = 24000
      totalQuantity: 12,
      status: 'DRAFT',
      createdById: sales.id,
      createdByName: sales.name,
      notes: 'Draft quotation under review by customer management.',
      items: {
        create: [
          {
            productId: prod3.id,
            productName: prod3.name,
            sku: prod3.sku,
            unitPrice: prod3.unitPrice,
            quantity: 10,
            totalPrice: 1150.00 * 10,
          },
          {
            productId: prod2.id,
            productName: prod2.name,
            sku: prod2.sku,
            unitPrice: prod2.unitPrice,
            quantity: 2,
            totalPrice: 6250.00 * 2,
          },
        ],
      },
    },
  });

  console.log('✅ Created Sample Sales Challans');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
