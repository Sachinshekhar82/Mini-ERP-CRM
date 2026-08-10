import PDFDocument from 'pdfkit';

interface ChallanPDFData {
  challanNumber: string;
  createdAt: Date | string;
  status: string;
  customerName: string;
  customerAddress?: string;
  customerGst?: string;
  createdByName: string;
  totalAmount: number;
  totalQuantity: number;
  items: Array<{
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
  notes?: string | null;
}

export function generateChallanPDF(data: ChallanPDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header Banner
      doc
        .fillColor('#1E293B')
        .fontSize(22)
        .text('MINI ERP / CRM OPERATIONS PORTAL', 50, 45)
        .fontSize(10)
        .fillColor('#64748B')
        .text('Official Sales Challan & Tax Invoice', 50, 72)
        .moveDown();

      // Divider Line
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(50, 90).lineTo(550, 90).stroke();

      // Challan Meta Details Box
      doc.fillColor('#1E293B').fontSize(12).text(`Challan No: ${data.challanNumber}`, 50, 105);
      doc.fontSize(10).fillColor('#475569');
      doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString('en-IN')}`, 50, 122);
      doc.text(`Status: ${data.status.toUpperCase()}`, 50, 137);
      doc.text(`Prepared By: ${data.createdByName}`, 50, 152);

      // Customer Details Box (Right aligned block)
      doc.fillColor('#1E293B').fontSize(11).text('BILL TO:', 330, 105);
      doc.fontSize(10).fillColor('#334155');
      doc.text(data.customerName, 330, 122);
      if (data.customerGst) doc.text(`GSTIN: ${data.customerGst}`, 330, 137);
      if (data.customerAddress) doc.text(data.customerAddress, 330, 152, { width: 220 });

      // Table Headers
      const startY = 200;
      doc.fillColor('#F1F5F9').rect(50, startY, 500, 24).fill();

      doc.fillColor('#0F172A').fontSize(10);
      doc.text('Item / SKU', 60, startY + 6);
      doc.text('Unit Price', 280, startY + 6, { width: 80, align: 'right' });
      doc.text('Qty', 370, startY + 6, { width: 50, align: 'right' });
      doc.text('Total (₹)', 440, startY + 6, { width: 90, align: 'right' });

      // Table Rows
      let currentY = startY + 30;
      data.items.forEach((item, index) => {
        doc.fillColor('#1E293B').fontSize(9);
        doc.text(`${index + 1}. ${item.productName} (${item.sku})`, 60, currentY, { width: 210 });
        doc.text(`₹${item.unitPrice.toFixed(2)}`, 280, currentY, { width: 80, align: 'right' });
        doc.text(`${item.quantity}`, 370, currentY, { width: 50, align: 'right' });
        doc.text(`₹${item.totalPrice.toFixed(2)}`, 440, currentY, { width: 90, align: 'right' });
        currentY += 22;
      });

      // Total Summary Box
      currentY += 10;
      doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 12;

      doc.fillColor('#0F172A').fontSize(11);
      doc.text(`Total Quantity: ${data.totalQuantity}`, 50, currentY);
      doc.text(`Grand Total: ₹${data.totalAmount.toFixed(2)}`, 350, currentY, { width: 180, align: 'right' });

      if (data.notes) {
        currentY += 30;
        doc.fillColor('#64748B').fontSize(9).text(`Notes / Special Instructions: ${data.notes}`, 50, currentY, { width: 500 });
      }

      // Footer
      doc
        .fontSize(8)
        .fillColor('#94A3B8')
        .text('This is a computer-generated document. No signature required.', 50, 730, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
