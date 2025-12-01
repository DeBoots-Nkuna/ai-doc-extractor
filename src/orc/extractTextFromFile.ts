import fs from 'fs'
import Tesseract from 'tesseract.js'
import { PDFParse } from 'pdf-parse'

export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  // Read file once as a buffer (for PDF)
  const buffer = fs.readFileSync(filePath)

  // --- PDF branch ---
  if (mimeType.includes('pdf')) {
    const parser = new PDFParse({ data: buffer })
    try {
      const result = await parser.getText()
      return result?.text ?? ''
    } finally {
      await parser.destroy().catch(() => {})
    }
  }

  // --- Image branch (jpg, png, etc.) via Tesseract OCR ---
  if (mimeType.startsWith('image/')) {
    const result = await Tesseract.recognize(filePath, 'eng')
    return result.data.text ?? ''
  }

  // --- Fallback for unknown mime types ---
  return ''
}
