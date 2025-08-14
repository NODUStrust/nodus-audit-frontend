
import { useEffect, useState } from 'react';

export default function Home() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(data => setLogs(data.logs))
      .catch(err => console.error('Error fetching logs:', err));
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>NODUSTRust Audit Dashboard</h1>
      <ul>
        {logs.map(log => (
          <li key={log.id}>
            {log.timestamp} — {log.action}
          </li>
        ))}
      </ul>
    </main>
  );
}
