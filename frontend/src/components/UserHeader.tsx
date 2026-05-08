"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import NotificationCenter from "./NotificationCenter";
import { 
  Settings, 
  LogOut, 
  User as UserIcon,
  Zap,
  ShieldPlus
} from "lucide-react";

export default function UserHeader() {
  const { user, logout } = useAuth();
  const { isRTL, lang, toggleLang, t } = useLanguage();
  const pathname = usePathname();

  if (!user) return null;

  const isDashboardView = pathname.startsWith("/admin") || 
                          pathname.startsWith("/analyst") || 
                          pathname.startsWith("/provider");

  const getDashboardLink = () => {
    if (user.role === 'ADMIN') return "/admin";
    if (user.role === 'PROVIDER') return "/provider";
    if (user.role === 'ANALYST') return "/analyst";
    return "/dashboard";
  };

  return (
    <header className="h-20 border-b border-white/5 bg-[#0B0F1A]/80 backdrop-blur-xl sticky top-0 z-[100] px-6 md:px-12 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Zap className="text-[#00D4FF]" size={24} fill="currentColor" />
        <span className="font-black text-xl tracking-tighter uppercase">TraderBox</span>
      </Link>

      <div className="flex items-center gap-4 md:gap-8">
        {!isDashboardView && (
          <nav className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Link href={getDashboardLink()} className="hover:text-[#00D4FF] transition-colors">{isRTL ? 'اللوحة' : 'Dashboard'}</Link>
              <Link href="/wallet" className="hover:text-white transition-colors">{isRTL ? 'المحفظة' : 'Wallet'}</Link>
              <Link href="/referrals" className="hover:text-white transition-colors">{isRTL ? 'الإحالات' : 'Referrals'}</Link>
              <Link href="/providers" className="hover:text-white transition-colors">{isRTL ? 'المزودين' : 'Operatives'}</Link>
              <Link href="/analysis" className="hover:text-white transition-colors">{isRTL ? 'التحليلات' : 'Intelligence'}</Link>
          </nav>
        )}

        <div className="flex items-center gap-4 border-l border-white/10 pl-4 md:pl-8">
          <button 
            onClick={toggleLang}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-xs font-black uppercase"
          >
            {lang === 'en' ? 'AR' : 'EN'}
          </button>
          <NotificationCenter />
          
          <div className="group relative">
            <button className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all overflow-hidden">
               {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-gray-500" />}
            </button>
            
            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-[#121826] border border-white/10 rounded-[24px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 z-[110]`}>
               <div className="p-4 border-b border-white/5 mb-2">
                  <div className="text-xs font-bold truncate">{user.email}</div>
                  <div className="text-[9px] text-[#00D4FF] font-black uppercase tracking-widest mt-1">{user.role} NODE</div>
               </div>
               <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-xs font-bold">
                  <Settings size={16} /> {isRTL ? 'الإعدادات' : 'Terminal Settings'}
               </Link>
               {user.role === 'USER' && (
                 <Link href="/upgrade" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all text-xs font-bold">
                    <ShieldPlus size={16} /> {isRTL ? 'ترقية الحساب' : 'Upgrade Account'}
                 </Link>
               )}
               <button 
                 onClick={logout}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all text-xs font-bold"
               >
                  <LogOut size={16} /> {isRTL ? 'خروج' : 'Disconnect'}
               </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
