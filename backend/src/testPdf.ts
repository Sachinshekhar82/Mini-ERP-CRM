import { generateChallanPDF } from './utils/pdfGenerator';
import fs from 'fs';
import path from 'path';

async function runPdfTests() {
  console.log('🧪 Testing PDF Export Generation across multiple scenarios...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`  ✅ PASSED: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${description}`);
      failed++;
    }
  }

  try {
    // 1. Test DRAFT Challan PDF
    const draftPdf = await generateChallanPDF({
      challanNumber: 'CH-2026-TEST-DRAFT',
      createdAt: new Date(),
      status: 'DRAFT',
      customerName: 'Acme Retail Pvt Ltd',
      customerAddress: '123 Commerce Street, Mumbai',
      customerGst: '27AAACA1234F1Z5',
      createdByName: 'Sales Executive',
      totalAmount: 7500,
      totalQuantity: 2,
      items: [
        { productName: 'Industrial Drill 850W', sku: 'SKU-DRL-850', unitPrice: 3500, quantity: 1, totalPrice: 3500 },
        { productName: 'Executive Office Chair', sku: 'SKU-CHR-EXEC', unitPrice: 4000, quantity: 1, totalPrice: 4000 },
      ],
      notes: 'Draft quotation for evaluation',
    });

    assert(Buffer.isBuffer(draftPdf) && draftPdf.length > 1000, 'Test 1: Generated DRAFT challan PDF buffer successfully');

    // 2. Test CONFIRMED Challan PDF
    const confirmedPdf = await generateChallanPDF({
      challanNumber: 'CH-2026-TEST-CONFIRMED',
      createdAt: new Date(),
      status: 'CONFIRMED',
      customerName: 'Apex Distributors & Wholesale Supplies Private Limited', // Long customer name!
      customerAddress: 'Plot 45, Industrial Zone Phase 2, Ring Road, Ahmedabad, Gujarat 380009',
      customerGst: '24AAACA9999Z1Z0',
      createdByName: 'Vikram Mehta (Sales Manager)',
      totalAmount: 24500,
      totalQuantity: 7,
      items: [
        { productName: 'Heavy Duty Cordless Angle Grinder 20V Max', sku: 'SKU-GRND-20V', unitPrice: 4500, quantity: 3, totalPrice: 13500 },
        { productName: 'Stainless Steel Bolt Pack (500 Pcs)', sku: 'SKU-FST-BLT500', unitPrice: 1100, quantity: 4, totalPrice: 4400 },
        { productName: 'Digital Circuit Multimeter Tester', sku: 'SKU-ELC-MMT', unitPrice: 2200, quantity: 3, totalPrice: 6600 },
      ],
      notes: 'Express logistics dispatch via Rivigo.',
    });

    assert(Buffer.isBuffer(confirmedPdf) && confirmedPdf.length > 1000, 'Test 2: Generated CONFIRMED multi-item challan PDF with long customer name');

    // 3. Test CANCELLED Challan PDF
    const cancelledPdf = await generateChallanPDF({
      challanNumber: 'CH-2026-TEST-CANCELLED',
      createdAt: new Date(),
      status: 'CANCELLED',
      customerName: 'Verma Traders',
      customerAddress: 'Delhi',
      createdByName: 'Admin',
      totalAmount: 1200,
      totalQuantity: 1,
      items: [
        { productName: 'Safety Helmet', sku: 'SKU-SFT-HLMT', unitPrice: 1200, quantity: 1, totalPrice: 1200 },
      ],
    });

    assert(Buffer.isBuffer(cancelledPdf) && cancelledPdf.length > 1000, 'Test 3: Generated CANCELLED challan PDF buffer successfully');

    // Save one PDF locally for manual visual inspection
    const outputDir = path.join(__dirname, '../scratch');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outputDir, 'sample_challan.pdf'), confirmedPdf);
    console.log(`📁 Sample PDF written to ${path.join(outputDir, 'sample_challan.pdf')}`);

    console.log(`\n🎉 PDF Export Test Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } catch (err: any) {
    console.error('❌ PDF Export Test Failed:', err);
    process.exit(1);
  }
}

runPdfTests();
