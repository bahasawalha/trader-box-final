"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Info, 
  Zap, 
  CreditCard,
  X
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  async function loadNotifications() {
    try {
      const data = await apiFetch("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (e) { console.error(e); }
  }

  async function markAsRead(id: string) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShow(!show)}
        className="relative p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        {unreadCount > 0 ? (
          <BellRing className="text-[#00D4FF] animate-pulse" size={20} />
        ) : (
          <Bell className="text-gray-500 group-hover:text-white" size={20} />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0B0F1A]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {show && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-[#121826] border border-white/10 rounded-[32px] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="font-bold text-sm uppercase tracking-widest">Signal Hub</h3>
                <button onClick={() => setShow(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
              </div>

              <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-5 hover:bg-white/[0.02] transition-colors relative cursor-pointer ${!n.isRead ? 'bg-[#00D4FF]/5' : ''}`}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                  >
                    <div className="flex gap-4">
                      <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        n.type === 'SIGNAL' ? 'bg-purple-500/10 text-purple-400' : 
                        n.type === 'FINANCIAL' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {n.type === 'SIGNAL' ? <Zap size={16} /> : n.type === 'FINANCIAL' ? <CreditCard size={16} /> : <Info size={16} />}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-200">{n.title}</div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{n.message}</p>
                        <div className="text-[9px] text-gray-600 font-mono mt-2">{new Date(n.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    {!n.isRead && <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-[#00D4FF]"></div>}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="p-12 text-center text-gray-600 font-mono text-[10px] uppercase tracking-widest">
                    No active intelligence reports.
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                 <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-[#00D4FF] transition-colors">Clear All History</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
