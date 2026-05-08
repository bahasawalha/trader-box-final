"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { 
  LineChart, 
  Search, 
  ChevronRight, 
  MessageSquare, 
  Calendar, 
  User,
  ArrowLeft,
  Filter,
  Zap,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Activity
} from "lucide-react";
import NewsTicker from "@/components/NewsTicker";
import EconomicCalendarTicker from "@/components/EconomicCalendarTicker";

export default function AnalysesPage() {
  const { isRTL } = useLanguage();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
    try {
      const data = await apiFetch("/analyses");
      setAnalyses(data);
    } catch (error) {
      console.error("Failed to load analyses:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAnalyses = analyses.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.content && a.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center space-y-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
      </div>
      <div className="text-purple-500 font-black text-xs uppercase tracking-[0.4em]">Synchronizing Intelligence...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white font-inter selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* 🚀 Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-black/40 backdrop-blur-xl border border-white/5 px-8 py-4 rounded-[30px] pointer-events-auto">
          <motion.div
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Link href="/" className="flex items-center gap-4 text-purple-400 hover:text-white transition-all group">
              <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
              <span className="font-black text-[10px] uppercase tracking-widest">{isRTL ? 'العودة للرئيسية' : 'BACK TO TERMINAL'}</span>
            </Link>
          </motion.div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-2xl">
              <LineChart size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">Analyses Hub</span>
          </div>
        </div>
      </nav>

      {/* 🌌 Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-purple-600/10 blur-[150px] -z-10" />
         <div className="max-w-7xl mx-auto text-center space-y-8">
            <div className="text-purple-500 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">{isRTL ? 'الاستخبارات السوقية' : 'MARKET INTELLIGENCE'}</div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight uppercase">
              {isRTL ? 'قاعة التحليلات' : 'STRATEGIC'}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">{isRTL ? 'الاستراتيجية' : 'HUB'}</span>
            </h1>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed italic">
              {isRTL ? 'وصول حصري لأحدث التقارير الفنية والأساسية من نخبة المحللين المعتمدين.' : 'Exclusive access to the latest technical and fundamental reports from elite certified analysts.'}
            </p>
            <div className="pt-8 space-y-2">
              <NewsTicker />
              <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                <EconomicCalendarTicker />
              </div>
            </div>
         </div>
      </section>

      {/* 🔍 Search & Filters */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
         <div className="bg-[#121826]/60 backdrop-blur-3xl border border-white/5 rounded-[30px] p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-purple-500 transition-colors" size={20} />
               <input 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder={isRTL ? "البحث في التقارير..." : "Search intelligence reports..."} 
                 className="w-full bg-black/40 border border-white/5 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-purple-500/50 transition-all text-sm font-medium"
               />
            </div>
            <button className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
               <Filter size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">{isRTL ? 'تصفية' : 'FILTER'}</span>
            </button>
         </div>
      </section>

      {/* 📑 Analyses Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-40">
         {filteredAnalyses.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAnalyses.map((a, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-[#121826] border border-white/5 rounded-[40px] p-8 space-y-8 hover:border-purple-500/30 transition-all group relative overflow-hidden flex flex-col h-full"
                >
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity"><ArrowUpRight size={32} className="text-purple-400" /></div>
                   
                   {/* Thumbnail Placeholder */}
                   <div className="aspect-video rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden relative">
                      {a.image ? (
                        <img src={a.image} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Activity size={40} className="text-gray-800" />
                      )}
                      <div className="absolute top-4 left-4 px-3 py-1 bg-purple-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Premium</div>
                   </div>

                   <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3 text-[9px] text-purple-500 font-black uppercase tracking-[0.2em]">
                         <Zap size={14} /> {isRTL ? 'تحليل سوقي' : 'MARKET ANALYSIS'}
                      </div>
                      <h3 className="text-2xl font-black leading-tight group-hover:text-purple-400 transition-colors">{a.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                        {a.content?.replace(/<[^>]*>?/gm, '') || (isRTL ? 'لا يوجد وصف متاح لهذا التحليل حالياً.' : 'No description available for this analysis at the moment.')}
                      </p>
                   </div>

                   <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500"><User size={18} /></div>
                         <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                               <div className="text-[10px] font-black text-white uppercase">{a.author?.email.split('@')[0] || (isRTL ? 'محلل معتمد' : 'Certified Analyst')}</div>
                               <ShieldCheck size={12} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            </div>
                            <div className="text-[9px] text-gray-600 font-bold flex items-center gap-2"><Calendar size={10} /> {new Date(a.createdAt).toLocaleDateString()}</div>
                         </div>
                      </div>
                      <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-600 transition-all">
                        <ChevronRight size={20} className={isRTL ? "rotate-180" : ""} />
                      </button>
                   </div>
                </motion.div>
              ))}
           </div>
         ) : (
           <div className="py-40 text-center space-y-6">
              <div className="w-24 h-24 rounded-[40px] bg-white/5 mx-auto flex items-center justify-center text-gray-800 border border-white/5 shadow-inner">
                 <Search size={40} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black">{isRTL ? 'لم يتم العثور على تحليلات' : 'NO INTELLIGENCE FOUND'}</h3>
                 <p className="text-gray-600 text-sm">{isRTL ? 'حاول تغيير معايير البحث أو تصفح الأقسام الأخرى.' : 'Try changing your search terms or browse other categories.'}</p>
              </div>
           </div>
         )}
      </section>

      {/* 📊 Intelligence Status Bar */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-6">
         <div className="bg-black/60 backdrop-blur-3xl border border-white/5 rounded-full py-4 px-8 flex items-center justify-between shadow-3xl">
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-[#00FF9C] shadow-[0_0_10px_#00FF9C]" />
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{isRTL ? 'نظام الاستخبارات: نشط' : 'INTEL SYSTEM: ACTIVE'}</span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-purple-400">
               {filteredAnalyses.length} {isRTL ? 'تقرير متاح' : 'REPORTS AVAILABLE'}
            </div>
         </div>
      </footer>

    </div>
  );
}
