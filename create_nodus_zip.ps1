# create_nodus_zip.ps1
# Run in PowerShell. Creates nodus-audit-dashboard folder and zips it.

$project = "nodus-audit-dashboard"
$root = Join-Path -Path (Get-Location) -ChildPath $project

# create folders
New-Item -Path $root -ItemType Directory -Force | Out-Null
New-Item -Path (Join-Path $root "src") -ItemType Directory -Force | Out-Null
New-Item -Path (Join-Path $root "src\components") -ItemType Directory -Force | Out-Null
New-Item -Path (Join-Path $root "public") -ItemType Directory -Force | Out-Null
New-Item -Path (Join-Path $root "api") -ItemType Directory -Force | Out-Null
New-Item -Path (Join-Path $root "logs") -ItemType Directory -Force | Out-Null

# helper to write files with UTF8
function Write-UTF8File($path, $content) {
  $dir = Split-Path $path -Parent
  if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null }
  $content | Out-File -FilePath $path -Encoding UTF8 -Force
}

# package.json (root)
$pkgJson = @'
{
  "name": "nodus-audit-dashboard",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite preview"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.4.7",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
'@
Write-UTF8File -path (Join-Path $root "package.json") -content $pkgJson

# vite.config.js
$vite = @'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});
'@
Write-UTF8File -path (Join-Path $root "vite.config.js") -content $vite

# index.html
$index = @'
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>NODUS Preflight Checklist</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'@
Write-UTF8File -path (Join-Path $root "index.html") -content $index

# tailwind.config.cjs
$tw = @'
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: { extend: {} },
  plugins: []
}
'@
Write-UTF8File -path (Join-Path $root "tailwind.config.cjs") -content $tw

# postcss.config.cjs
$postcss = @'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
'@
Write-UTF8File -path (Join-Path $root "postcss.config.cjs") -content $postcss

# .gitignore
$gitig = @'
node_modules/
dist/
.env
logs/
.vscode/
'@
Write-UTF8File -path (Join-Path $root ".gitignore") -content $gitig

# .env.example
$envExample = @'
# Example environment variables
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

AUDIT_API_KEY=your_local_api_key
'@
Write-UTF8File -path (Join-Path $root ".env.example") -content $envExample

# README.md
$readme = @'
# NODUS Audit Dashboard (Vite + React + Tailwind + Vercel API)

Local dev writes logs to ./logs/. In production configure AWS_S3_* env vars to store logs in S3.
Run locally:
1. Copy .env.example -> .env (if needed)
2. npm install
3. npm run dev
'@
Write-UTF8File -path (Join-Path $root "README.md") -content $readme

# src/main.jsx
$main = @'
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(<App />);
'@
Write-UTF8File -path (Join-Path $root "src\main.jsx") -content $main

# src/index.css
$indexcss = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { @apply bg-gray-100 text-gray-900; }
'@
Write-UTF8File -path (Join-Path $root "src\index.css") -content $indexcss

# src/App.jsx
$app = @'
import React from "react";
import Checklist from "./components/Checklist";

export default function App(){
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">NODUS Pre-Flight Checklist</h1>
        <Checklist />
      </div>
    </div>
  );
}
'@
Write-UTF8File -path (Join-Path $root "src\App.jsx") -content $app

# src/components/Checklist.jsx
$checklist = @'
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const checklistItems = [
  "EIN, UCC, and DUNS names match",
  "Address and contact info are uniform",
  "Security agreements signed and enforceable",
  "Trust and LLC responsibilities clearly separated",
  "Bank onboarding summary prepared",
  "CUSIP request backed by complete documentation",
  "Signature authority verified and logged",
  "Documents formatted as final PDFs",
  "Banking targets shortlisted",
  "Investor disclaimers and risk language validated",
  "Annual reports and registrations updated"
];

export default function Checklist(){
  const [checked, setChecked] = useState(Array(checklistItems.length).fill(false));
  const [role, setRole] = useState(null);
  const [log, setLog] = useState([]);
  const checklistRef = useRef(null);
  const [sending, setSending] = useState(false);

  useEffect(()=> {
    const saved = localStorage.getItem("nodus_checked");
    if (saved) {
      try { setChecked(JSON.parse(saved)); } catch(e){}
    }
  },[]);

  useEffect(()=>{
    localStorage.setItem("nodus_checked", JSON.stringify(checked));
  },[checked]);

  const toggle = (i) => {
    if (role !== "admin") return;
    const next = [...checked]; next[i] = !next[i];
    setChecked(next);
    addLog(`Item ${i+1} ${next[i] ? "checked" : "unchecked"}`);
  };

  const addLog = (msg) => {
    const entry = { ts: new Date().toISOString(), role: role || "anonymous", msg };
    setLog(prev => [...prev, entry]);
  };

  const allChecked = checked.every(Boolean);

  const preview = () => {
    const win = window.open("", "_blank");
    if (!win) { alert("Popup blocked — allow popups to preview."); return; }
    const cloned = checklistRef.current.cloneNode(true);
    const wrapper = document.createElement("div");
    wrapper.style.padding = "20px";
    wrapper.style.fontFamily = "sans-serif";
    wrapper.appendChild(cloned);
    win.document.body.innerHTML = "";
    win.document.body.appendChild(wrapper);
  };

  const exportPDF = async () => {
    if (window.html2pdf) {
      const el = checklistRef.current.cloneNode(true);
      const watermark = document.createElement("div");
      watermark.style.position = "absolute";
      watermark.style.top = "40%";
      watermark.style.left = "25%";
      watermark.style.fontSize = "3rem";
      watermark.style.opacity = "0.08";
      watermark.style.transform = "rotate(-30deg)";
      watermark.style.pointerEvents = "none";
      watermark.textContent = "NODUS TRUST";
      const wrap = document.createElement("div");
      wrap.style.position = "relative";
      wrap.appendChild(el);
      wrap.appendChild(watermark);
      window.html2pdf().from(wrap).save("Preflight_Checklist.pdf");
      addLog("Exported PDF (client)");
    } else {
      alert("PDF export library not loaded. Add html2pdf.js to index.html to enable full export.");
    }
  };

  const sendToServer = async () => {
    setSending(true);
    try {
      const payload = { checked, logs: log, ts: new Date().toISOString() };
      const res = await axios.post("/api/audit-log", payload);
      addLog("Sent audit log to server: " + (res.data?.message || res.status));
      alert("Audit log sent.");
    } catch (err) {
      console.error(err);
      alert("Failed to send audit log: " + (err?.response?.data?.error || err.message));
      addLog("Failed to send audit log");
    } finally {
      setSending(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");
    if (email === "admin@nodustrust.org" && password === "securepass") {
      setRole("admin");
      addLog("Admin logged in");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div>
      {!role && (
        <form onSubmit={handleLogin} className="mb-4 flex gap-2">
          <input name="email" type="email" placeholder="Email" className="border p-2 rounded flex-1" />
          <input name="password" type="password" placeholder="Password" className="border p-2 rounded flex-1" />
          <button className="bg-blue-600 text-white px-4 rounded">Login</button>
        </form>
      )}

      <div ref={checklistRef}>
        {checklistItems.map((it, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b">
            <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} disabled={role !== "admin"} />
            <div className="flex-1">{it}</div>
          </div>
        ))}
      </div>

      {role === "admin" && (
        <div className="mt-4 grid grid-cols-1 gap-2">
          <button onClick={exportPDF} className="bg-green-600 text-white px-4 py-2 rounded">Export PDF</button>
          <button onClick={preview} className="border px-4 py-2 rounded">Preview Mock</button>
          <button onClick={sendToServer} disabled={!log.length || sending} className="bg-indigo-600 text-white px-4 py-2 rounded">
            {sending ? "Sending..." : "Send Audit Log"}
          </button>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold">Audit Trail</h3>
        <ul className="max-h-40 overflow-auto mt-2 text-sm">
          {log.map((l, idx) => (
            <li key={idx} className="text-gray-700">
              [{l.ts}] ({l.role}) — {l.msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
'@
Write-UTF8File -path (Join-Path $root "src\components\Checklist.jsx") -content $checklist

# public/favicon.ico optional (skip binary)

# api/audit-log.js
$api = @'
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// try S3 upload if env present
async function uploadToS3(body) {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET) return null;
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  });
  const key = `audit-${Date.now()}.json`;
  const cmd = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: JSON.stringify(body, null, 2),
    ContentType: "application/json"
  });
  await s3.send(cmd);
  return key;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || (await new Promise(r => {
      let s = "";
      req.on("data", c => s += c);
      req.on("end", () => r(JSON.parse(s)));
    }));

    const apiKey = process.env.AUDIT_API_KEY;
    const clientKey = req.headers["x-audit-key"] || req.query.key;
    if (apiKey && clientKey !== apiKey) {
      return res.status(401).json({ error: "Invalid audit key" });
    }

    try {
      const s3Key = await uploadToS3(body);
      if (s3Key) {
        return res.status(200).json({ message: "Uploaded to S3", key: s3Key });
      }
    } catch (err) {
      console.error("S3 upload failed:", err && err.message);
    }

    const logsDir = path.join(__dirname, "..", "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const filePath = path.join(logsDir, `audit_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");

    return res.status(200).json({ message: "Saved locally", file: filePath });
  } catch (err) {
    console.error("audit-log error", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
'@
Write-UTF8File -path (Join-Path $root "api\audit-log.js") -content $api

# compress
$zip = Join-Path (Get-Location) "$project.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path $root\* -DestinationPath $zip

Write-Output "Created project at: $root"
Write-Output "Created zip file: $zip"
Write-Output "Next steps:"
Write-Output "1) cd $project"
Write-Output "2) npm install"
Write-Output "3) npm run dev"
Write-Output "If you deploy to Vercel, set env vars for AWS if you want S3 uploads and set AUDIT_API_KEY if you want to protect the endpoint."
