"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import NotificationCenter from "@/components/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Users, 
  Shield, 
  Settings, 
  Megaphone,
  LogOut,
  ChevronRight,
  Zap,
  Globe,
  DollarSign,
  Gift,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t, lang, toggleLang, isRTL } = useLanguage();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-[#0B0F1A] text-white flex flex-col ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* 🛡️ Full Screen Overlay / Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* 🛡️ Drawer Sidebar (Hidden by default) */}
      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : (isRTL ? '100%' : '-100%') }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed top-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} w-80 h-screen bg-[#121826] border-white/5 flex flex-col z-50 shadow-3xl overflow-hidden`}
      >
        
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{t.admin_terminal}</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.master_authority}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all">
             <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
          <AdminNavLink href="/admin" icon={<LayoutDashboard size={18} />} label={t.home} close={() => setIsOpen(false)} />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            {isRTL ? 'المالية' : 'Financials'}
          </div>
          <AdminNavLink href="/wallet" icon={<DollarSign size={18} />} label={isRTL ? 'محفظتي الشخصية' : 'Personal Wallet'} close={() => setIsOpen(false)} />
          <AdminNavLink href="/admin/deposits" icon={<ArrowDownCircle size={18} />} label={t.inbound_liquidity} close={() => setIsOpen(false)} />
          <AdminNavLink href="/admin/withdrawals" icon={<ArrowUpCircle size={18} />} label={isRTL ? 'إدارة السحوبات' : 'Withdrawals'} close={() => setIsOpen(false)} />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            {isRTL ? 'الإدارة الإستراتيجية' : 'Strategy'}
          </div>
          <AdminNavLink href="/admin/users" icon={<Users size={18} />} label={isRTL ? 'إدارة المستخدمين' : 'User Access'} close={() => setIsOpen(false)} />
          <AdminNavLink href="/admin/sponsors" icon={<Megaphone size={18} />} label={isRTL ? 'الرعايات التجارية' : 'Sponsorships'} close={() => setIsOpen(false)} />
          <AdminNavLink href="/referrals" icon={<Gift size={18} />} label={isRTL ? 'نظام الإحالات' : 'Referral Node'} close={() => setIsOpen(false)} />
          <AdminNavLink href="/settings" icon={<Settings size={18} />} label={t.settings} close={() => setIsOpen(false)} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2 bg-black/20">
          <button 
            onClick={toggleLang}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-gray-500 hover:text-[#00D4FF] transition-all text-sm font-bold"
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
              <span>{t.logout}</span>
            </div>
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-12 bg-[#0B0F1A]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-3 bg-white/5 hover:bg-[#00D4FF]/10 border border-white/10 hover:border-[#00D4FF]/30 px-5 py-2.5 rounded-2xl transition-all"
            >
              <Menu size={20} className="text-gray-400 group-hover:text-[#00D4FF]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#00D4FF] hidden sm:block">
                {isRTL ? 'القائمة المركزية' : 'Command Center'}
              </span>
            </button>
            <div className={`hidden lg:flex items-center gap-6 text-xs text-gray-600`}>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" /> {t.system_health}: <span className="text-green-500 font-bold uppercase">{t.optimal}</span>
              </div>
              <div className="w-px h-4 bg-white/5" />
              <NotificationCenter />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`text-${isRTL ? 'left' : 'right'} hidden md:block`}>
              <div className="text-sm font-bold tracking-tight">Master Admin</div>
              <div className="text-[10px] text-[#00D4FF] font-black uppercase tracking-tighter">Root Authority</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center group hover:border-[#00D4FF]/50 transition-all">
               <Shield size={24} className="text-gray-500 group-hover:text-[#00D4FF] transition-colors" />
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

function AdminNavLink({ href, icon, label, close }: any) {
  const pathname = usePathname();
  const { isRTL } = useLanguage();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      onClick={close}
      className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
        isActive 
          ? "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 shadow-[0_0_30px_rgba(0,212,255,0.1)]" 
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
        <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_10px_#00D4FF]" />
      )}
    </Link>
  );
}
