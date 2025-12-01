import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { extractTextFromFile } from './orc/extractTextFromFile'
import { analyzeDocument } from './extraction'

//server
const app = express()
const PORT = 4000
app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '../public')))
const upload = multer({ dest: 'uploads/' })

//endpoint
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

//server listening
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
