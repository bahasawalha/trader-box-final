"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { TrendingUp, Newspaper } from "lucide-react";

export default function NewsTicker() {
  const { lang, isRTL } = useLanguage();
  const [news, setNews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 600000); // Update every 10 mins
    return () => clearInterval(interval);
  }, [lang]);

  async function fetchNews() {
    try {
      const data = await apiFetch(`/api/news?lang=${lang}`);
      if (Array.isArray(data)) {
        setNews(data);
      }
    } catch (e) {
      console.error("News fetch failed", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading || news.length === 0) return null;

  return (
    <div className="w-full bg-[#00D4FF]/5 border-y border-[#00D4FF]/10 py-5 overflow-hidden flex items-center group mt-2">
      {/* 🏷️ Label */}
      <div className="px-8 flex items-center gap-3 text-[#00D4FF] font-black text-xs uppercase tracking-widest bg-[#0B0F1A] z-10 border-r border-[#00D4FF]/10 relative shadow-[15px_0_20px_rgba(11,15,26,1)]">
        <Newspaper size={18} />
        <span className="whitespace-nowrap">{isRTL ? 'آخر الأخبار' : 'Live Intel'}</span>
      </div>

      {/* 🏃 Marquee Container */}
      <div className="flex-1 relative flex items-center">
        <motion.div 
          className="flex whitespace-nowrap gap-16 items-center"
          animate={{ x: isRTL ? ["100%", "-100%"] : ["0%", "-100%"] }}
          transition={{ 
            duration: 300, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {/* Duplicate news twice for seamless loop */}
          {[...news, ...news].map((title, i) => (
            <div key={i} className="flex items-center gap-6 group/item">
              <span className="text-sm font-bold text-gray-200 hover:text-[#00D4FF] transition-colors cursor-default tracking-wide">
                {title}
              </span>
              <TrendingUp size={14} className="text-[#00D4FF]/40 group-hover/item:text-[#00D4FF] transition-colors" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* ⚡ Status indicator */}
      <div className="px-8 bg-[#0B0F1A] z-10 border-l border-[#00D4FF]/10 flex items-center gap-3 relative shadow-[-15px_0_20px_rgba(11,15,26,1)]">
         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
         <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Live Feed</span>
      </div>
    </div>
  );
}
