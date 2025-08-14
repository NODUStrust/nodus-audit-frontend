
export default function handler(req, res) {
  const sampleLogs = [
    { id: 1, action: 'User logged in', timestamp: '2025-07-03T12:00:00Z' },
    { id: 2, action: 'User updated settings', timestamp: '2025-07-03T12:05:00Z' },
  ];

  res.status(200).json({ logs: sampleLogs });
}
