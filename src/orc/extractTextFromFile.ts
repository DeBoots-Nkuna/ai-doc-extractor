import fs from 'fs'
import Tesseract from 'tesseract.js'
import pdfParse from 'pdf-parse'

export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  //reading pdf file
  const buffer = fs.readFileSync(filePath)

  //if statement for pdf branch
  if (mimeType.includes('pdf')) {
    const data = await (pdfParse as any)(buffer)
    return data?.text ?? ''
  }

  //if statement for image branch eg. jpg, png
  if (mimeType.startsWith('image/')) {
    const result = await Tesseract.recognize(filePath, 'eng')
    return result.data.text ?? ''
  }

  //fall back

  return ''
}
