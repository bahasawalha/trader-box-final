"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Wallet, 
  Zap,
  Target,
  Clock,
  ArrowRight,
  Plus,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Activity,
  Loader2,
  X as CloseIcon,
  ShieldCheck,
  Signal,
  History
} from "lucide-react";

export default function ProviderDashboard() {
  const { isRTL, t, lang } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({ score: 0, subscribers: 0, earnings: 0 });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [pairs, setPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [newSignal, setNewSignal] = useState({
    symbol: "",
    type: "BUY",
    entryPrice: "",
    takeProfit: "",
    stopLoss: ""
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      const [s, r, p] = await Promise.all([
        apiFetch("/provider/stats"),
        apiFetch("/provider/recommendations"),
        apiFetch("/pairs")
      ]);
      setStats(s);
      setRecommendations(r);
      setPairs(p);
      if (p.length > 0 && !newSignal.symbol) {
        setNewSignal(prev => ({ ...prev, symbol: p[0].symbol }));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreateSignal(e: any) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/recommendations/create", {
        method: "POST",
        body: JSON.stringify(newSignal)
      });
      setSuccessMsg(isRTL ? "تم بث الإشارة بنجاح!" : "Signal Node activated successfully!");
      setShowCreator(false);
      setNewSignal({ symbol: "", type: "BUY", entryPrice: "", takeProfit: "", stopLoss: "" });
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      <div className="text-purple-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">{t.loading}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 md:p-12 font-inter pb-32">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 📢 Success Notification */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] bg-purple-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-[0_0_50px_rgba(168,85,247,0.3)]"
            >
              <ShieldCheck size={18} /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-500 text-[10px] font-black uppercase tracking-[0.4em]">
              <Signal size={14} /> {t.signal_node}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">{t.master_provider}</h1>
            <p className="text-gray-500 font-medium">{t.strategy_overview}</p>
          </div>
          <button 
            onClick={() => setShowCreator(true)}
            className="px-8 py-4 rounded-2xl bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all"
          >
            <Zap size={18} fill="currentColor" /> {isRTL ? 'إشارة جديدة' : 'NEW SIGNAL NODE'}
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricCard 
            icon={<TrendingUp className="text-green-400" />} 
            label={t.profit_score} 
            value={`${stats.score}%`} 
            trend="Institutional" 
          />
          <MetricCard 
            icon={<Users className="text-purple-400" />} 
            label={t.active_followers} 
            value={stats.subscribers.toString()} 
            trend="+8%" 
          />
          <MetricCard 
            icon={<Wallet className="text-[#00D4FF]" />} 
            label={t.unsettled_pnl} 
            value={`$${stats.earnings.toLocaleString()}`} 
            trend="Live" 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight">{t.live_signal_nodes}</h3>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{recommendations.length} {isRTL ? 'نشط' : 'ACTIVE'}</span>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="bg-[#121826] border border-dashed border-white/10 rounded-[40px] p-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-gray-700">
                  <Signal size={40} />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-black uppercase text-xs tracking-widest">{isRTL ? 'لا توجد إشارات حية' : 'NO LIVE SIGNALS'}</p>
                  <p className="text-gray-500 text-sm max-w-xs">{isRTL ? 'ابدأ ببث توصياتك لتظهر لمتابعيك هنا.' : 'Start broadcasting your trading signals to your subscriber nodes.'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((r) => (
                  <SignalItem 
                    key={r.id}
                    symbol={r.pair?.symbol || "N/A"} 
                    type={r.type} 
                    entry={r.entryPrice} 
                    target={r.takeProfit} 
                    stopLoss={r.stopLoss}
                    status={r.status}
                    time={r.createdAt}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
             <h3 className="text-2xl font-black tracking-tight">{t.broadcast_log}</h3>
             <div className="bg-[#0D1117] border border-white/5 rounded-[40px] p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <History size={100} className="text-purple-500" />
                </div>
                <div className="space-y-8 relative z-10">
                   <LogEntry title={isRTL ? "مزامنة الأسعار" : "Market Sync"} desc={isRTL ? "تم الاتصال ببروتوكول الأسعار بنجاح" : "Price feeds connected to operational nodes"} time="LIVE" />
                   <LogEntry title={isRTL ? "جهاز البث" : "Broadcast Node"} desc={isRTL ? "بوابة التوصيات تعمل بكفاءة عالية" : "Signal gateway performing at optimal capacity"} time="100%" />
                   <LogEntry title={isRTL ? "تدقيق المتابعين" : "Subscriber Audit"} desc={isRTL ? "تم تحديث قائمة المشتركين النشطين" : "Active subscriber list verified in ledger"} time="2m ago" />
                </div>
                <button className="w-full mt-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
                  {isRTL ? 'تحميل سجلات التدقيق' : 'FETCH AUDIT LOGS'}
                </button>
             </div>
          </div>

        </div>

      </div>

      <AnimatePresence>
        {showCreator && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreator(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-[#121826] border border-white/10 w-full max-w-xl rounded-[50px] p-10 relative z-10 shadow-3xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-500">
                    <Zap size={24} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{isRTL ? 'إشارة جديدة' : 'GENERATE SIGNAL'}</h2>
                </div>
                <button onClick={() => setShowCreator(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all text-xl">✕</button>
              </div>

              <form onSubmit={handleCreateSignal} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{t.asset_pair}</label>
                      <select 
                        value={newSignal.symbol}
                        onChange={(e) => setNewSignal({...newSignal, symbol: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-purple-500 text-lg font-black appearance-none cursor-pointer"
                        required
                      >
                         {pairs.map(p => (
                           <option key={p.id} value={p.symbol}>{p.symbol}</option>
                         ))}
                         {pairs.length === 0 && <option value="">{isRTL ? 'لا توجد أزواج متاحة' : 'No pairs available'}</option>}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{isRTL ? 'النوع' : 'NODE TYPE'}</label>
                      <select 
                        value={newSignal.type}
                        onChange={(e) => setNewSignal({...newSignal, type: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-purple-500 text-lg font-black appearance-none cursor-pointer text-purple-400"
                        required
                      >
                         <option value="BUY">BUY</option>
                         <option value="SELL">SELL</option>
                         <option value="BUY_LIMIT">{t.buy_limit}</option>
                         <option value="SELL_LIMIT">{t.sell_limit}</option>
                         <option value="BUY_STOP">{t.buy_stop}</option>
                         <option value="SELL_STOP">{t.sell_stop}</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{isRTL ? 'سعر الدخول' : 'ENTRY EXECUTION'}</label>
                   <input 
                     type="number" step="any"
                     min="0"
                     onKeyDown={(e) => { if(e.key === '-') e.preventDefault(); }}
                     value={newSignal.entryPrice}
                     onChange={(e) => setNewSignal({...newSignal, entryPrice: e.target.value})}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-purple-500 text-lg font-black" 
                     placeholder="0.00"
                     required
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-green-500/50 uppercase tracking-widest ml-2">TAKE PROFIT</label>
                      <input 
                        type="number" step="any"
                        min="0"
                        onKeyDown={(e) => { if(e.key === '-') e.preventDefault(); }}
                        value={newSignal.takeProfit}
                        onChange={(e) => setNewSignal({...newSignal, takeProfit: e.target.value})}
                        className="w-full bg-green-500/5 border border-green-500/20 rounded-2xl px-6 py-4 outline-none focus:border-green-500 text-lg font-black text-green-400" 
                        placeholder="0.00"
                        required
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-red-500/50 uppercase tracking-widest ml-2">STOP LOSS</label>
                      <input 
                        type="number" step="any"
                        min="0"
                        onKeyDown={(e) => { if(e.key === '-') e.preventDefault(); }}
                        value={newSignal.stopLoss}
                        onChange={(e) => setNewSignal({...newSignal, stopLoss: e.target.value})}
                        className="w-full bg-red-500/5 border border-red-500/20 rounded-2xl px-6 py-4 outline-none focus:border-red-500 text-lg font-black text-red-400" 
                        placeholder="0.00"
                        required
                      />
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-6 mt-4 rounded-[30px] bg-purple-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(168,85,247,0.3)] hover:bg-purple-500 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                  {isRTL ? 'تفعيل الإشارة' : 'ACTIVATE SIGNAL NODE'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-[#121826] border border-white/5 p-8 rounded-[45px] space-y-4 hover:border-purple-500/20 transition-all group relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-purple-500/10 transition-all" />
      <div className="flex justify-between items-start relative z-10">
        <div className="w-16 h-16 rounded-[22px] bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600/10 transition-all">{icon}</div>
        <div className="text-[10px] font-black text-purple-500 bg-purple-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest">{trend}</div>
      </div>
      <div className="relative z-10">
        <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-4xl font-black tracking-tighter">{value}</div>
      </div>
    </div>
  );
}

function SignalItem({ symbol, type, entry, target, stopLoss, status, time }: any) {
  return (
    <div className="bg-[#121826] border border-white/5 p-6 md:p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between hover:border-purple-500/30 transition-all group gap-6 shadow-xl">
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center font-black text-sm text-purple-400 group-hover:bg-purple-500/10 transition-colors shadow-inner">
          {symbol.split('/')[0]}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight">{symbol}</span>
            <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${type.startsWith('BUY') ? 'text-green-400 border-green-400/20 bg-green-400/10' : 'text-red-400 border-red-400/20 bg-red-400/10'}`}>
              {type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                <Clock size={12} className="text-purple-500" /> {new Date(time).toLocaleDateString()}
             </div>
             <div className="w-1 h-1 rounded-full bg-white/10" />
             <div className="text-[10px] font-mono text-gray-500 tracking-tight">Entry: <span className="text-white">{entry}</span></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full md:w-auto gap-8 md:gap-16">
        <div className="flex gap-8">
           <div className="text-center">
              <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">TP</div>
              <div className="text-sm font-black text-green-400">{target}</div>
           </div>
           <div className="text-center">
              <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">SL</div>
              <div className="text-sm font-black text-red-400">{stopLoss}</div>
           </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className={`text-xl font-black uppercase tracking-tighter ${status === 'COMPLETED' ? 'text-green-400' : 'text-[#00D4FF]'}`}>
               {status === 'PENDING' ? 'ACTIVE' : status}
            </div>
            <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Status</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 text-gray-700 group-hover:text-white group-hover:bg-purple-600/20 transition-all transform group-hover:translate-x-1">
             <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LogEntry({ title, desc, time }: any) {
  return (
    <div className="flex gap-5 group">
      <div className="w-px h-14 bg-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover:scale-125 transition-transform"></div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wide text-white/80 group-hover:text-white transition-colors">{title}</span>
          <span className="text-[10px] text-purple-500 font-black tracking-tighter bg-purple-500/10 px-2 py-0.5 rounded-md">{time}</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">{desc}</p>
      </div>
    </div>
  );
}
