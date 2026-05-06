"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Send, TrendingUp, TrendingDown, Target, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateRecommendation() {
  const [form, setForm] = useState({
    pair: "",
    type: "BUY",
    entry: "",
    tp: "",
    sl: ""
  });
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.pair || !form.entry || !form.tp || !form.sl) return alert("Fill all fields");
    setLoading(true);
    try {
      await apiFetch("/recommendation", {
        method: "POST",
        body: JSON.stringify(form)
      });
      alert("Signal Published Successfully!");
      setForm({ pair: "", type: "BUY", entry: "", tp: "", sl: "" });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Launch New Signal</h1>
        <p className="text-gray-500">Submit your technical analysis to your subscribers.</p>
      </header>

      <div className="bg-[#121826] border border-white/10 p-10 rounded-3xl shadow-2xl space-y-8">
        {/* Pair & Type */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trading Pair</label>
            <input 
              placeholder="BTCUSDT" 
              value={form.pair}
              onChange={(e) => setForm({ ...form, pair: e.target.value.toUpperCase() })} 
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-[#00FF9C] outline-none font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Order Type</label>
            <select 
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-[#00FF9C] outline-none font-bold appearance-none cursor-pointer"
            >
              <option value="BUY" className="bg-[#121826] text-[#00FF9C]">BUY / LONG</option>
              <option value="SELL" className="bg-[#121826] text-[#FF4D4F]">SELL / SHORT</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Send size={12} /> Entry Price
            </label>
            <input 
              type="number"
              placeholder="0.00" 
              value={form.entry}
              onChange={(e) => setForm({ ...form, entry: e.target.value })} 
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-[#00FF9C] outline-none font-mono text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#00FF9C] uppercase tracking-widest flex items-center gap-2">
                <Target size={12} /> Take Profit
              </label>
              <input 
                type="number"
                placeholder="0.00" 
                value={form.tp}
                onChange={(e) => setForm({ ...form, tp: e.target.value })} 
                className="w-full p-4 rounded-xl bg-black/40 border border-[#00FF9C]/20 focus:border-[#00FF9C] outline-none font-mono text-lg text-[#00FF9C]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#FF4D4F] uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={12} /> Stop Loss
              </label>
              <input 
                type="number"
                placeholder="0.00" 
                value={form.sl}
                onChange={(e) => setForm({ ...form, sl: e.target.value })} 
                className="w-full p-4 rounded-xl bg-black/40 border border-[#FF4D4F]/20 focus:border-[#FF4D4F] outline-none font-mono text-lg text-[#FF4D4F]"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={submit} 
          disabled={loading}
          className="w-full bg-[#00FF9C] text-black py-5 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(0,255,156,0.3)] transition-all disabled:opacity-50"
        >
          {loading ? "Publishing Analysis..." : "Publish Signal to Subscribers"}
        </button>

        <p className="text-[10px] text-gray-600 text-center uppercase tracking-[0.2em] font-bold">
          Daily Limit: 10 Signals Remaining
        </p>
      </div>
    </div>
  );
}
