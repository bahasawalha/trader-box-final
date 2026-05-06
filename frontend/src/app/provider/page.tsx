"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Trophy, Users, DollarSign, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ProviderDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/provider/stats");
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Analyzing performance...</div>;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Performance Overview</h1>
        <p className="text-gray-500 mt-1">Track your score, subscribers, and net earnings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Reputation Score" 
          value={stats.score} 
          icon={<Trophy className="text-yellow-500" />} 
          desc="Based on signal accuracy"
        />
        <StatCard 
          label="Active Subscribers" 
          value={stats.subscribers} 
          icon={<Users className="text-[#00D4FF]" />} 
          desc="Monthly paying clients"
        />
        <StatCard 
          label="Total Earnings" 
          value={`$${stats.earnings.toFixed(2)}`} 
          icon={<DollarSign className="text-[#00FF9C]" />} 
          desc="Net profit from signals"
        />
      </div>

      {/* Placeholder for Chart */}
      <div className="bg-[#121826] border border-white/10 p-10 rounded-3xl h-64 flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest">
        Equity Growth Chart Coming Soon
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, desc }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl shadow-xl space-y-4"
    >
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
        <ArrowUpRight className="text-gray-600" size={16} />
      </div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</p>
        <h2 className="text-4xl font-bold mt-1 font-mono">{value}</h2>
        <p className="text-[10px] text-gray-600 mt-2 font-medium">{desc}</p>
      </div>
    </motion.div>
  );
}
