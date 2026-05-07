"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  FileText, 
  Send, 
  AlertCircle,
  Layout
} from "lucide-react";

export default function AdminAnalysisPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await apiFetch("/admin/analysis", {
        method: "POST",
        body: JSON.stringify({ title, content })
      });
      setSuccess(true);
      setTitle("");
      setContent("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-12 space-y-10">
      <header>
        <h1 className="text-4xl font-black">Market Intelligence Dispatch</h1>
        <p className="text-gray-500">Publish high-impact technical reports to the terminal.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 📝 Editor */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0D1117] border border-white/5 p-8 rounded-[40px] space-y-8"
        >
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Report Title</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., BTC/USD: Macro Cycle Breakdown"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00D4FF] transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Technical Breakdown (Content)</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your technical analysis here..."
                  required
                  rows={12}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 outline-none focus:border-[#00D4FF] transition-all text-sm leading-relaxed"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#00D4FF] text-black font-black flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? "TRANSMITTING..." : <><Send size={18} /> Publish to Terminal</>}
              </button>

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-xl text-center"
                >
                  Analysis successfully synchronized with the global hub.
                </motion.div>
              )}
           </form>
        </motion.div>

        {/* 👁️ Preview */}
        <div className="space-y-6">
           <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
             <Layout size={14} /> Live Terminal Preview
           </div>
           
           <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[40px] p-8 min-h-[500px]">
              {title ? (
                <div className="space-y-6">
                  <div className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] text-[10px] font-black rounded-full w-fit uppercase">Technical Insight</div>
                  <h2 className="text-3xl font-black leading-tight">{title}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-700">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p className="text-xs font-mono uppercase tracking-widest">Waiting for input...</p>
                </div>
              )}
           </div>

           <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-3xl flex items-start gap-4">
              <AlertCircle className="text-orange-400 flex-shrink-0" size={20} />
              <p className="text-[10px] text-gray-500 uppercase font-bold leading-relaxed">
                Caution: Once published, this intelligence will be accessible to all institutional operatives globally. Ensure technical accuracy before transmission.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
