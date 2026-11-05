// Express backend with persistent file-based audit logs
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const app = express()
app.use(cors())
app.use(bodyParser.json())

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'
const DATA_DIR = path.join(__dirname, 'data')
const LOGS_FILE = path.join(DATA_DIR, 'auditLogs.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Load or initialize audit logs from file
let auditLogs = []
if (fs.existsSync(LOGS_FILE)) {
  try {
    auditLogs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'))
  } catch (err) {
    console.error('Error reading logs file:', err)
    auditLogs = []
  }
}

// Initialize with default entry if empty
if (auditLogs.length === 0) {
  auditLogs = [
    { id: 1, ts: new Date().toISOString(), actor: 'system', action: 'init', detail: 'scaffold created' }
  ]
  saveLogs()
}

// Save logs to file
function saveLogs() {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(auditLogs, null, 2), 'utf8')
  } catch (err) {
    console.error('Error writing logs file:', err)
  }
}

app.get('/api/audit-log', (req, res) => {
  res.json({ ok: true, data: auditLogs })
})

app.post('/api/audit-log', (req, res) => {
  const entry = req.body
  entry.id = auditLogs.length + 1
  entry.ts = new Date().toISOString()
  auditLogs.push(entry)
  saveLogs()
  res.status(201).json({ ok: true, log: entry })
})

app.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.listen(PORT, HOST, () => console.log(`NODUStrust backend listening on http://${HOST}:${PORT}`))
