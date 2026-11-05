// API helper for audit log operations
const BASE_URL = import.meta.env.VITE_API_BASE || '';

export async function fetchAuditLogs() {
  try {
    const response = await fetch(`${BASE_URL}/api/audit-log`);
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    return [];
  }
}

export async function createAuditLog(entry) {
  try {
    const response = await fetch(`${BASE_URL}/api/audit-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_AUTH_TOKEN || ''}`
      },
      body: JSON.stringify(entry)
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to create audit log:', err);
    return null;
  }
}
