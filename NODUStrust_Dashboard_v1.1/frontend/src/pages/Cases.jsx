import React from 'react'

export default function Cases() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <h1 className="text-3xl font-bold">My Cases</h1>
      <p className="mt-2 text-base text-slate-700">
        View and manage your assigned cases.
      </p>

      <section
        aria-labelledby="cases-empty-heading"
        className="mt-6 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm"
      >
        <h2 id="cases-empty-heading" className="text-xl font-semibold">
          No cases yet
        </h2>
        <p role="status" aria-live="polite" className="mt-2 text-base text-slate-700">
          No cases have been created yet.
        </p>
      </section>
    </main>
  )
}
