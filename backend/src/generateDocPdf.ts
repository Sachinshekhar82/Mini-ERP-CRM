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
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('NEXORA — Operations Portal', { align: 'center' });
  
  doc
    .fillColor('#6B7280')
    .fontSize(12)
    .font('Helvetica')
    .text('Full-Stack Mini ERP + CRM Operations Suite Documentation', { align: 'center' })
    .moveDown(1.5);

  // Section: Executive Summary & Live Links
  doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('1. Live Deployment & Repository Links');
  doc.moveDown(0.5);

  const links = [
    ['🌐 Live Frontend URL:', 'https://mini-erp-crm-gray.vercel.app/'],
    ['📡 Live Backend API URL:', 'https://mini-erp-crm-puyn.onrender.com/'],
    ['📁 GitHub Repository:', 'https://github.com/Sachinshekhar82/Mini-ERP-CRM.git'],
    ['🧪 Health Check Endpoint:', 'https://mini-erp-crm-puyn.onrender.com/api/health'],
    ['📬 Postman Collection:', 'postman/Mini-ERP-CRM.postman_collection.json'],
  ];

  links.forEach(([label, value]) => {
    doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold').text(label, { continued: true });
    doc.fillColor('#4F46E5').font('Helvetica').text(` ${value}`);
    doc.moveDown(0.3);
  });

  doc.moveDown(1);

  // Section: Test Credentials
  doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('2. Demo Test Credentials (All Roles)');
  doc.moveDown(0.5);

  const credentials = [
    ['ADMIN', 'admin@company.com', 'password123', 'Full system access & User Administration'],
    ['SALES', 'sales@company.com', 'password123', 'Customer CRM & Sales Challan creation'],
    ['WAREHOUSE', 'warehouse@company.com', 'password123', 'Product catalog & Stock IN/OUT operations'],
    ['ACCOUNTS', 'accounts@company.com', 'password123', 'Financial audit & Challan confirmation'],
  ];

  credentials.forEach(([role, email, pass, desc]) => {
    doc.fillColor('#4F46E5').fontSize(10).font('Helvetica-Bold').text(`• [${role}] `, { continued: true });
    doc.fillColor('#111827').font('Helvetica').text(`${email} | Password: `, { continued: true });
    doc.fillColor('#059669').font('Helvetica-Bold').text(`${pass}`, { continued: true });
    doc.fillColor('#6B7280').font('Helvetica').text(` (${desc})`);
    doc.moveDown(0.3);
  });

  doc.moveDown(1);

  // Section: System Architecture
  doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('3. System Architecture');
  doc.moveDown(0.5);

  const archText = 
    `NEXORA is built on a decoupled RESTful architecture designed for enterprise B2B wholesale and distribution operations:\n\n` +
    `• Frontend: React 18 + TypeScript + Vite SPA, styled with custom B2B design tokens, localized skeleton loaders, and frame-0 instant UI shell rendering.\n` +
    `• Backend: Express.js + TypeScript REST API enforcing JWT authentication, Helmet security headers, Zod schema validation, and role-based access control (RBAC).\n` +
    `• Database: Cloud PostgreSQL database (Neon.tech) managed via Prisma ORM with relational integrity and multi-item atomic stock deduction transactions.\n` +
    `• Storage: Sales Challan PDF invoice generation via PDFKit.`;

  doc.fillColor('#374151').fontSize(10).font('Helvetica').text(archText, { lineGap: 3 });

  doc.moveDown(1);

  // Section: Key Features & Business Logic
  doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('4. Core Business Logic & Features');
  doc.moveDown(0.5);

  const features = [
    'Atomic Stock Deduction: Multi-item sales challan confirmation checks all product quantities inside a single prisma.$transaction(). If any item exceeds available stock, the entire transaction rolls back cleanly with 0 stock changes and 0 movement logs.',
    'Product Price Snapshot: SalesChallanItem retains unitPriceSnapshot, skuSnapshot, and productNameSnapshot at creation time, ensuring future catalog price edits never corrupt historical invoices.',
    'Customer CRM Pipeline: Multi-field search (name, business, email, phone, GSTIN), filters, pagination, and chronological follow-up timeline notes.',
    'Inventory & Low Stock Warnings: Threshold alerts (currentStock <= minimumStock) and movement audit logs.',
  ];

  features.forEach((feat) => {
    doc.fillColor('#111827').fontSize(10).font('Helvetica').text(`• ${feat}`, { lineGap: 3 });
    doc.moveDown(0.4);
  });

  doc.moveDown(1);

  // Section: Known Limitations & Future Improvements
  doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('5. Known Limitations & Future Scope');
  doc.moveDown(0.5);

  const limitations = [
    'Known Limitation: Sales challan cancellation currently applies to DRAFT status. Cancelling a CONFIRMED challan requires issuing a manual reverse Stock IN adjustment to preserve audit integrity.',
    'Future Improvement: Multi-currency support and automated email dispatch of PDF invoices directly to customer email addresses.',
  ];

  limitations.forEach((lim) => {
    doc.fillColor('#374151').fontSize(10).font('Helvetica').text(`• ${lim}`, { lineGap: 3 });
    doc.moveDown(0.4);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

generateDocumentationPdf().then((file) => {
  console.log(`✅ Documentation PDF generated successfully at: ${file}`);
}).catch(console.error);
