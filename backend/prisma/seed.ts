import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL Database with Clean Single Credentials Set...');

  // Remove any legacy demo accounts if present
  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: '@demo.com',
      },
    },
  });

  // Create Users for all 4 required roles with secure bcrypt password hashing
  const hashedPassword = await bcrypt.hash('password123', 10);

  const companyUsers = [
    { name: 'System Admin', email: 'admin@company.com', role: 'ADMIN' },
    { name: 'Sales Manager', email: 'sales@company.com', role: 'SALES' },
    { name: 'Warehouse Supervisor', email: 'warehouse@company.com', role: 'WAREHOUSE' },
    { name: 'Accounts Officer', email: 'accounts@company.com', role: 'ACCOUNTS' },
  ];

  const userRecords: Record<string, any> = {};

  for (const u of companyUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword, role: u.role, name: u.name },
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
      },
    });
    userRecords[u.email] = user;
  }

  const admin = userRecords['admin@company.com'];
  const sales = userRecords['sales@company.com'];
  const warehouse = userRecords['warehouse@company.com'];
  const accounts = userRecords['accounts@company.com'];

  console.log('✅ Seeded Clean 4 User Roles (admin@company.com, sales@company.com, warehouse@company.com, accounts@company.com)');

  // 2. Idempotent Customer Upserts
  const customerData = [
    {
      customerName: 'Rajesh Sharma',
      mobile: '+91 9876543210',
      email: 'rajesh@apexdistributors.com',
      businessName: 'Apex Distributors Pvt Ltd',
      gstNumber: '27AABCU9603R1ZN',
      customerType: 'DISTRIBUTOR',
      address: 'Plot 45, Industrial Area Phase 1, Mumbai, Maharashtra 400001',
      status: 'ACTIVE',
      followUpDate: '2026-08-15',
      notes: 'Key distributor for Western region. Monthly bulk buyer.',
    },
    {
      customerName: 'Priya Patel',
      mobile: '+91 9812345678',
      email: 'priya@metroretail.in',
      businessName: 'Metro Supermart Chain',
      gstNumber: '24AAACM1234F1Z5',
      customerType: 'WHOLESALE',
      address: '12 Commercial Complex, CG Road, Ahmedabad, Gujarat 380009',
      status: 'ACTIVE',
      followUpDate: '2026-08-12',
      notes: 'Interested in bulk orders of electronic components.',
    },
    {
      customerName: 'Amit Verma',
      mobile: '+91 9900112233',
      email: 'amit@vermahardware.com',
      businessName: 'Verma Hardware & Tools',
      gstNumber: '07AAACV9876E1Z2',
      customerType: 'RETAIL',
      address: '88 Chandni Chowk Market, New Delhi 110006',
      status: 'LEAD',
      followUpDate: '2026-08-18',
      notes: 'New lead requested price list for heavy machinery tools.',
    },
    {
      customerName: 'Suresh Menon',
      mobile: '+91 9845098765',
      email: 'suresh@southerntraders.co.in',
      businessName: 'Southern Traders Enterprises',
      gstNumber: '33AABCS4321D1Z9',
      customerType: 'DISTRIBUTOR',
      address: '104 Mount Road, Chennai, Tamil Nadu 600002',
      status: 'ACTIVE',
      followUpDate: '2026-08-22',
      notes: 'Quarterly supply agreement signed.',
    },
    {
      customerName: 'Neha Gupta',
      mobile: '+91 9711223344',
      email: 'neha@gupta-electricals.com',
      businessName: 'Gupta Electricals & Switchgears',
      gstNumber: '09AAACG1122H1Z1',
      customerType: 'WHOLESALE',
      address: '55 Mall Road, Kanpur, Uttar Pradesh 208001',
      status: 'ACTIVE',
      followUpDate: '2026-08-14',
      notes: 'Regular buyer of test equipment and wiring accessories.',
    },
    {
      customerName: 'Vikram Singh',
      mobile: '+91 9829012345',
      email: 'vikram@rajasthantools.com',
      businessName: 'Rajasthan Industrial Tools',
      gstNumber: '08AAACR5566K1Z4',
      customerType: 'WHOLESALE',
      address: '23 MI Road, Jaipur, Rajasthan 302001',
      status: 'LEAD',
      followUpDate: '2026-08-25',
      notes: 'Requested sample demo for cordless drill machines.',
    },
    {
      customerName: 'Kavita Reddy',
      mobile: '+91 9988776655',
      email: 'kavita@deccanhardware.in',
      businessName: 'Deccan Hardware Mart',
      gstNumber: '36AAACD9988P1Z7',
      customerType: 'RETAIL',
      address: '401 Hitech City Main Rd, Hyderabad, Telangana 500081',
      status: 'ACTIVE',
      followUpDate: '2026-08-19',
      notes: 'High frequency buyer for fasteners and safety equipment.',
    },
    {
      customerName: 'Manish Banerjee',
      mobile: '+91 9830054321',
      email: 'manish@bengalindustrial.com',
      businessName: 'Bengal Industrial Supplies',
      gstNumber: '19AAACB7788L1Z3',
      customerType: 'DISTRIBUTOR',
      address: '14 Park Street, Kolkata, West Bengal 700016',
      status: 'ACTIVE',
      followUpDate: '2026-08-28',
      notes: 'Bulk distributor for Eastern region.',
    },
    {
      customerName: 'Anil Kapoor',
      mobile: '+91 9819033445',
      email: 'anil@kapoorsafety.com',
      businessName: 'Kapoor Safety Wear & Gear',
      gstNumber: '27AAACK4433J1Z8',
      customerType: 'RETAIL',
      address: '90 Thane Belapur Rd, Navi Mumbai 400705',
      status: 'INACTIVE',
      followUpDate: '2026-09-01',
      notes: 'Account currently inactive due to store renovation.',
    },
    {
      customerName: 'Rohan Joshi',
      mobile: '+91 9822334455',
      email: 'rohan@joshimuchinery.com',
      businessName: 'Joshi Machinery Solutions',
      gstNumber: '27AAACJ2233M1Z6',
      customerType: 'DISTRIBUTOR',
      address: '66 Tilak Road, Pune, Maharashtra 411030',
      status: 'ACTIVE',
      followUpDate: '2026-08-16',
      notes: 'Interested in becoming exclusive regional distributor.',
    },
  ];

  const createdCustomers = [];
  for (const c of customerData) {
    const existing = await prisma.customer.findFirst({ where: { email: c.email } });
    if (existing) {
      createdCustomers.push(existing);
    } else {
      const cust = await prisma.customer.create({ data: c });
      createdCustomers.push(cust);
    }
  }

  console.log('✅ Seeded 10 Realistic Customers');

  // 3. Idempotent Customer Follow Ups
  const existingFollowUps = await prisma.customerFollowUp.count();
  if (existingFollowUps === 0) {
    await prisma.customerFollowUp.createMany({
      data: [
        { customerId: createdCustomers[0].id, note: 'Discussed Q3 pricing tiers. Sent updated product catalog PDF.', createdById: sales.id },
        { customerId: createdCustomers[1].id, note: 'Confirmed purchase order #PO-402. Payment terms 30 days.', createdById: sales.id },
        { customerId: createdCustomers[2].id, note: 'Initial phone call completed. Quotation requested for 20 drill machines.', createdById: sales.id },
      ],
    });
  }

  // 4. Idempotent Product Upserts
  const productData = [
    { productName: 'Industrial Heavy Duty Drill Machine 850W', sku: 'SKU-DRL-850', category: 'Power Tools', unitPrice: 3499.00, currentStock: 45, minimumStock: 10, warehouseLocation: 'Rack A-12, Warehouse 1' },
    { productName: 'Ergonomic Executive Mesh Office Chair', sku: 'SKU-CHR-EXEC', category: 'Furniture', unitPrice: 6250.00, currentStock: 3, minimumStock: 10, warehouseLocation: 'Section B, Warehouse 2' },
    { productName: 'Digital Multimeter & Circuit Tester Pro', sku: 'SKU-ELC-MMT', category: 'Electronics', unitPrice: 1150.00, currentStock: 120, minimumStock: 25, warehouseLocation: 'Shelf C-04, Warehouse 1' },
    { productName: 'Stainless Steel Bolt Set (Pack of 500)', sku: 'SKU-FST-BLT500', category: 'Fasteners', unitPrice: 890.00, currentStock: 8, minimumStock: 15, warehouseLocation: 'Bin 109, Warehouse 1' },
    { productName: 'Cordless Angle Grinder 20V Max', sku: 'SKU-GRND-20V', category: 'Power Tools', unitPrice: 4850.00, currentStock: 25, minimumStock: 5, warehouseLocation: 'Rack A-14, Warehouse 1' },
    { productName: 'Heavy Duty Rotary Hammer Drill 1000W', sku: 'SKU-DRL-1000H', category: 'Power Tools', unitPrice: 7200.00, currentStock: 18, minimumStock: 5, warehouseLocation: 'Rack A-15, Warehouse 1' },
    { productName: 'Industrial Safety Helmet & Visor', sku: 'SKU-SFT-HLMT', category: 'Safety Gear', unitPrice: 450.00, currentStock: 200, minimumStock: 30, warehouseLocation: 'Shelf S-01, Warehouse 2' },
    { productName: 'Steel Toe Work Boots Size 9', sku: 'SKU-SFT-BOOT9', category: 'Safety Gear', unitPrice: 1850.00, currentStock: 40, minimumStock: 10, warehouseLocation: 'Shelf S-05, Warehouse 2' },
    { productName: 'Pneumatic Impact Wrench Kit 1/2 Inch', sku: 'SKU-PNM-WRENCH', category: 'Power Tools', unitPrice: 5900.00, currentStock: 12, minimumStock: 5, warehouseLocation: 'Rack A-18, Warehouse 1' },
    { productName: 'Brass Gate Valve 2 Inch Industrial', sku: 'SKU-PLM-VALVE2', category: 'Plumbing', unitPrice: 1250.00, currentStock: 60, minimumStock: 15, warehouseLocation: 'Bin P-30, Warehouse 2' },
    { productName: 'PVC Pressure Pipe 3 Meter (Pack of 10)', sku: 'SKU-PLM-PVC3M', category: 'Plumbing', unitPrice: 2100.00, currentStock: 35, minimumStock: 10, warehouseLocation: 'Outdoor Yard B, Warehouse 2' },
    { productName: 'Laser Distance Meter 100m Range', sku: 'SKU-ELC-LASER100', category: 'Electronics', unitPrice: 2990.00, currentStock: 2, minimumStock: 8, warehouseLocation: 'Shelf C-10, Warehouse 1' },
    { productName: 'Modular Worktable Steel Frame', sku: 'SKU-FUR-WRKTBL', category: 'Furniture', unitPrice: 8900.00, currentStock: 15, minimumStock: 3, warehouseLocation: 'Section B, Warehouse 2' },
    { productName: 'M10 Hex Nuts Zinc Plated (Pack of 1000)', sku: 'SKU-FST-NUT1000', category: 'Fasteners', unitPrice: 650.00, currentStock: 150, minimumStock: 20, warehouseLocation: 'Bin 112, Warehouse 1' },
    { productName: 'Heavy Duty Extension Cable 25M', sku: 'SKU-ELC-EXT25M', category: 'Electronics', unitPrice: 1450.00, currentStock: 50, minimumStock: 10, warehouseLocation: 'Shelf C-12, Warehouse 1' },
  ];

  const createdProducts = [];
  for (const p of productData) {
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      update: { productName: p.productName, category: p.category, unitPrice: p.unitPrice, warehouseLocation: p.warehouseLocation },
      create: p,
    });
    createdProducts.push(prod);
  }

  console.log('✅ Seeded 15 Realistic Products');

  // 5. Initial Stock Movements
  const existingMovements = await prisma.stockMovement.count();
  if (existingMovements === 0) {
    await prisma.stockMovement.createMany({
      data: [
        { productId: createdProducts[0].id, quantityChanged: 50, movementType: 'IN', reason: 'Purchase Order #PO-1001', createdById: warehouse.id },
        { productId: createdProducts[1].id, quantityChanged: 20, movementType: 'IN', reason: 'Vendor Shipment Received', createdById: warehouse.id },
        { productId: createdProducts[1].id, quantityChanged: 17, movementType: 'OUT', reason: 'Damaged Stock Return', createdById: warehouse.id },
        { productId: createdProducts[2].id, quantityChanged: 120, movementType: 'IN', reason: 'Initial Inventory Setup', createdById: warehouse.id },
      ],
    });
    console.log('✅ Seeded Stock Movements');
  }

  // 6. Initial Sales Challans
  const existingChallans = await prisma.salesChallan.count();
  if (existingChallans === 0) {
    await prisma.salesChallan.create({
      data: {
        challanNumber: 'CH-2026-0001',
        customerId: createdCustomers[0].id,
        totalAmount: 3499.00 * 5,
        totalQuantity: 5,
        status: 'CONFIRMED',
        createdById: sales.id,
        notes: 'Express dispatch via Rivigo Logistics.',
        items: {
          create: [
            {
              productId: createdProducts[0].id,
              productNameSnapshot: createdProducts[0].productName,
              skuSnapshot: createdProducts[0].sku,
              unitPriceSnapshot: createdProducts[0].unitPrice,
              quantity: 5,
              totalPrice: 3499.00 * 5,
            },
          ],
        },
      },
    });

    await prisma.salesChallan.create({
      data: {
        challanNumber: 'CH-2026-0002',
        customerId: createdCustomers[1].id,
        totalAmount: 1150.00 * 10 + 6250.00 * 2,
        totalQuantity: 12,
        status: 'DRAFT',
        createdById: sales.id,
        notes: 'Draft quote pending customer approval.',
        items: {
          create: [
            {
              productId: createdProducts[2].id,
              productNameSnapshot: createdProducts[2].productName,
              skuSnapshot: createdProducts[2].sku,
              unitPriceSnapshot: createdProducts[2].unitPrice,
              quantity: 10,
              totalPrice: 1150.00 * 10,
            },
            {
              productId: createdProducts[1].id,
              productNameSnapshot: createdProducts[1].productName,
              skuSnapshot: createdProducts[1].sku,
              unitPriceSnapshot: createdProducts[1].unitPrice,
              quantity: 2,
              totalPrice: 6250.00 * 2,
            },
          ],
        },
      },
    });
    console.log('✅ Seeded Sales Challans with Product Snapshot Fields');
  }

  console.log('🎉 Clean Single Credentials PostgreSQL Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
