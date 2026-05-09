"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Users, 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight,
  Filter,
  Star,
  ArrowLeft
} from "lucide-react";

export default function ProvidersDirectory() {
  const { isRTL, lang } = useLanguage();
  const router = useRouter();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    try {
      const data = await apiFetch("/providers/top");
      setProviders(data);
    } catch (e) {
      console.error("Failed to load providers", e);
    } finally {
      setLoading(false);
    }
  }

  const filteredProviders = providers.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-t-2 border-[#00D4FF] rounded-full animate-spin"></div>
      <div className="text-[#00D4FF] text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Operatives...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-12 pb-32 font-inter">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 🏔️ Header & Back Link */}
        <div className="space-y-6">
          <motion.button 
            onClick={() => router.back()}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex items-center gap-2 text-[#00D4FF] hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] group"
          >
            <ArrowLeft size={16} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-[-4px] transition-transform`} />
            {isRTL ? 'الرجوع' : 'Back to Terminal'}
          </motion.button>

          <header className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                {isRTL ? 'مزودي التوصيات' : 'Signal Operatives'}
              </h1>
              <p className="text-gray-500 max-w-lg text-lg leading-relaxed font-medium">
                {isRTL 
                  ? 'الوصول إلى نخبة العقول المتداولة في العالم. أداء موثق وشفافية كاملة.' 
                  : "Access elite intelligence from the world's most disciplined trading minds. Performance verified on-chain."}
              </p>
            </div>
            
            <div className="relative w-full md:w-80 group">
               <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-[#00D4FF] transition-colors`} size={18} />
               <input 
                 type="text" 
                 placeholder={isRTL ? 'بحث عن مزود...' : 'Search by operative ID...'}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'} outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/20 transition-all text-sm`}
               />
            </div>
          </header>
        </div>

        {/* 📊 Metrics Overview */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickStat icon={<Users className="text-[#00D4FF]" />} label={isRTL ? 'المزودين النشطين' : 'Active Operatives'} value={providers.length} />
            <QuickStat 
              icon={<Star className="text-yellow-400" />} 
              label={isRTL ? 'أعلى نجاح شهري' : 'Top Monthly Success'} 
              value={`${Math.max(...providers.map(p => parseFloat(p.score || 0)), 0).toFixed(1)}%`} 
            />
            <QuickStat icon={<ShieldCheck className="text-[#00FF9C]" />} label={isRTL ? 'حالة التدقيق' : 'Audit Status'} value="Secured" />
         </div>

        {/* 🃏 Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredProviders.map((provider, i) => (
             <ProviderDirectoryCard key={provider.id} provider={provider} delay={i * 0.1} isRTL={isRTL} />
           ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-[40px]">
             <Search size={40} className="mx-auto text-gray-700 mb-4" />
             <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
               {isRTL ? 'لا يوجد نتائج مطابقة في قاعدة البيانات.' : 'No matching operatives found in the database.'}
             </p>
          </div>
        )}

      </div>
    </div>
  );
}

function QuickStat({ icon, label, value }: any) {
  return (
    <div className="bg-[#121826] border border-white/5 p-8 rounded-[32px] flex items-center gap-6 hover:bg-white/[0.02] transition-colors">
       <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">{icon}</div>
       <div>
         <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{label}</div>
         <div className="text-2xl font-black">{value}</div>
       </div>
    </div>
  );
}

function ProviderDirectoryCard({ provider, delay, isRTL }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -10 }}
      className="bg-gradient-to-br from-[#121826] to-[#0B0F1A] border border-white/10 rounded-[40px] p-8 relative overflow-hidden group shadow-3xl flex flex-col gap-8"
    >
      <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
        <Users size={120} />
      </div>

      <div className="relative z-10 space-y-6 flex-1">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl font-bold uppercase shadow-2xl">
             {provider.name?.charAt(0) || "U"}
           </div>
           <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold group-hover:text-[#00D4FF] transition-colors">{provider.name || "Anonymous Operative"}</h3>
              <ShieldCheck size={18} className="text-[#00D4FF] drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
            </div>
             <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'عضو نشط' : 'Active Member'}</span>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
             <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">{isRTL ? 'النجاح الشهري' : 'Monthly Success'}</div>
             <div className="text-lg font-mono font-bold text-[#00FF9C]">{provider.score}%</div>
           </div>
           <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
             <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">{isRTL ? 'إشارات (30ي)' : 'Signals (30d)'}</div>
             <div className="text-lg font-mono font-bold">{provider.recommendationCount}</div>
           </div>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* 🏢 Jumbo Sponsor Banner */}
        {provider.sponsors?.[0] && (
          <a 
            href={provider.sponsors[0].url || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-3xl border border-[#00D4FF]/30 rounded-[25px] shadow-[0_0_30px_rgba(0,212,255,0.15)] group/sponsor hover:bg-white/10 hover:border-[#00D4FF]/50 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00D4FF] overflow-hidden shrink-0">
               {provider.sponsors[0].logo?.startsWith('http') || provider.sponsors[0].logo?.startsWith('/') ? (
                  <img src={provider.sponsors[0].logo} alt={provider.sponsors[0].name} className="w-full h-full object-contain p-1" />
               ) : (
                  <div className="w-3 h-3 rounded-full bg-[#00D4FF] animate-pulse shadow-[0_0_20px_#00D4FF]" />
               )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#00D4FF] leading-none mb-2">{isRTL ? 'برعاية' : 'SPONSORED BY'}</span>
              <div className="text-xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform leading-none uppercase">{provider.sponsors[0].name}</div>
            </div>
          </a>
        )}

        <Link href={`/providers/${provider.id}`} className="block">
          <button className="w-full py-4 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-[#00D4FF] transition-all flex items-center justify-center gap-2 shadow-2xl">
            {isRTL ? 'فحص الاستراتيجية' : 'Inspect Strategy'} <ArrowUpRight size={16} />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
