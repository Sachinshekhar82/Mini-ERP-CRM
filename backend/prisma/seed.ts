import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Mini ERP + CRM database with expanded realistic data...');

  // 1. Clean existing records in reverse dependency order
  await prisma.challanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovementLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users for all 4 required roles
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@company.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Sales Manager',
      email: 'sales@company.com',
      password: hashedPassword,
      role: 'SALES',
    },
  });

  const warehouse = await prisma.user.create({
    data: {
      name: 'Warehouse Supervisor',
      email: 'warehouse@company.com',
      password: hashedPassword,
      role: 'WAREHOUSE',
    },
  });

  const accounts = await prisma.user.create({
    data: {
      name: 'Accounts Executive',
      email: 'accounts@company.com',
      password: hashedPassword,
      role: 'ACCOUNTS',
    },
  });

  console.log('✅ Seeded 4 User Roles (Password: password123)');

  // 3. Create 10+ Customers
  const customerData = [
    {
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
    {
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
    {
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
    {
      name: 'Suresh Menon',
      mobile: '+91 9845098765',
      email: 'suresh@southerntraders.co.in',
      businessName: 'Southern Traders Enterprises',
      gstNumber: '33AABCS4321D1Z9',
      type: 'DISTRIBUTOR',
      address: '104 Mount Road, Chennai, Tamil Nadu 600002',
      status: 'ACTIVE',
      followUpDate: '2026-08-22',
      notes: 'Quarterly supply agreement signed.',
    },
    {
      name: 'Neha Gupta',
      mobile: '+91 9711223344',
      email: 'neha@gupta-electricals.com',
      businessName: 'Gupta Electricals & Switchgears',
      gstNumber: '09AAACG1122H1Z1',
      type: 'WHOLESALE',
      address: '55 Mall Road, Kanpur, Uttar Pradesh 208001',
      status: 'ACTIVE',
      followUpDate: '2026-08-14',
      notes: 'Regular buyer of test equipment and wiring accessories.',
    },
    {
      name: 'Vikram Singh',
      mobile: '+91 9829012345',
      email: 'vikram@rajasthantools.com',
      businessName: 'Rajasthan Industrial Tools',
      gstNumber: '08AAACR5566K1Z4',
      type: 'WHOLESALE',
      address: '23 MI Road, Jaipur, Rajasthan 302001',
      status: 'LEAD',
      followUpDate: '2026-08-25',
      notes: 'Requested sample demo for cordless drill machines.',
    },
    {
      name: 'Kavita Reddy',
      mobile: '+91 9988776655',
      email: 'kavita@deccanhardware.in',
      businessName: 'Deccan Hardware Mart',
      gstNumber: '36AAACD9988P1Z7',
      type: 'RETAIL',
      address: '401 Hitech City Main Rd, Hyderabad, Telangana 500081',
      status: 'ACTIVE',
      followUpDate: '2026-08-19',
      notes: 'High frequency buyer for fasteners and safety equipment.',
    },
    {
      name: 'Manish Banerjee',
      mobile: '+91 9830054321',
      email: 'manish@bengalindustrial.com',
      businessName: 'Bengal Industrial Supplies',
      gstNumber: '19AAACB7788L1Z3',
      type: 'DISTRIBUTOR',
      address: '14 Park Street, Kolkata, West Bengal 700016',
      status: 'ACTIVE',
      followUpDate: '2026-08-28',
      notes: 'Bulk distributor for Eastern region.',
    },
    {
      name: 'Anil Kapoor',
      mobile: '+91 9819033445',
      email: 'anil@kapoorsafety.com',
      businessName: 'Kapoor Safety Wear & Gear',
      gstNumber: '27AAACK4433J1Z8',
      type: 'RETAIL',
      address: '90 Thane Belapur Rd, Navi Mumbai 400705',
      status: 'INACTIVE',
      followUpDate: '2026-09-01',
      notes: 'Account currently inactive due to store renovation.',
    },
    {
      name: 'Rohan Joshi',
      mobile: '+91 9822334455',
      email: 'rohan@joshimuchinery.com',
      businessName: 'Joshi Machinery Solutions',
      gstNumber: '27AAACJ2233M1Z6',
      type: 'DISTRIBUTOR',
      address: '66 Tilak Road, Pune, Maharashtra 411030',
      status: 'ACTIVE',
      followUpDate: '2026-08-16',
      notes: 'Interested in becoming exclusive regional distributor.',
    },
  ];

  const createdCustomers = [];
  for (const c of customerData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }

  console.log('✅ Seeded 10 Customers with CRM details');

  // Add initial follow-up notes
  await prisma.customerNote.createMany({
    data: [
      { customerId: createdCustomers[0].id, note: 'Discussed Q3 pricing tiers. Sent updated product catalog PDF.', createdBy: sales.name },
      { customerId: createdCustomers[1].id, note: 'Confirmed purchase order #PO-402. Payment terms 30 days.', createdBy: sales.name },
      { customerId: createdCustomers[2].id, note: 'Initial phone call completed. Quotation requested for 20 drill machines.', createdBy: sales.name },
    ],
  });

  // 4. Create 15+ Products across multiple categories
  const productData = [
    { name: 'Industrial Heavy Duty Drill Machine 850W', sku: 'SKU-DRL-850', category: 'Power Tools', unitPrice: 3499.00, currentStock: 45, minStockAlert: 10, location: 'Rack A-12, Warehouse 1' },
    { name: 'Ergonomic Executive Mesh Office Chair', sku: 'SKU-CHR-EXEC', category: 'Furniture', unitPrice: 6250.00, currentStock: 3, minStockAlert: 10, location: 'Section B, Warehouse 2' }, // Low stock!
    { name: 'Digital Multimeter & Circuit Tester Pro', sku: 'SKU-ELC-MMT', category: 'Electronics', unitPrice: 1150.00, currentStock: 120, minStockAlert: 25, location: 'Shelf C-04, Warehouse 1' },
    { name: 'Stainless Steel Bolt Set (Pack of 500)', sku: 'SKU-FST-BLT500', category: 'Fasteners', unitPrice: 890.00, currentStock: 8, minStockAlert: 15, location: 'Bin 109, Warehouse 1' }, // Low stock!
    { name: 'Cordless Angle Grinder 20V Max', sku: 'SKU-GRND-20V', category: 'Power Tools', unitPrice: 4850.00, currentStock: 25, minStockAlert: 5, location: 'Rack A-14, Warehouse 1' },
    { name: 'Heavy Duty Rotary Hammer Drill 1000W', sku: 'SKU-DRL-1000H', category: 'Power Tools', unitPrice: 7200.00, currentStock: 18, minStockAlert: 5, location: 'Rack A-15, Warehouse 1' },
    { name: 'Industrial Safety Helmet & Visor', sku: 'SKU-SFT-HLMT', category: 'Safety Gear', unitPrice: 450.00, currentStock: 200, minStockAlert: 30, location: 'Shelf S-01, Warehouse 2' },
    { name: 'Steel Toe Work Boots Size 9', sku: 'SKU-SFT-BOOT9', category: 'Safety Gear', unitPrice: 1850.00, currentStock: 40, minStockAlert: 10, location: 'Shelf S-05, Warehouse 2' },
    { name: 'Pneumatic Impact Wrench Kit 1/2 Inch', sku: 'SKU-PNM-WRENCH', category: 'Power Tools', unitPrice: 5900.00, currentStock: 12, minStockAlert: 5, location: 'Rack A-18, Warehouse 1' },
    { name: 'Brass Gate Valve 2 Inch Industrial', sku: 'SKU-PLM-VALVE2', category: 'Plumbing', unitPrice: 1250.00, currentStock: 60, minStockAlert: 15, location: 'Bin P-30, Warehouse 2' },
    { name: 'PVC Pressure Pipe 3 Meter (Pack of 10)', sku: 'SKU-PLM-PVC3M', category: 'Plumbing', unitPrice: 2100.00, currentStock: 35, minStockAlert: 10, location: 'Outdoor Yard B, Warehouse 2' },
    { name: 'Laser Distance Meter 100m Range', sku: 'SKU-ELC-LASER100', category: 'Electronics', unitPrice: 2990.00, currentStock: 2, minStockAlert: 8, location: 'Shelf C-10, Warehouse 1' }, // Low stock!
    { name: 'Modular Worktable Steel Frame', sku: 'SKU-FUR-WRKTBL', category: 'Furniture', unitPrice: 8900.00, currentStock: 15, minStockAlert: 3, location: 'Section B, Warehouse 2' },
    { name: 'M10 Hex Nuts Zinc Plated (Pack of 1000)', sku: 'SKU-FST-NUT1000', category: 'Fasteners', unitPrice: 650.00, currentStock: 150, minStockAlert: 20, location: 'Bin 112, Warehouse 1' },
    { name: 'Heavy Duty Extension Cable 25M Heavy', sku: 'SKU-ELC-EXT25M', category: 'Electronics', unitPrice: 1450.00, currentStock: 50, minStockAlert: 10, location: 'Shelf C-12, Warehouse 1' },
  ];

  const createdProducts = [];
  for (const p of productData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }

  console.log('✅ Seeded 15 Products across 6 categories');

  // 5. Create Initial Stock Movement Logs
  await prisma.stockMovementLog.createMany({
    data: [
      { productId: createdProducts[0].id, productName: createdProducts[0].name, quantityChanged: 50, movementType: 'IN', reason: 'Purchase Order #PO-1001', createdBy: warehouse.name },
      { productId: createdProducts[1].id, productName: createdProducts[1].name, quantityChanged: 20, movementType: 'IN', reason: 'Vendor Shipment Received', createdBy: warehouse.name },
      { productId: createdProducts[1].id, productName: createdProducts[1].name, quantityChanged: 17, movementType: 'OUT', reason: 'Damaged Stock Return', createdBy: warehouse.name },
      { productId: createdProducts[2].id, productName: createdProducts[2].name, quantityChanged: 120, movementType: 'IN', reason: 'Initial Inventory Setup', createdBy: warehouse.name },
    ],
  });

  console.log('✅ Seeded Stock Movement Audit Logs');

  // 6. Create Sales Challans (Confirmed & Draft)
  const challan1 = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0001',
      customerId: createdCustomers[0].id,
      customerName: createdCustomers[0].businessName,
      totalAmount: 3499.00 * 5,
      totalQuantity: 5,
      status: 'CONFIRMED',
      createdById: sales.id,
      createdByName: sales.name,
      notes: 'Express dispatch via Rivigo Logistics.',
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            productName: createdProducts[0].name,
            sku: createdProducts[0].sku,
            unitPrice: createdProducts[0].unitPrice,
            quantity: 5,
            totalPrice: 3499.00 * 5,
          },
        ],
      },
    },
  });

  const challan2 = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0002',
      customerId: createdCustomers[1].id,
      customerName: createdCustomers[1].businessName,
      totalAmount: 1150.00 * 10 + 6250.00 * 2,
      totalQuantity: 12,
      status: 'DRAFT',
      createdById: sales.id,
      createdByName: sales.name,
      notes: 'Draft quote pending customer approval.',
      items: {
        create: [
          {
            productId: createdProducts[2].id,
            productName: createdProducts[2].name,
            sku: createdProducts[2].sku,
            unitPrice: createdProducts[2].unitPrice,
            quantity: 10,
            totalPrice: 1150.00 * 10,
          },
          {
            productId: createdProducts[1].id,
            productName: createdProducts[1].name,
            sku: createdProducts[1].sku,
            unitPrice: createdProducts[1].unitPrice,
            quantity: 2,
            totalPrice: 6250.00 * 2,
          },
        ],
      },
    },
  });

  console.log('✅ Seeded Sample Sales Challans');
  console.log('🎉 Extended seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
