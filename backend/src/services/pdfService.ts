import fs from 'fs';

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}