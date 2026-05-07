"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";

export default function MyRecommendations() {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/provider/recommendations");
      setRecs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Fetching your signals...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Signal History</h1>
        <p className="text-gray-500 mt-1">Monitor the status of your active and closed trading signals.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {recs.map((r) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={r.id}
            className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-[#00FF9C]/20 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${r.type === 'BUY' ? 'bg-[#00FF9C]/10 text-[#00FF9C]' : 'bg-[#FF4D4F]/10 text-[#FF4D4F]'}`}>
                {r.type}
              </div>
              <div>
                <h3 className="text-lg font-bold">{r.pair?.symbol || r.pairId}</h3>
                <p className="text-xs text-gray-500 font-mono">Published: {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-10 text-center">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Entry</p>
                <p className="font-mono text-sm">{r.entryPrice}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-[#00FF9C]">Target</p>
                <p className="font-mono text-sm">{r.takeProfit}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-[#FF4D4F]">Stop</p>
                <p className="font-mono text-sm">{r.stopLoss}</p>
              </div>
            </div>

            <div>
              <LocalStatusBadge status={r.status} />
            </div>
          </motion.div>
        ))}

        {recs.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500">
            No signals published yet.
          </div>
        )}
      </div>
    </div>
  );
}

function LocalStatusBadge({ status }: any) {
  const map: any = {
    ACTIVE: "bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/20",
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
    CLOSED: "bg-[#00FF9C]/20 text-[#00FF9C] border-[#00FF9C]/20",
    EXPIRED: "bg-gray-500/20 text-gray-400 border-gray-500/20"
  };

  return (
    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${map[status]}`}>
      {status}
    </div>
  );
}
