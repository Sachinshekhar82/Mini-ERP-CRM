import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL Database for Mini Operations ERP Case Study...');

  // 1. Clean existing records in reverse dependency order for clean seed
  await prisma.customerOrder.deleteMany();
  await prisma.internalTransfer.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users for all required roles with secure bcrypt password hashing
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { name: 'System Admin', email: 'admin@company.com', password: hashedPassword, role: 'ADMIN' },
  });

  const ops = await prisma.user.create({
    data: { name: 'Operations Manager', email: 'ops@company.com', password: hashedPassword, role: 'OPERATIONS' },
  });

  const sales = await prisma.user.create({
    data: { name: 'Sales Executive', email: 'sales@company.com', password: hashedPassword, role: 'SALES' },
  });

  const warehouse = await prisma.user.create({
    data: { name: 'Warehouse Supervisor', email: 'warehouse@company.com', password: hashedPassword, role: 'WAREHOUSE' },
  });

  const accounts = await prisma.user.create({
    data: { name: 'Accounts Officer', email: 'accounts@company.com', password: hashedPassword, role: 'ACCOUNTS' },
  });

  console.log('✅ Seeded 5 User Roles (ADMIN, OPERATIONS, SALES, WAREHOUSE, ACCOUNTS)');

  // 3. Seed Multi-Location Inventory Items
  const invA1 = await prisma.inventoryItem.create({
    data: {
      itemName: 'Heavy Duty Industrial Drill 850W',
      sku: 'SKU-DRL-850',
      category: 'Power Tools',
      location: 'Location A (Warehouse Main)',
      batch: 'BATCH-2026-01',
      physicalQty: 50,
      reservedQty: 10,
      availableQty: 40,
      unitPrice: 3500,
    },
  });

  const invB1 = await prisma.inventoryItem.create({
    data: {
      itemName: 'Heavy Duty Industrial Drill 850W',
      sku: 'SKU-DRL-850',
      category: 'Power Tools',
      location: 'Location B (Branch Depot)',
      batch: 'BATCH-2026-01',
      physicalQty: 20,
      reservedQty: 0,
      availableQty: 20,
      unitPrice: 3500,
    },
  });

  const invA2 = await prisma.inventoryItem.create({
    data: {
      itemName: 'Stainless Steel Fastener Bolts (Pack of 500)',
      sku: 'SKU-FST-BLT500',
      category: 'Fasteners',
      location: 'Location A (Warehouse Main)',
      batch: 'BATCH-2026-02',
      physicalQty: 15,
      reservedQty: 5,
      availableQty: 10,
      unitPrice: 890,
    },
  });

  const invB2 = await prisma.inventoryItem.create({
    data: {
      itemName: 'Digital Circuit Multimeter Pro',
      sku: 'SKU-ELC-MMT',
      category: 'Electronics',
      location: 'Location B (Branch Depot)',
      batch: 'BATCH-2026-03',
      physicalQty: 30,
      reservedQty: 0,
      availableQty: 30,
      unitPrice: 1150,
    },
  });

  console.log('✅ Seeded Multi-Location Inventory Items');

  // 4. Seed Work Orders (With Automatic Shortage Calculation)
  // Required: 50 drills at Location A (Available: 40) -> Shortage = 10!
  const wo1 = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'WO-2026-0001',
      location: 'Location A (Warehouse Main)',
      inventoryItemId: invA1.id,
      requiredQty: 50,
      shortageQty: Math.max(0, 50 - invA1.availableQty),
      assignedUserId: ops.id,
      status: 'ASSIGNED',
      notes: 'Assembly line 1 production run',
    },
  });

  const wo2 = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'WO-2026-0002',
      location: 'Location B (Branch Depot)',
      inventoryItemId: invB2.id,
      requiredQty: 10,
      shortageQty: Math.max(0, 10 - invB2.availableQty),
      assignedUserId: ops.id,
      status: 'IN_PROGRESS',
      notes: 'Electronics testing batch',
    },
  });

  console.log('✅ Seeded Work Orders with Calculated Shortages');

  // 5. Seed Internal Stock Transfers
  const tr1 = await prisma.internalTransfer.create({
    data: {
      transferNumber: 'TR-2026-0001',
      sourceLocation: 'Location B (Branch Depot)',
      destinationLocation: 'Location A (Warehouse Main)',
      inventoryItemId: invB1.id,
      quantity: 10,
      status: 'REQUESTED',
      createdById: ops.id,
    },
  });

  console.log('✅ Seeded Internal Stock Transfers');

  // 6. Seed Customer Orders & Reservations
  const ord1 = await prisma.customerOrder.create({
    data: {
      orderNumber: 'ORD-2026-0001',
      customerName: 'Apex Distributors Pvt Ltd',
      inventoryItemId: invA1.id,
      quantity: 10,
      status: 'RESERVED',
      createdById: sales.id,
    },
  });

  console.log('✅ Seeded Customer Orders & Reservations');
  console.log('🎉 Mini Operations ERP Case Study Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
