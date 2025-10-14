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
    if (!win) { alert("Popup blocked â€” allow popups to preview."); return; }
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
              [{l.ts}] ({l.role}) â€” {l.msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
