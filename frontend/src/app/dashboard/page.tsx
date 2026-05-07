"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Wallet, 
  TrendingUp, 
  Zap, 
  Activity, 
  ChevronRight, 
  ArrowUpRight, 
  Clock,
  ShieldCheck,
  Star,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
  const { isRTL, lang } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({ balance: 0, activeSubs: 0, winRate: 92 });
  const [recentSignals, setRecentSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [balanceData, providers] = await Promise.all([
        apiFetch("/wallet/balance"),
        apiFetch("/providers/top") // For simulation
      ]);
      setStats(prev => ({ ...prev, balance: balanceData.balance, activeSubs: 3 }));
      // Simulation of signals
      setRecentSignals([
        { id: 1, symbol: "BTC/USDT", type: "BUY", entry: "64,280", tp: "68,500", status: "ACTIVE", provider: "Alpha Node" },
        { id: 2, symbol: "ETH/USDT", type: "SELL", entry: "3,450", tp: "3,100", status: "PENDING", provider: "Pro Signal" },
        { id: 3, symbol: "SOL/USDT", type: "BUY", entry: "142.4", tp: "160.0", status: "COMPLETED", provider: "Whale Alert" },
      ]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
      <div className="text-[#00D4FF] font-black text-[10px] uppercase tracking-widest animate-pulse">Initializing Terminal...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 md:p-12 pb-32 font-inter">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 👋 Welcome Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#00D4FF] text-[10px] font-black uppercase tracking-[0.3em]">
              <LayoutDashboard size={14} /> {isRTL ? 'محطة التداول الشخصية' : 'PERSONAL TRADING TERMINAL'}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              {isRTL ? 'مرحباً بك،' : 'Welcome back,'} <span className="text-white/40">{user?.name || user?.email.split('@')[0]}</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <Link href="/wallet" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <Wallet size={16} /> {isRTL ? 'إيداع سريع' : 'Quick Deposit'}
            </Link>
          </div>
        </header>

        {/* 📊 Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            icon={<Wallet className="text-[#00D4FF]" />} 
            label={isRTL ? 'إجمالي الرصيد' : 'Available Liquidity'} 
            value={`$${stats.balance.toLocaleString()}`} 
            trend="+12.4%" 
          />
          <StatCard 
            icon={<Zap className="text-purple-400" />} 
            label={isRTL ? 'اشتراكات نشطة' : 'Active Signal Nodes'} 
            value={stats.activeSubs.toString()} 
            trend="Stable" 
          />
          <StatCard 
            icon={<Star className="text-yellow-400" />} 
            label={isRTL ? 'معدل النجاح' : 'System Win-Rate'} 
            value={`${stats.winRate}%`} 
            trend="Institutional" 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 📡 Live Signals Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black tracking-tight">{isRTL ? 'أحدث الإشارات' : 'Active Signals'}</h3>
              <Link href="/providers" className="text-[10px] font-black text-[#00D4FF] uppercase tracking-widest hover:gap-3 flex items-center gap-2 transition-all">
                {isRTL ? 'عرض جميع المزودين' : 'View All Providers'} <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentSignals.map((sig) => (
                <SignalRow key={sig.id} signal={sig} />
              ))}
            </div>
          </div>

          {/* 🏹 Quick Actions & News */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black tracking-tight">{isRTL ? 'التحليلات المقترحة' : 'Suggested Intel'}</h3>
            <div className="bg-[#121826] border border-white/5 rounded-[40px] p-8 space-y-6">
              <div className="space-y-4">
                <IntelItem title={isRTL ? 'تقرير حركة الحيتان' : 'Whale Movement Report'} date="2h ago" />
                <IntelItem title={isRTL ? 'توقعات الفائدة الفيدرالية' : 'FED Rate Prediction'} date="5h ago" />
                <IntelItem title={isRTL ? 'تحليل تقني: ETH 2.0' : 'Technical: ETH 2.0'} date="Yesterday" />
              </div>
              <Link href="/analysis" className="w-full py-4 rounded-2xl bg-white/5 text-center text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all block">
                {isRTL ? 'دخول مركز الأبحاث' : 'Enter Research Center'}
              </Link>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-800 rounded-[40px] p-8 space-y-4 shadow-2xl relative overflow-hidden group">
               <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
               <h4 className="text-xl font-black">{isRTL ? 'حسابك مؤمن' : 'Account Secured'}</h4>
               <p className="text-white/60 text-xs leading-relaxed font-medium">
                 {isRTL ? 'تستخدم Trader Box تشفيراً عسكرياً لحماية أصولك وبياناتك.' : 'Trader Box uses military-grade encryption to protect your assets and data.'}
               </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-[#121826] border border-white/5 p-8 rounded-[40px] space-y-4 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-[10px] font-black text-[#00FF9C] bg-[#00FF9C]/10 px-2 py-1 rounded-full uppercase tracking-widest">{trend}</div>
      </div>
      <div>
        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
        <div className="text-4xl font-black tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function SignalRow({ signal }: any) {
  const isBuy = signal.type === 'BUY';
  return (
    <div className="bg-[#0D1117] border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/[0.02] transition-all group">
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className={`w-14 h-14 rounded-2xl ${isBuy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} flex items-center justify-center shrink-0`}>
          <Activity size={24} />
        </div>
        <div>
          <div className="text-xl font-black">{signal.symbol}</div>
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{signal.provider}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10 w-full md:w-auto">
        <div>
          <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">Entry</div>
          <div className="text-sm font-mono font-bold">${signal.entry}</div>
        </div>
        <div>
          <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">Target</div>
          <div className="text-sm font-mono font-bold text-[#00FF9C]">${signal.tp}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
          signal.status === 'ACTIVE' ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'bg-gray-500/10 text-gray-500'
        }`}>
          {signal.status}
        </div>
        <button className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all shrink-0">
          <ArrowUpRight size={20} />
        </button>
      </div>
    </div>
  );
}

function IntelItem({ title, date }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="space-y-1">
        <div className="text-sm font-bold group-hover:text-[#00D4FF] transition-colors">{title}</div>
        <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold uppercase">
          <Clock size={10} /> {date}
        </div>
      </div>
      <ChevronRight size={14} className="text-gray-700 group-hover:translate-x-1 transition-transform" />
    </div>
  );
}
