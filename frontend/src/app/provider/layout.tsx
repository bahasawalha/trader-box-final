"use client";

import Link from "next/link";
import { 
  BarChart3, 
  Wallet, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight,
  Zap,
  DollarSign,
  Gift,
  Globe
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import NotificationCenter from "@/components/NotificationCenter";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { lang, toggleLang, isRTL } = useLanguage();
  const pathname = usePathname();

  return (
    <div className={`min-h-screen bg-[#0B0F1A] text-white flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* 🚀 Provider Sidebar */}
      <aside className={`w-72 bg-[#121826] border-${isRTL ? 'l' : 'r'} border-white/5 flex flex-col h-screen sticky top-0`}>
        
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{isRTL ? 'لوحة المزود' : 'Provider Hub'}</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'وصول معتمد' : 'Authorized Node'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <ProviderNavLink href="/provider" icon={<LayoutDashboard size={18} />} label={isRTL ? 'نظرة عامة' : 'Overview'} />
          
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">{isRTL ? 'رأس المال' : 'Capital'}</div>
          <ProviderNavLink href="/wallet" icon={<DollarSign size={18} />} label={isRTL ? 'محطة السحب' : 'Withdrawal Terminal'} />
          <ProviderNavLink href="/provider/earnings" icon={<Wallet size={18} />} label={isRTL ? 'عقدة الأرباح' : 'Earning Node'} />
          <ProviderNavLink href="/referrals" icon={<Gift size={18} />} label={isRTL ? 'برنامج الإحالة' : 'Referral Program'} />
          <ProviderNavLink href="/provider/stats" icon={<BarChart3 size={18} />} label={isRTL ? 'تحليلات عميقة' : 'Deep Analytics'} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
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
            {isRTL ? 'خروج' : 'Disconnect'} <LogOut size={16} className={isRTL ? 'rotate-180' : ''} />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0B0F1A]/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></div> 
              {isRTL ? 'حالة العقدة:' : 'Node Status:'} <span className="text-[#00D4FF] font-bold uppercase">{isRTL ? 'نشط' : 'Active'}</span>
            </div>
            <NotificationCenter />
          </div>
          <div className="flex items-center gap-4">
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <div className="text-sm font-bold">{isRTL ? 'مزود معتمد' : 'Authorized Provider'}</div>
              <div className="text-[10px] text-gray-500 font-mono text-[#00D4FF]">PRO-NODE-01</div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-[#00D4FF]/40 border border-[#00D4FF]/20"></div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}

function ProviderNavLink({ href, icon, label }: any) {
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
