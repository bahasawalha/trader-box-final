"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import NotificationCenter from "@/components/NotificationCenter";
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
  Gift
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t, lang, toggleLang, isRTL } = useLanguage();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex">

      {/* 🛡️ Premium Sidebar */}
      <aside className={`w-72 bg-[#121826] border-${isRTL ? 'l' : 'r'} border-white/5 flex flex-col h-screen sticky top-0`}>
        
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{t.admin_terminal}</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.master_authority}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <AdminNavLink href="/admin" icon={<LayoutDashboard size={18} />} label={t.home} />
          
          <div className={`pt-4 pb-2 px-4 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]`}>{isRTL ? 'المالية' : 'Financials'}</div>
          <AdminNavLink href="/wallet" icon={<DollarSign size={18} />} label={isRTL ? 'محفظتي الشخصية' : 'My Personal Wallet'} />
          <AdminNavLink href="/admin/deposits" icon={<ArrowDownCircle size={18} />} label={t.inbound_liquidity} />
          <AdminNavLink href="/admin/withdrawals" icon={<ArrowUpCircle size={18} />} label={isRTL ? 'إدارة السحوبات' : 'Outbound Requests'} />
          
          <div className={`pt-4 pb-2 px-4 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]`}>{isRTL ? 'الإدارة' : 'Management'}</div>
          <AdminNavLink href="/admin/users" icon={<Users size={18} />} label={isRTL ? 'مدير الكيانات' : 'Entity Manager'} />
          <AdminNavLink href="/admin/sponsors" icon={<Megaphone size={18} />} label={isRTL ? 'الرعايات' : 'Sponsorships'} />
          <AdminNavLink href="/referrals" icon={<Gift size={18} />} label={isRTL ? 'برنامج الإحالة' : 'Referral Program'} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
           {/* 🌍 Language Toggle in Sidebar for Admin */}
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
            {t.logout} <LogOut size={16} className={isRTL ? 'rotate-180' : ''} />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0B0F1A]/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[#00D4FF]" /> {t.system_health}: <span className="text-green-400 font-bold uppercase">{t.optimal}</span>
            </div>
            <NotificationCenter />
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-${isRTL ? 'left' : 'right'}`}>
              <div className="text-sm font-bold">Master Admin</div>
              <div className="text-[10px] text-gray-500 font-mono">0x71...Admin</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10"></div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}

function AdminNavLink({ href, icon, label }: any) {
  const pathname = usePathname();
  const { isRTL } = useLanguage();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
        isActive 
          ? "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      {isActive && <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />}
    </Link>
  );
}
