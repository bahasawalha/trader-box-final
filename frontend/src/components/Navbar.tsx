"use client";

import Link from 'next/link';
import { Wallet, BarChart3, Users, HeadphonesIcon, Home, Globe, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { t, toggleLang, lang } = useLanguage();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <Home size={20} />, label: t.home || 'Home', href: '/' },
    { icon: <Users size={20} />, label: t.providers || 'Providers', href: '/providers' },
    { icon: <BarChart3 size={20} />, label: t.analyses || 'Analysis', href: '/analysis' },
  ];

  if (user) {
    navItems.push({ icon: <Wallet size={20} />, label: t.wallet || 'Wallet', href: '/wallet' });
    
    if (user.role === 'ADMIN') {
      navItems.push({ icon: <LayoutDashboard size={20} />, label: 'Admin', href: '/admin' });
    } else if (user.role === 'PROVIDER') {
      navItems.push({ icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/provider' });
    }
  }

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-2xl px-6 py-4 rounded-[32px] z-50 flex items-center gap-6 border border-white/10 shadow-2xl">
      {navItems.map((item, i) => (
        <Link key={i} href={item.href} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00D4FF] transition-all group">
          <div className="group-hover:scale-110 transition-transform">{item.icon}</div>
          <span className="text-[9px] uppercase tracking-widest font-bold hidden md:block">{item.label}</span>
        </Link>
      ))}

      {user ? (
        <button onClick={logout} className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-all group">
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-[9px] uppercase tracking-widest font-bold hidden md:block">Logout</span>
        </button>
      ) : (
        <Link href="/login" className="flex flex-col items-center gap-1 text-[#00D4FF] hover:text-white transition-all group">
          <User size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-[9px] uppercase tracking-widest font-bold hidden md:block">Login</span>
        </Link>
      )}
      
      {/* 🌍 Language Toggle */}
      <button 
        onClick={toggleLang}
        className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-all group border-l border-white/10 pl-6"
      >
        <Globe size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-[9px] uppercase tracking-widest font-bold">{lang === 'en' ? 'AR' : 'EN'}</span>
      </button>
    </nav>
  );
}
