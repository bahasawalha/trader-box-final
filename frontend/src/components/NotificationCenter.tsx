"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Info, 
  Zap, 
  CreditCard,
  X,
  Trash2
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function NotificationCenter() {
  const { user, logout } = useAuth();
  const { isRTL, t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadNotifications() {
    try {
      const data = await apiFetch("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (e: any) { 
      if (e.message === "Unauthorized" || e.message === "Invalid token") {
        logout(); // Sync app state if session expired
      } else {
        console.error("Failed to load notifications:", e);
      }
    }
  }

  async function markAsRead(id: string) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  }

  async function clearAll() {
    // Simulated clear
    setNotifications([]);
    setUnreadCount(0);
    setShow(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShow(!show)}
        className={`relative p-3 rounded-2xl border transition-all group ${
          show ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        {unreadCount > 0 ? (
          <BellRing className={show ? 'text-white' : 'text-blue-400 animate-pulse'} size={20} />
        ) : (
          <Bell size={20} />
        )}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'} w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0B0F1A] shadow-xl`}>
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className={`absolute top-full mt-4 w-[350px] md:w-96 bg-[#121826] border border-white/10 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[999] overflow-hidden ${isRTL ? 'left-0 sm:right-auto text-right' : 'right-0 sm:left-auto text-left'}`}
          >
            <div className="p-7 border-b border-white/5 flex justify-between items-center bg-white/[0.03] backdrop-blur-md">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Bell size={16} />
                 </div>
                 <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">{t.notifications_title}</h3>
              </div>
              <button onClick={() => setShow(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <X size={14} />
              </button>
            </div>

            <div className="max-h-[450px] overflow-y-auto divide-y divide-white/5 custom-scrollbar bg-black/20">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-6 hover:bg-white/[0.04] transition-all relative cursor-pointer group ${!n.isRead ? 'bg-blue-500/[0.03]' : ''}`}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                >
                  <div className="flex gap-5">
                    <div className={`mt-1 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      n.type === 'SIGNAL' ? 'bg-purple-500/20 text-purple-400' : 
                      n.type === 'FINANCIAL' ? 'bg-[#00FF9C]/20 text-[#00FF9C]' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {n.type === 'SIGNAL' ? <Zap size={20} /> : n.type === 'FINANCIAL' ? <CreditCard size={20} /> : <Info size={20} />}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="text-[13px] font-black text-white/90 group-hover:text-white transition-colors">{n.title}</div>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 text-[9px] text-gray-700 font-bold uppercase tracking-widest mt-2 italic">
                         <CheckCircle2 size={10} className={n.isRead ? 'text-[#00FF9C]' : 'text-gray-800'} />
                         {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className={`absolute top-8 ${isRTL ? 'left-6' : 'right-6'} w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]`}></div>
                  )}
                </div>
              ))}
              
              {notifications.length === 0 && (
                <div className="p-24 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 mx-auto flex items-center justify-center text-gray-800">
                     <Bell size={32} />
                  </div>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">
                    {t.no_notifications}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-5 bg-white/[0.02] border-t border-white/5 text-center backdrop-blur-md">
               <button 
                 onClick={clearAll}
                 className="flex items-center justify-center gap-2 mx-auto text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-red-400 transition-colors"
                >
                 <Trash2 size={12} /> {t.clear_history}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
