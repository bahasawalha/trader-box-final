"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Wallet, 
  Zap,
  Target,
  Clock,
  ArrowRight
} from "lucide-react";

export default function ProviderDashboard() {
  const [stats, setStats] = useState({
    score: 0,
    subscribers: 0,
    earnings: 0
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [s, r] = await Promise.all([
        apiFetch("/provider/stats"),
        apiFetch("/provider/recommendations")
      ]);
      setStats(s);
      setRecommendations(r);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="text-gray-500 font-mono p-10 animate-pulse">Syncing Signal Performance...</div>;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategy Overview</h1>
          <p className="text-gray-500 mt-1">Real-time metrics for your trading algorithms and active signals.</p>
        </div>
        <Link href="/provider/create" className="px-6 py-3 rounded-2xl bg-purple-500 text-white font-bold flex items-center gap-2 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all">
          <Zap size={18} fill="currentColor" /> New Signal
        </Link>
      </header>

      {/* 📊 Provider Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProviderStatCard 
          icon={<TrendingUp />} 
          label="Profit Score" 
          value={`${stats.score}%`} 
          desc="Overall Win Ratio" 
          color="text-green-400" 
        />
        <ProviderStatCard 
          icon={<Users />} 
          label="Active Followers" 
          value={stats.subscribers} 
          desc="Subscribed Entities" 
          color="text-purple-400" 
        />
        <ProviderStatCard 
          icon={<Wallet />} 
          label="Unsettled PnL" 
          value={`$${stats.earnings.toLocaleString()}`} 
          desc="Claimable Rewards" 
          color="text-[#00D4FF]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🏹 Active Signals Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold flex items-center gap-2"><Target size={20} className="text-purple-400" /> Live Signal Nodes</h2>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{recommendations.length} Active</span>
          </div>
          
          <div className="space-y-4">
            {recommendations.map((r) => (
              <LiveSignalItem 
                key={r.id}
                symbol={r.pair?.symbol || "N/A"} 
                type={r.type} 
                entry={r.entryPrice} 
                target={r.takeProfit} 
                status={r.status}
              />
            ))}
            {recommendations.length === 0 && <p className="text-center text-gray-600 font-mono py-10">No active signals found.</p>}
          </div>
        </div>

        {/* 🕒 Recent Activity Audit */}
        <div className="bg-[#121826] border border-white/5 rounded-[40px] p-8">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2"><Clock size={20} className="text-gray-500" /> Broadcast Log</h2>
          <div className="space-y-6">
            <LogEntry title="Signal Feed Active" desc="Core engine monitoring prices" time="Just now" />
            <LogEntry title="System Sync" desc="Binance API heartbeat optimal" time="Live" />
          </div>
          <button className="w-full mt-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            View Full Audit
          </button>
        </div>

      </div>
    </div>
  );
}

function ProviderStatCard({ icon, label, value, desc, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121826] border border-white/5 p-8 rounded-[40px] relative overflow-hidden group shadow-xl"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110">
        {icon}
      </div>
      <div className={`${color} mb-6`}>{icon}</div>
      <div className="text-4xl font-bold tracking-tight mb-1">{value}</div>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</div>
      <p className="text-xs text-gray-600">{desc}</p>
    </motion.div>
  );
}

function LiveSignalItem({ symbol, type, entry, target, status }: any) {
  return (
    <div className="bg-[#121826] border border-white/5 p-6 rounded-[32px] flex items-center justify-between hover:border-purple-500/30 transition-all cursor-pointer group">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-sm text-purple-400 group-hover:bg-purple-500/10 transition-colors">
          {symbol.split('/')[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{symbol}</span>
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${type === 'BUY' || type === 'LONG' ? 'text-green-400 border-green-400/20 bg-green-400/10' : 'text-red-400 border-red-400/20 bg-red-400/10'}`}>
              {type}
            </span>
          </div>
          <div className="text-[10px] text-gray-600 font-mono mt-1 uppercase tracking-widest">Entry: {entry} → Target: {target}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="text-right">
          <div className={`text-lg font-bold uppercase ${status === 'WIN' ? 'text-green-400' : status === 'LOSS' ? 'text-red-400' : 'text-[#00D4FF]'}`}>{status}</div>
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Status</div>
        </div>
        <ArrowRight size={20} className="text-gray-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}

function LogEntry({ title, desc, time }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-px h-12 bg-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold">{title}</span>
          <span className="text-[10px] text-gray-600 font-mono">{time}</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
