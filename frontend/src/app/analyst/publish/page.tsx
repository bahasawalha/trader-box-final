"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  Send, 
  Eye, 
  FileEdit, 
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart3
} from "lucide-react";

export default function PublishAnalysis() {
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!form.title || !form.content) return alert("Report must have a title and intelligence body.");
    
    setLoading(true);
    try {
      await apiFetch("/admin/analysis", { // Reusing the endpoint since it's already robust
        method: "POST",
        body: JSON.stringify(form)
      });
      alert("Intelligence Report Synchronized Successfully!");
      setForm({ title: "", content: "" });
      setPreview(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Intelligence Dispatch</h1>
          <p className="text-gray-500 mt-1">Compose and broadcast technical market reports to the terminal nodes.</p>
        </div>
        <button 
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          {preview ? <FileEdit size={16} /> : <Eye size={16} />}
          {preview ? 'Switch to Editor' : 'Live Preview'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* 📝 Editor Section */}
        <div className={`space-y-6 ${preview ? 'hidden lg:block opacity-40 grayscale pointer-events-none' : ''}`}>
           <div className="bg-[#121826] border border-white/10 rounded-[40px] p-10 space-y-8 shadow-2xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Intelligence Header</label>
                  <input 
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="E.g. BTC Market Structural Shift..."
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-bold text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Analytical Core (Markdown Supported)</label>
                  <textarea 
                    rows={12}
                    value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    placeholder="Detailed analysis, technical indicators, and market sentiment..."
                    className="w-full bg-black/40 border border-white/5 rounded-3xl px-6 py-6 outline-none focus:border-blue-500 transition-all font-mono text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4 items-center">
                 <AlertTriangle className="text-blue-400 shrink-0" size={20} />
                 <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
                   Reports are immutable once published. Ensure all data points are verified.
                 </p>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-blue-500 text-white font-black text-lg flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50 group"
              >
                {loading ? 'Transmitting Data...' : 'Broadcast Intelligence'}
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
           </div>
        </div>

        {/* 👁️ Preview Section */}
        <div className={`${!preview ? 'hidden lg:block opacity-40' : ''}`}>
           <div className="sticky top-32 space-y-6">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={14} fill="currentColor" /> Real-time Node Preview
              </div>
              
              <div className="bg-[#0B0F1A] border border-white/10 rounded-[40px] p-10 min-h-[500px] shadow-inner relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BarChart3 size={120} />
                 </div>
                 
                 {form.title || form.content ? (
                   <article className="relative z-10 space-y-8">
                      <h2 className="text-3xl font-black leading-tight border-l-4 border-blue-500 pl-6">{form.title || "Intelligence Title"}</h2>
                      <div className="prose prose-invert max-w-none">
                         {form.content.split('\n').map((line, i) => (
                           <p key={i} className="text-gray-400 leading-relaxed mb-4">{line}</p>
                         )) || "Awaiting analytical data..."}
                      </div>
                   </article>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4">
                      <FileEdit size={48} strokeWidth={1} />
                      <p className="font-mono text-xs uppercase tracking-widest">Awaiting Editor Input</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
