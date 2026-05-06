"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { FileText, Calendar, Eye, MessageSquare } from "lucide-react";

export default function AnalystDashboard() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/analyst/analyses");
      setAnalyses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Fetching your publications...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Published Analyses</h1>
        <p className="text-gray-500 mt-1">Manage your market insights and track reader engagement.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {analyses.map((a) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={a.id}
            className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl flex justify-between items-center group hover:border-[#00D4FF]/20 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold group-hover:text-[#00D4FF] transition-colors">{a.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(a.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 font-bold text-gray-400 uppercase tracking-widest">{a.isActive ? 'Published' : 'Draft'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-8 text-gray-500">
              <div className="flex flex-col items-center">
                <Eye size={16} />
                <span className="text-[10px] font-bold mt-1">1.2k</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageSquare size={16} />
                <span className="text-[10px] font-bold mt-1">24</span>
              </div>
            </div>
          </motion.div>
        ))}

        {analyses.length === 0 && (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500">
            You haven't published any analysis yet. 
            <br />
            <a href="/analyst/create" className="text-[#00D4FF] hover:underline font-bold mt-2 inline-block">Create your first post →</a>
          </div>
        )}
      </div>
    </div>
  );
}
