import fs from 'fs';
import path from 'path';

async function testPdf() {
  const pdfParseModule = await import("pdf-parse-new");
  const parse = pdfParseModule.default || pdfParseModule;
  const filePath = path.join(process.cwd(), "public", "uploads", "curricula", "a698c6f3-f0b2-45bc-b6be-6991205517c5_BSIT_CURRICULUM.pdf");
  const buffer = fs.readFileSync(filePath);
  const pdf = await parse(buffer);
  
  const text = pdf.text || "";
  fs.writeFileSync("pdf_text_dump.txt", text);
  console.log("Dumped to pdf_text_dump.txt");
}

testPdf().catch(console.error);
