import React, {useEffect, useState} from 'react'

export default function App(){
  const [logs, setLogs] = useState([])
  useEffect(()=>{
    fetch((import.meta.env.VITE_API_BASE || '') + '/api/audit-log')
      .then(r=>r.json())
      .then(j=>setLogs(j.data || []))
      .catch(()=>setLogs([]))
  },[])

  return (
    <div style={{fontFamily:'Inter, system-ui, Arial', padding:24}}>
      <h1>NODUStrust Dashboard (scaffold)</h1>
      <p>Role: <strong>Admin</strong> | Mock data only</p>
      <section>
        <h2>Real-time (mock) audit logs</h2>
        <pre style={{background:'#0f172a', color:'#e2e8f0', padding:12}}>{JSON.stringify(logs, null, 2)}</pre>
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
