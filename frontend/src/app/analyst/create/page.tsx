"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Send, FileText, Type, AlignLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateAnalysis() {
  const [form, setForm] = useState({
    title: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.title || !form.content) return alert("Please provide both title and content.");
    setLoading(true);
    try {
      await apiFetch("/analysis", {
        method: "POST",
        body: JSON.stringify(form)
      });
      alert("Analysis Published Successfully!");
      setForm({ title: "", content: "" });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">New Market Publication</h1>
        <p className="text-gray-500">Share your technical or fundamental insights with the community.</p>
      </header>

      <div className="bg-[#121826] border border-white/10 p-10 rounded-3xl shadow-2xl space-y-8">
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Type size={14} /> Analysis Title
            </label>
            <input
              placeholder="e.g. BTC Bullish Wave Analysis"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-[#00D4FF] outline-none text-lg font-bold transition-all text-white"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft size={14} /> Publication Content
            </label>
            <textarea
              placeholder="Write your analysis here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full h-80 p-6 rounded-2xl bg-black/40 border border-white/10 focus:border-[#00D4FF] outline-none text-gray-300 resize-none leading-relaxed transition-all"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-[#00D4FF] text-black py-5 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <Send size={20} />
            {loading ? "Publishing Insight..." : "Publish to Public Feed"}
          </button>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
            <FileText size={18} />
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-bold leading-tight">
            Note: Once published, analyses are public and cannot be modified to ensure historical accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}
