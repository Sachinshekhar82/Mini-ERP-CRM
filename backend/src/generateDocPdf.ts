import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

async function generateDocumentationPdf() {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const outputPath = path.join(__dirname, '../../NEXORA_Mini_ERP_CRM_Documentation.pdf');
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  // Title & Header
  doc
    .fillColor('#4F46E5')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('NEXORA — Mini Operations ERP', { align: 'center' });
  
  doc
    .fillColor('#6B7280')
    .fontSize(11)
    .font('Helvetica')
    .text('Full-Stack Technical Case Study Documentation & Test Results', { align: 'center' })
    .moveDown(1.2);

  // Section 1: Live Deployment & Links
  doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('1. Live Deployment & Repository Links');
  doc.moveDown(0.4);

  const links = [
    ['🌐 Live Frontend URL:', 'https://mini-erp-crm-gray.vercel.app/'],
    ['📡 Live Backend API URL:', 'https://mini-erp-crm-puyn.onrender.com/'],
    ['📁 GitHub Repository:', 'https://github.com/Sachinshekhar82/Mini-ERP-CRM.git'],
    ['🩺 Health Check Endpoint:', 'https://mini-erp-crm-puyn.onrender.com/api/health'],
    ['📬 Postman Collection:', 'postman/Mini-ERP-CRM.postman_collection.json'],
  ];

  links.forEach(([label, value]) => {
    doc.fillColor('#374151').fontSize(9.5).font('Helvetica-Bold').text(label, { continued: true });
    doc.fillColor('#4F46E5').font('Helvetica').text(` ${value}`);
    doc.moveDown(0.25);
  });

  doc.moveDown(0.8);

  // Section 2: Demo Credentials
  doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('2. Pre-Seeded Access Credentials (All Roles)');
  doc.moveDown(0.4);

  const credentials = [
    ['ADMIN', 'admin@company.com', 'password123', 'Work Order creation, user admin, full permissions'],
    ['OPERATIONS', 'ops@company.com', 'password123', 'Inventory management, 2-phase stock transfers'],
    ['SALES', 'sales@company.com', 'password123', 'Customer orders, stock reservation, CRM'],
    ['WAREHOUSE', 'warehouse@company.com', 'password123', 'Catalog management & Stock IN/OUT'],
    ['ACCOUNTS', 'accounts@company.com', 'password123', 'Financial audit & Challan confirmation'],
  ];

  credentials.forEach(([role, email, pass, desc]) => {
    doc.fillColor('#4F46E5').fontSize(9.5).font('Helvetica-Bold').text(`• [${role}] `, { continued: true });
    doc.fillColor('#111827').font('Helvetica').text(`${email} | Pass: `, { continued: true });
    doc.fillColor('#059669').font('Helvetica-Bold').text(`${pass}`, { continued: true });
    doc.fillColor('#6B7280').font('Helvetica').text(` (${desc})`);
    doc.moveDown(0.25);
  });

  doc.moveDown(0.8);

  // Section 3: Recent Case Study Module Upgrades
  doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('3. Core Case Study Modules & Recent Technical Upgrades');
  doc.moveDown(0.4);

  const modules = [
    'Inventory Management: Multi-location tracking (Location A Main, Location B Branch), SKU, category, batch/lot numbers, physical quantity, reserved quantity, and calculated Available Quantity = Physical - Reserved. Prevents negative stock or over-allocation.',
    'Work Orders & Shortage Check: Admin Work Order creation with automatic material shortage calculation (shortage = max(0, requiredQty - availableQty)), assigned staff user, and status lifecycle (ASSIGNED -> IN_PROGRESS -> COMPLETED).',
    'Internal Stock Transfers (2-Phase): 2-phase stock transfer (REQUESTED -> DISPATCHED -> RECEIVED). Source physical stock reduces on Dispatch. Destination stock DOES NOT increase before Receipt. On Receipt, destination stock increases with double-receive protection.',
    'Customer Orders & Stock Reservation: Sales User order creation with atomic stock reservation inside a single prisma.$transaction(). Concurrency protection guarantees two users cannot reserve more stock than available.',
  ];

  modules.forEach((mod) => {
    doc.fillColor('#111827').fontSize(9).font('Helvetica').text(`• ${mod}`, { lineGap: 2.5 });
    doc.moveDown(0.35);
  });

  doc.moveDown(0.8);

  // Section 4: Mandatory Test Suite Results
  doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('4. Mandatory Automated Test Suite Execution Results');
  doc.moveDown(0.4);

  const testResults = [
    'Test 1 (Over-Reservation Protection): Cannot reserve more than available inventory. Over-reservation request rejected with HTTP 400 Insufficient Available Stock. (PASSED)',
    'Test 2 (Over-Transfer Protection): Cannot transfer more than available inventory. Over-transfer request rejected with HTTP 400 Insufficient Stock. (PASSED)',
    'Test 3 (2-Phase Transfer Verification): Source stock reduces on dispatch; Destination stock does NOT increase before receipt; Destination stock increases ONLY after transfer receipt. (PASSED)',
    'Test 4 (Double-Receive Guard): Attempting second receipt on an already received transfer is rejected with HTTP 400 Transfer Already Received. (PASSED)',
    'Test 5 (Role Authorization Guard): Sales User attempting to create an Admin Work Order is blocked with HTTP 403 Forbidden. (PASSED)',
  ];

  testResults.forEach((resText) => {
    doc.fillColor('#059669').fontSize(9).font('Helvetica-Bold').text('  ✅ ', { continued: true });
    doc.fillColor('#111827').font('Helvetica').text(resText, { lineGap: 2 });
    doc.moveDown(0.3);
  });

  doc.moveDown(0.8);

  // Section 5: Architecture & Database
  doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('5. System Architecture & Database Design');
  doc.moveDown(0.4);

  const arch = 
    `• Decoupled Architecture: React 18 + Vite SPA deployed on Vercel; Express.js + TypeScript REST API deployed on Render.\n` +
    `• Database: Cloud PostgreSQL database (Neon.tech) managed via Prisma ORM with relational constraints and atomic transactions.\n` +
    `• Concurrency & Security: Multi-item atomic operations with prisma.$transaction(), Helmet HTTP protection, and JWT Bearer RBAC middleware.`;

  doc.fillColor('#374151').fontSize(9).font('Helvetica').text(arch, { lineGap: 2.5 });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

generateDocumentationPdf().then((file) => {
  console.log(`✅ Updated Documentation PDF generated successfully at: ${file}`);
}).catch(console.error);
