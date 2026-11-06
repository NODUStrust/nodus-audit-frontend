import React, { useState } from 'react'

export default function Cases() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submissionStatus, setSubmissionStatus] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setSubmissionStatus('Form submitted in this demonstration. No case was created or saved.')
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold">My Cases</h1>
          <p className="mt-2 text-base text-slate-700">
            View and manage your assigned cases.
          </p>
        </header>

        <section
          aria-labelledby="create-case-heading"
          className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm"
        >
          <h2 id="create-case-heading" className="text-xl font-semibold">
            Create Case
          </h2>
          <p
            role="alert"
            className="mt-4 rounded-lg border border-amber-800 bg-amber-50 p-4 font-semibold text-amber-950"
          >
            Prototype only. Do not enter real personal, financial, or confidential
            information. Case information is not saved.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="case-title" className="block font-medium text-slate-900">
                Case Title <span aria-hidden="true">(required)</span>
              </label>
              <input
                id="case-title"
                name="caseTitle"
                type="text"
                required
                autoComplete="off"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  setSubmissionStatus('')
                }}
                className="mt-2 min-h-11 w-full rounded-lg border border-slate-500 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800"
              />
            </div>

            <div>
              <label htmlFor="case-description" className="block font-medium text-slate-900">
                Description <span className="font-normal text-slate-700">(optional)</span>
              </label>
              <textarea
                id="case-description"
                name="caseDescription"
                rows="4"
                autoComplete="off"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                  setSubmissionStatus('')
                }}
                className="mt-2 w-full rounded-lg border border-slate-500 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800"
              />
            </div>

            <button
              type="submit"
              className="min-h-11 rounded-lg border border-sky-800 bg-sky-700 px-5 py-2 font-semibold text-white hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800"
            >
              Submit demonstration
            </button>
            <p role="status" aria-live="polite" aria-atomic="true" className="text-base text-slate-800">
              {submissionStatus}
            </p>
          </form>
        </section>

        <section
          aria-labelledby="cases-empty-heading"
          className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm"
        >
          <h2 id="cases-empty-heading" className="text-xl font-semibold">
            No cases yet
          </h2>
          <p role="status" aria-live="polite" className="mt-2 text-base text-slate-700">
            No cases have been created yet.
          </p>
        </section>
      </div>
    </main>
  )
}
