"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Globe, Image as ImageIcon, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SponsorsPage() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [logo, setLogo] = useState("");
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/sponsors");
      setSponsors(data);
    } catch (e) { console.error(e); }
  }

  async function create() {
    if (!name || !url) return alert("Please fill name and URL");
    setLoading(true);
    try {
      await apiFetch("/admin/sponsors", {
        method: "POST",
        body: JSON.stringify({ name, url, logo })
      });
      setName("");
      setUrl("");
      setLogo("");
      load();
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-[#00D4FF]">Sponsorship Management</h1>
        <p className="text-gray-500 mt-1">Add and manage platform sponsors and advertisement partners.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#121826] border border-white/10 p-8 rounded-3xl space-y-4 shadow-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Plus className="text-[#00D4FF]" size={20} /> New Sponsor
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sponsor Name</label>
              <input
                placeholder="e.g. Binance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-[#00D4FF] outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-4 pl-12 rounded-xl bg-black/40 border border-white/10 focus:border-[#00D4FF] outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Logo URL (Optional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  placeholder="Image link..."
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full p-4 pl-12 rounded-xl bg-black/40 border border-white/10 focus:border-[#00D4FF] outline-none text-sm transition-all"
                />
              </div>
            </div>

            <button
              onClick={create}
              disabled={loading}
              className="w-full bg-[#00D4FF] text-black py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Creating..." : "Register Sponsor"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold px-2">Active Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsors.map((s) => (
              <motion.div
                key={s.id}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden p-2">
                    <img src={s.logo} alt={s.name} className="object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold">{s.name}</h3>
                    <a href={s.url} target="_blank" className="text-xs text-[#00D4FF] hover:underline truncate block max-w-[150px]">
                      {s.url}
                    </a>
                  </div>
                </div>
                <button className="text-gray-600 hover:text-[#FF4D4F] transition-colors p-2">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
