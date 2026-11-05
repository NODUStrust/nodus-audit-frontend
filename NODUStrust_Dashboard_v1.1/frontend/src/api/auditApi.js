const BASE_URL = import.meta.env.VITE_API_BASE || ''

export async function fetchAuditLogs() {
  const response = await fetch(`${BASE_URL}/api/audit-log`)
  if (!response.ok) {
    throw new Error(`Audit log request failed (${response.status} ${response.statusText})`)
  }

  const result = await response.json()
  if (!Array.isArray(result.data)) {
    throw new Error('Audit log response did not contain a data array')
  }

  return result.data
}

export async function createAuditLog(entry) {
  const response = await fetch(`${BASE_URL}/api/audit-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(entry)
  })
  if (!response.ok) {
    throw new Error(`Audit log creation failed (${response.status} ${response.statusText})`)
  }

  return response.json()
}
