// Minimal Express backend mock for /api/audit-log
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(bodyParser.json())

const PORT = process.env.PORT || 3001

// in-memory mock audit logs
let auditLogs = [
  { id: 1, ts: new Date().toISOString(), actor: 'system', action: 'init', detail: 'scaffold created' }
]

app.get('/api/audit-log', (req, res) => {
  res.json({ ok: true, data: auditLogs })
})

app.post('/api/audit-log', (req, res) => {
  const entry = req.body
  entry.id = auditLogs.length + 1
  entry.ts = new Date().toISOString()
  auditLogs.push(entry)
  res.status(201).json({ ok: true, entry })
})

app.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.listen(PORT, () => console.log(`NODUStrust backend mock listening on ${PORT}`))
