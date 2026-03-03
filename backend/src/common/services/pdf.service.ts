import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Sale } from '../../database/schemas/sale.schema';

@Injectable()
export class PdfService {
  async generateReceipt(sale: Sale): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('🛠️Emi Repuestos⚙️', { align: 'center' });
        
        doc
          .fontSize(14)
          .font('Helvetica')
          .text('Repuestos de Autos', { align: 'center' });

        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
        doc.moveDown();

        // Información del recibo
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(`Recibo: ${sale.numeroRecibo}`, 50, doc.y);
        doc.text(`Fecha: ${new Date(sale.fecha).toLocaleString('es-ES')}`, 50, doc.y);
        doc.moveDown(2);

        // Tabla de productos
        doc.fontSize(10).font('Helvetica-Bold');
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 150;
        const col3 = 300;
        const col4 = 380;
        const col5 = 460;

        doc.text('Código', col1, tableTop);
        doc.text('Producto', col2, tableTop);
        doc.text('Precio', col3, tableTop);
        doc.text('Cant.', col4, tableTop);
        doc.text('Subtotal', col5, tableTop);

        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
        doc.moveDown(0.5);

        // Items
        doc.font('Helvetica').fontSize(9);
        sale.items.forEach((item) => {
          const itemY = doc.y;
          doc.text(item.barcode, col1, itemY, { width: 90 });
          doc.text(`${item.nombre} - ${item.marca}`, col2, itemY, { width: 140 });
          doc.text(`$${item.precioUnitario.toFixed(2)}`, col3, itemY);
          doc.text(item.cantidad.toString(), col4, itemY);
          doc.text(`$${item.subtotal.toFixed(2)}`, col5, itemY);
          doc.moveDown();
        });

        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
        doc.moveDown();

        // Total
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`TOTAL: $${sale.total.toFixed(2)}`, col4, doc.y);

        doc.moveDown(3);

        // Footer
        doc.fontSize(10).font('Helvetica-Oblique').text('¡Gracias por su compra!', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
