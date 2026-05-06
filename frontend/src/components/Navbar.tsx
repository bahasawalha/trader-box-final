import Link from 'next/link';
import { Wallet, BarChart3, Users, HeadphonesIcon, Home } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-4 rounded-3xl z-50 flex items-center gap-8 border border-white/10">
      {[
        { icon: <Home size={20} />, label: 'Home', href: '/' },
        { icon: <Users size={20} />, label: 'Providers', href: '/providers' },
        { icon: <BarChart3 size={20} />, label: 'Analysis', href: '/analysis' },
        { icon: <Wallet size={20} />, label: 'Wallet', href: '/wallet' },
        { icon: <HeadphonesIcon size={20} />, label: 'Support', href: '/support' },
      ].map((item, i) => (
        <Link key={i} href={item.href} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00D4FF] transition-all">
          {item.icon}
          <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
