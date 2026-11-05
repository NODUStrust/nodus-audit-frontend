# NODUStrust Dashboard v1.1

The project contains a Vite + React frontend and an Express backend. The frontend
uses the Vite development proxy to send `/api` requests to the backend.

## Local development

Install dependencies with `npm install` in each of `frontend/` and `backend/`.
Start the backend with `npm start` from `backend/`, and start the frontend with
`npm run dev` from `frontend/`. The frontend is served at
http://127.0.0.1:5173 and the API at http://127.0.0.1:3001.
The audit log endpoint is `GET /api/audit-log`; it returns
`{ "ok": true, "data": [...] }`.

The frontend reads the optional `VITE_API_BASE` environment variable. Leave it
unset or empty to use the Vite development proxy, which forwards `/api` requests
to the backend. The backend accepts optional `PORT` and `HOST` environment
variables.
