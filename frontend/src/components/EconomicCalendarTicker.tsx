"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, AlertCircle, Clock } from "lucide-react";

export default function EconomicCalendarTicker() {
  const { lang, isRTL } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendar();
    const interval = setInterval(fetchCalendar, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, [lang]);

  async function fetchCalendar() {
    try {
      const data = await apiFetch(`/api/calendar?lang=${lang}`);
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (e) {
      console.error("Calendar fetch failed", e);
    } finally {
      setLoading(false);
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "HIGH": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "MEDIUM": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "LOW": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-gray-500";
    }
  };

  if (loading || events.length === 0) return null;

  return (
    <div className="w-full bg-orange-500/5 border-b border-orange-500/10 py-4 overflow-hidden flex items-center group relative mt-[-2px]">
      {/* 🏷️ Label */}
      <div className="px-8 flex items-center gap-3 text-orange-500 font-black text-xs uppercase tracking-widest bg-[#0B0F1A] z-10 border-r border-orange-500/10 relative shadow-[15px_0_20px_rgba(11,15,26,1)]">
        <Calendar size={18} />
        <span className="whitespace-nowrap">{isRTL ? 'المفكرة الاقتصادية' : 'Economic Calendar'}</span>
      </div>

      {/* 🏃 Marquee Container */}
      <div className="flex-1 relative flex items-center overflow-hidden">
        <motion.div 
          className="flex whitespace-nowrap gap-12 items-center w-max"
          animate={{ x: isRTL ? ["0%", "50%"] : ["0%", "-50%"] }}
          transition={{ 
            duration: 40, // Fixed smooth duration
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {[...events, ...events].map((event, i) => (
            <div key={i} className="flex items-center gap-6 group/item">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-gray-200 uppercase tracking-wide">
                  {event.title}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                  <Clock size={10} className="text-gray-500" />
                  <span className="text-[10px] font-mono font-bold text-gray-400">{event.time}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black border ${getImpactColor(event.impact)}`}>
                  {event.impact}
                </div>
              </div>
              <div className="w-1 h-1 rounded-full bg-orange-500/20" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* ⚡ Status indicator */}
      <div className="px-8 bg-[#0B0F1A] z-10 border-l border-orange-500/10 flex items-center gap-3 relative shadow-[-15px_0_20px_rgba(11,15,26,1)]">
         <AlertCircle size={14} className="text-orange-500 animate-pulse" />
         <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Live Events</span>
      </div>
    </div>
  );
}
