import React, { useEffect, useState } from "react";
import { fetchAuditLogs } from "../api/auditApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function Overview() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAuditLogs()
      .then(setLogs)
      .catch((err) => console.error("Insights fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // 📊 metrics
  const totalEvents = logs.length;
  const latestEvent = logs[logs.length - 1]?.action || "None";

  // 📈 group by day
  const chartData = Object.values(
    logs.reduce((acc, log) => {
      const day = new Date(log.ts).toLocaleDateString();

      if (!acc[day]) {
        acc[day] = { date: day, count: 0 };
      }

      acc[day].count += 1;
      return acc;
    }, {})
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900">Compliance Insights</h1>

      {/* metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg">
          <div className="text-sm opacity-70 mb-2">Total Audit Events</div>
          <div className="text-4xl font-bold">{totalEvents}</div>
        </div>

        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg">
          <div className="text-sm opacity-70 mb-2">Latest Action</div>
          <div className="text-lg font-semibold truncate">{latestEvent}</div>
        </div>
      </div>

      {/* chart */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg h-[320px] flex items-center justify-center">
          <p className="text-slate-400">Loading audit data...</p>
        </div>
      ) : chartData.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Events Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-lg h-[320px] flex items-center justify-center">
          <p className="text-slate-400">No audit data available yet</p>
        </div>
      )}

      {/* detailed log preview */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Recent Entries</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.slice(-5).reverse().map((log) => (
              <div 
                key={log.id} 
                className="border-l-4 border-blue-500 bg-slate-50 p-3 rounded text-sm"
              >
                <div className="font-semibold text-slate-900">{log.action}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(log.ts).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
