import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Overview from './pages/Overview'
import { fetchAuditLogs } from './api/auditApi'

function Dashboard() {
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchAuditLogs()
      .then(data => {
        if (active) setLogs(data)
      })
      .catch(err => {
        console.error('Failed to load dashboard audit logs:', err)
        if (active) setError(err instanceof Error ? err.message : String(err))
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial', padding: 24 }}>
      <h1>NODUStrust Dashboard</h1>
      <p>Role: <strong>Admin</strong> | Persistent audit trail active</p>
      <section>
        <h2>Real-time audit logs</h2>
        {error && <p role="alert">Unable to load audit logs: {error}</p>}
        <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 12 }}>{JSON.stringify(logs, null, 2)}</pre>
      </section>
      <section>
        <h2>Preflight checklist (sample)</h2>
        <ul>
          <li>PDF + JSON export ready: <em>docs/checklist.sample.json</em></li>
          <li>Env keys: .env.example</li>
        </ul>
      </section>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <nav style={{ borderBottom: '1px solid #ddd', padding: '12px 24px', display: 'flex', gap: '24px' }}>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#0ea5e9' }}>Dashboard</Link>
        <Link to="/overview" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#0ea5e9' }}>Insights</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/overview" element={<Overview />} />
      </Routes>
    </Router>
  )
}
