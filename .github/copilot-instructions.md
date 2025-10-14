<!-- .github/copilot-instructions.md - project-specific guidance for AI coding assistants -->

This repository contains a small Next.js-based audit dashboard and a few static assets. The file below gives focused, actionable context for an AI coding assistant to be immediately productive.

Key files to read first
- `NODUS-AUDIT-main/NODUS-AUDIT-main/package.json` — project scripts and Next.js dependency surface.
- `NODUS-AUDIT-main/NODUS-AUDIT-main/index.js` — main React page; shows how the frontend fetches data from the API route `/api/audit-logs`.
- `NODUS-AUDIT-main/NODUS-AUDIT-main/audit-logs.js` — API route handler that returns sample logs. Mirrors serverless Next.js API handler pattern.
- `.vscode/launch.json` — contains local launch configuration (IDE-specific); useful for debugging instructions.

Big-picture architecture (short)
- Frontend: Next.js (React) pages under the top-level project. The UI calls internal API routes.
- Backend/API: Implemented as Next.js API routes (see `audit-logs.js`). No separate Express server in this repo; treat API code as serverless handlers.
- Data flow: `index.js` fetches `/api/audit-logs` on mount and renders `logs`. Any change to API route responses should preserve the `{ logs: [...] }` shape unless adapting callers.

Developer workflows & commands
- Start dev server: run the Next.js dev script from the subproject folder:
  - Windows PowerShell:
    ```powershell
    cd "NODUS-AUDIT-main/NODUS-AUDIT-main"; npm install; npm run dev
    ```
- Build for production: `npm run build` then `npm start` (same subfolder).
- Tests: none present. Add unit tests under a `__tests__` folder and wire with a test runner if adding tests.

Project-specific conventions and patterns
- API routes return JSON with top-level keys (example: `{ logs: [...] }`) — frontend expects this shape.
- Keep Next.js page components simple and client-rendered where fetch is used in `useEffect` (see `index.js`). Prefer using Next.js API routes for data the frontend consumes.
- Minimal dependency surface: React, React DOM, Next — avoid introducing large frameworks without explicit reason.

Integration points & external dependencies
- No external databases or services are configured here; sample data lives in the API route. If integrating a DB or external API, update `.env` and document env vars in `read me` or a new `.env.example`.
- CI: a placeholder workflow exists at `.github/workflows/main.yml` but it is empty; CI steps should run `npm install` and `npm run build` from the subproject folder.

Example edits an AI might be asked to do (how to approach)
- Add a new field to logs: update `audit-logs.js` to include the field, update `index.js` to render it, and keep the JSON contract stable.
- Convert client fetch to `getServerSideProps`: move the fetch into `pages` server function and change the component to accept `props.logs`.
- Add a new API route: create `NODUS-AUDIT-main/NODUS-AUDIT-main/pages/api/<name>.js` following the `export default function handler(req,res){}` pattern.

What not to change without asking
- Do not modify the API response shape (`{ logs: [...] }`) unless you also update all callers.
- Don't assume there's a global build at repo root — the Next.js app lives in `NODUS-AUDIT-main/NODUS-AUDIT-main` and scripts should be run there.

Quick pointers for PRs
- Include the files changed and a short note about API contract changes.
- If you add dependencies, update the `package.json` in the subfolder only and explain the reason.

If any section above is unclear or you'd like more examples (routing, env handling, or a suggested CI job), tell me which part to expand.
