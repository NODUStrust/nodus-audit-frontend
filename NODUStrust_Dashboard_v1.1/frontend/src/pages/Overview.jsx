import React, { useEffect, useRef, useState } from "react";
import { fetchAuditLogs } from "../api/auditApi";
import { runAuditRefresh } from "../api/auditRefresh.mjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const REFRESH_INTERVAL = 30_000;

export default function Overview() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const lifecycleRef = useRef(null);
  const requestLockRef = useRef({ inFlight: false });
  const refreshAuditLogsRef = useRef(null);

  useEffect(() => {
    const lifecycle = {};
    lifecycleRef.current = lifecycle;
    const refreshAuditLogs = () =>
      runAuditRefresh({
        lock: requestLockRef.current,
        isActive: () => lifecycleRef.current === lifecycle,
        fetchLogs: fetchAuditLogs,
        onStart: () => setRefreshing(true),
        onSuccess: (updatedLogs) => {
          setLogs(updatedLogs);
          setLastUpdated(new Date());
          setError("");
        },
        onError: (err) => {
          console.error("Insights fetch error:", err);
          setError(err instanceof Error ? err.message : String(err));
        },
        onSettled: () => {
          setLoading(false);
          setRefreshing(false);
        }
      });

    refreshAuditLogsRef.current = refreshAuditLogs;
    refreshAuditLogs();
    const intervalId = window.setInterval(refreshAuditLogs, REFRESH_INTERVAL);

    return () => {
      lifecycleRef.current = null;
      refreshAuditLogsRef.current = null;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(motionPreference.matches);

    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => motionPreference.removeEventListener("change", updateMotionPreference);
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

  const connectionStatus = loading
    ? "Loading audit data from the backend."
    : refreshing
      ? "Refreshing audit data."
      : error
        ? lastUpdated
          ? "Connection issue. Showing the last successfully retrieved data, which may be outdated."
          : "Unable to connect to the audit service."
        : logs.length === 0
          ? "Connected. No audit records are available."
          : "Connected. Audit records are up to date.";

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900">Compliance Insights</h1>

      <section
        aria-label="Audit data connection"
        className="flex flex-col gap-4 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p role="status" aria-live="polite" aria-atomic="true" className="font-semibold text-slate-900">
            {connectionStatus}
          </p>
          {lastUpdated && (
            <p className="mt-1 text-sm text-slate-700">
              Last updated:{" "}
              <time dateTime={lastUpdated.toISOString()}>{lastUpdated.toLocaleString()}</time>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => refreshAuditLogsRef.current?.()}
          disabled={refreshing}
          className="min-h-11 rounded-lg border border-sky-800 bg-sky-700 px-4 py-2 font-semibold text-white hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {refreshing ? "Refreshing audit records..." : "Refresh audit records"}
        </button>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-amber-800 bg-amber-50 p-4 text-amber-950"
        >
          {lastUpdated
            ? `Unable to refresh audit records. The displayed information may be outdated; last successful update: ${lastUpdated.toLocaleString()}.`
            : "Unable to load audit records from the backend."}{" "}
          {error}
        </div>
      )}

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
        <div className="bg-white rounded-2xl p-8 shadow-lg h-[320px] flex items-center justify-center" aria-hidden="true">
          <p className="text-slate-700">Loading audit data...</p>
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
                isAnimationActive={!prefersReducedMotion}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg h-[320px] flex items-center justify-center">
          <p className="text-slate-700">Audit data is unavailable until the backend connection is restored.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-lg h-[320px] flex items-center justify-center">
          <p className="text-slate-700">No audit data available yet</p>
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
