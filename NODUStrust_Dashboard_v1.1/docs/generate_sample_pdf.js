// optional: node script to generate a small sample PDF using PDFKit
// usage: node generate_sample_pdf.js ./docs/exports/sample.pdf
const fs = require('fs')
const PDFDocument = require('pdfkit')
const out = process.argv[2] || './docs/exports/sample.pdf'
fs.mkdirSync(require('path').dirname(out), { recursive: true })
const doc = new PDFDocument()
const stream = fs.createWriteStream(out)
doc.pipe(stream)
doc.fontSize(20).text('NODUStrust - Sample Preflight Checklist', {align:'center'})
doc.moveDown()
doc.fontSize(12).text('This is a generated sample PDF for testing watermark and export flows.')
// watermark
const watermark = 'NODUStrust - DRAFT'
doc.rotate(-45, {origin:[300,400]})
doc.opacity(0.15).fontSize(60).text(watermark, 50, 350)

doc.end()
stream.on('finish', () => console.log('PDF generated at', out))
