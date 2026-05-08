"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import NotificationCenter from "@/components/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  BarChart3, 
  PlusSquare, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Globe,
  DollarSign,
  Gift,
  Settings,
  Menu,
  X,
  Zap
} from "lucide-react";

export default function AnalystLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { lang, toggleLang, t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-[#0B0F1A] text-white flex flex-col ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* 📊 Analyst Drawer Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : (isRTL ? '100%' : '-100%') }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed top-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} w-80 h-screen bg-[#121826] border-white/5 flex flex-col z-50 shadow-3xl overflow-hidden`}
      >
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{t.intelligence}</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'محلل الأسواق' : 'Market Analyst'}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all">
             <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
          <AnalystNavLink href="/analyst" icon={<LayoutDashboard size={18} />} label={t.overview} close={() => setIsOpen(false)} />
          <AnalystNavLink href="/wallet" icon={<DollarSign size={18} />} label={t.my_wallet} close={() => setIsOpen(false)} />
          <AnalystNavLink href="/analyst/publish" icon={<PlusSquare size={18} />} label={t.publish_report} close={() => setIsOpen(false)} />
          <AnalystNavLink href="/analyst/history" icon={<TrendingUp size={18} />} label={t.my_reports} close={() => setIsOpen(false)} />
          <AnalystNavLink href="/referrals" icon={<Gift size={18} />} label={t.referral_program_nav} close={() => setIsOpen(false)} />
          <AnalystNavLink href="/settings" icon={<Settings size={18} />} label={t.settings} close={() => setIsOpen(false)} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2 bg-black/20">
          <button 
            onClick={toggleLang}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-all text-sm font-bold"
          >
            <div className="flex items-center gap-3">
              <Globe size={18} />
              <span>{lang === 'en' ? 'Arabic' : 'English'}</span>
            </div>
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all text-sm font-bold"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className={isRTL ? 'rotate-180' : ''} />
              <span>{t.sign_out}</span>
            </div>
          </button>
        </div>
      </motion.aside>

      {/* 📊 Analyst Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-12 bg-[#0B0F1A]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-3 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 px-5 py-2.5 rounded-2xl transition-all"
            >
              <Menu size={20} className="text-gray-400 group-hover:text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-400 hidden sm:block">
                {isRTL ? 'قائمة التحليل' : 'Intelligence Menu'}
              </span>
            </button>
            <div className="hidden lg:flex items-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-blue-400" /> {isRTL ? 'الحالة:' : 'Status:'} <span className="text-green-500 font-bold uppercase">{isRTL ? 'مصرح' : 'Authorized'}</span>
              </div>
              <NotificationCenter />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-${isRTL ? 'left' : 'right'} hidden md:block`}>
              <div className="text-sm font-bold tracking-tight">{t.officer}</div>
              <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{t.analyst_tier}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/10 flex items-center justify-center group hover:border-blue-500/50 transition-all">
               <BarChart3 size={24} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

    </div>
  );
}

function AnalystNavLink({ href, icon, label, close }: any) {
  const pathname = usePathname();
  const { isRTL } = useLanguage();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      onClick={close}
      className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
        isActive 
          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]" 
          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </div>
        <span className="text-sm font-black tracking-tight">{label}</span>
      </div>
      {isActive && (
        <motion.div layoutId="analystDot" className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6]" />
      )}
    </Link>
  );
}
