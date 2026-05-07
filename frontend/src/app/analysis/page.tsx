"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { 
  LineChart, 
  TrendingUp, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronRight,
  Eye,
  MessageSquare,
  ArrowLeft
} from "lucide-react";

export default function AnalysisHub() {
  const { t, isRTL, lang } = useLanguage();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/analyses/latest");
      setAnalyses(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Function to return home on background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      router.push("/");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center space-y-6">
      <div className="w-12 h-12 border-4 border-white/5 border-t-[#00D4FF] rounded-full animate-spin" />
      <div className="text-[#00D4FF] font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">{t.loading}</div>
    </div>
  );

  return (
    <div 
      onClick={handleBackgroundClick}
      className="min-h-screen bg-[#05070A] text-white p-6 md:p-12 pb-32 cursor-default selection:bg-[#00D4FF]/30"
    >
      <div className="max-w-6xl mx-auto space-y-12 pointer-events-auto">
        
        {/* 🔍 Header & Search */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="group cursor-pointer" onClick={() => router.push("/")}>
            <motion.div
              animate={{ opacity: [1, 0.5, 1], x: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Link href="/" className="flex items-center gap-2 text-[#00D4FF] hover:text-white transition-all group">
                <ArrowLeft size={14} className={isRTL ? 'rotate-180' : ''} /> {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
              </Link>
            </motion.div>
            <h1 className="text-4xl font-black tracking-tight group-hover:text-[#00D4FF] transition-colors">{lang === 'en' ? 'Intelligence Hub' : 'مركز الأبحاث'}</h1>
            <p className="text-gray-500 mt-1">{lang === 'en' ? 'Institutional-grade market research and technical breakdowns.' : 'أبحاث السوق والتحليلات الفنية بمستوى المؤسسات.'}</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500`} size={18} />
              <input 
                placeholder={isRTL ? 'بحث عن تحليل...' : 'Search intelligence...'}
                className={`w-full bg-[#121826] border border-white/10 rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} outline-none focus:border-[#00D4FF]/30 transition-all text-sm shadow-xl`}
              />
            </div>
            <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-xl">
              <Filter size={20} />
            </button>
          </div>
        </header>

        {/* 💎 Featured Analysis (Highlight) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-[#00D4FF]/10 to-[#0D1117] border border-white/5 rounded-[40px] p-8 md:p-12 overflow-hidden group shadow-3xl"
        >
          <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
            <LineChart size={300} />
          </div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF] text-black text-[10px] font-black uppercase tracking-widest">
                {isRTL ? 'تحليل النخبة' : 'Elite Insight'}
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                {isRTL ? 'مستقبل البيتكوين بعد التقسيم: رؤية شاملة' : 'Post-Halving BTC Outlook: A Macro Breakdown'}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                {isRTL ? 'نغوص في أعماق البيانات الماكروية لنتوقع الحركة القادمة للأسواق العالمية.' : 'Diving deep into macro data to predict the next major move for global digital assets.'}
              </p>
              <div className="flex items-center gap-6 pt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Clock size={14} /> 12m read</span>
                <span className="flex items-center gap-2"><Eye size={14} /> 4.2k views</span>
              </div>
              <button className="px-8 py-4 rounded-2xl bg-[#00D4FF] text-black font-black hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:scale-105 transition-all flex items-center gap-2 group">
                {isRTL ? 'اقرأ التحليل الكامل' : 'Read Full Insight'} <ChevronRight size={18} className={`${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
              </button>
            </div>
            <div className="hidden md:block">
               <div className="aspect-video rounded-[32px] bg-black/40 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                 <TrendingUp size={120} className="text-[#00D4FF] opacity-20 group-hover:scale-125 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#00D4FF]/10 to-transparent"></div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* 📚 Analysis Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {analyses.map((a, idx) => (
            <AnalysisCard key={a.id} analysis={a} delay={idx * 0.1} />
          ))}
          {analyses.length < 3 && [1, 2, 3].map(i => (
            <AnalysisCard key={i} analysis={{ title: isRTL ? 'تحليل تقني للذهب' : 'Gold Technical Analysis', createdAt: new Date() }} delay={i * 0.1} />
          ))}
        </section>

      </div>
    </div>
  );
}

function AnalysisCard({ analysis, delay }: any) {
  const { isRTL, lang } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-[#121826] border border-white/5 rounded-[32px] p-8 hover:bg-white/[0.03] transition-all group flex flex-col h-full shadow-2xl"
    >
      <div className="h-40 rounded-2xl bg-black/40 border border-white/5 mb-6 flex items-center justify-center relative overflow-hidden">
        <LineChart size={48} className="text-gray-700 opacity-40 group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(analysis.createdAt).toLocaleDateString()}</span>
          <span className="text-[#00D4FF]">Technical</span>
        </div>
        <h3 className="text-xl font-bold leading-tight group-hover:text-[#00D4FF] transition-colors line-clamp-2">
          {analysis.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
          {analysis.content || (lang === 'en' ? 'Institutional market breakdown by our expert analyst team.' : 'تحليل سوقي مؤسساتي مقدم من قبل فريق خبراء المحللين لدينا.')}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
           <MessageSquare size={14} /> 12 {isRTL ? 'تعليق' : 'Comments'}
        </div>
        <button className="text-[#00D4FF] font-black text-xs uppercase tracking-widest flex items-center gap-2 group">
          {isRTL ? 'عرض' : 'View'} <ExternalLink size={14} className="group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
