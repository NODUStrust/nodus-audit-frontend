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
