// npm install pdfkit
const PDFDocument = require('pdfkit');

/** Renders the structured Gemini output into a simple PDF report. Returns a Buffer. */
function generateReportPdf(analysis) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Lab Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(analysis.summary ?? '');
    doc.moveDown();

    doc.fontSize(14).text('Markers');
    doc.moveDown(0.5);
    for (const marker of analysis.markers ?? []) {
      doc.fontSize(11).text(`${marker.name}: ${marker.value} ${marker.unit ?? ''}  (ref: ${marker.referenceRange ?? '—'})  [${marker.status}]`);
    }
    doc.moveDown();

    doc.fontSize(14).text('Recommendations');
    doc.moveDown(0.5);
    for (const rec of analysis.recommendations ?? []) {
      doc.fontSize(11).text(`• ${rec}`);
    }

    doc.end();
  });
}

module.exports = { generateReportPdf };
