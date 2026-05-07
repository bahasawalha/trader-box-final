"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import NotificationCenter from "@/components/NotificationCenter";
import { 
  BarChart3, 
  PlusSquare, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  Globe,
  DollarSign,
  Gift
} from "lucide-react";

export default function AnalystLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex">

      {/* 📊 Analyst Sidebar */}
      <aside className="w-72 bg-[#121826] border-r border-white/5 flex flex-col h-screen sticky top-0">
        
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Intelligence</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Market Analyst</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <AnalystNavLink href="/analyst" icon={<LayoutDashboard size={18} />} label="Overview" />
          <AnalystNavLink href="/wallet" icon={<DollarSign size={18} />} label="My Wallet" />
          <AnalystNavLink href="/analyst/publish" icon={<PlusSquare size={18} />} label="Publish Report" />
          <AnalystNavLink href="/analyst/history" icon={<TrendingUp size={18} />} label="My Reports" />
          <AnalystNavLink href="/referrals" icon={<Gift size={18} />} label="Referral Program" />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
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
            Sign Out <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0B0F1A]/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Terminal Status: <span className="text-blue-400 font-bold uppercase">Authorized</span>
            </div>
            <NotificationCenter />
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <div className="text-sm font-bold">Intelligence Officer</div>
                <div className="text-[10px] text-gray-500 font-mono text-blue-400">Analyst Tier 1</div>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/40 border border-blue-500/20"></div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}

function AnalystNavLink({ href, icon, label }: any) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
        isActive 
          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      {isActive && <ChevronRight size={14} />}
    </Link>
  );
}
