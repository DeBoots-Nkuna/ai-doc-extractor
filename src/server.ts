import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { extractTextFromFile } from './orc/extractTextFromFile'
import { analyzeDocument } from './extraction'
import { escapeCsv } from './utils'

//server
const app = express()
const PORT = 4000
app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '../public')))
const upload = multer({ dest: 'uploads/' })

//endpoint to analyze document
app.post('/api/analyze', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const filePath = req.file.path
  const mimeType = req.file.mimetype

  try {
    const rawText = await extractTextFromFile(filePath, mimeType)
    const result = analyzeDocument(rawText)

    return res.json(result)
  } catch (error: any) {
    console.error(error)
    return res
      .status(500)
      .json({ error: 'Failed to analyze document', details: error.message })
  } finally {
    fs.unlink(filePath, () => {})
  }
})

//endpoint to download csv file
app.post('/api/export-qualifications-csv', (req, res) => {
  const {
    rawText,
    qualifications,
    fullNames,
    firstName,
    surname,
    dateOfBirth,
    enrolmentNumber,
    enrolmentNo,
    documentType,
  } = req.body

  const quals = Array.isArray(qualifications) ? qualifications : []
  const text = typeof rawText === 'string' ? rawText : ''
  const enrol = enrolmentNumber || enrolmentNo || ''

  let csv = 'Field,Value\n'
  csv += 'Document type,' + escapeCsv(documentType || '') + '\n'
  csv += 'Full name,' + escapeCsv(fullNames || '') + '\n'
  csv += 'First name,' + escapeCsv(firstName || '') + '\n'
  csv += 'Surname,' + escapeCsv(surname || '') + '\n'
  csv += 'Date of birth,' + escapeCsv(dateOfBirth || '') + '\n'
  csv += 'Enrolment / ULN,' + escapeCsv(enrol) + '\n'
  csv += '\n'

  csv +=
    'Index,Qualification,Level,Awarding Body,Country,Awarded Date,Modules\n'

  csv += quals
    .map((q, index) => {
      const modulesText = Array.isArray(q.modules) ? q.modules.join('; ') : ''
      return [
        String(index + 1),
        escapeCsv(q.title),
        escapeCsv(q.level),
        escapeCsv(q.awardingBody),
        escapeCsv(q.country),
        escapeCsv(q.awardedDate),
        escapeCsv(modulesText),
      ].join(',')
    })
    .join('\n')

  csv += '\n\nRaw OCR Text,\n'

  const rawT = typeof rawText === 'string' ? rawText : ''
  const lines = rawT.split(/\r?\n/)

  for (const line of lines) {
    csv += ',' + escapeCsv(line) + '\n'
  }

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="document_summary.csv"'
  )
  res.send(csv)
})

//server listening
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
