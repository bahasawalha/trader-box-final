"use client";

import Link from "next/link";
import { LayoutDashboard, PlusCircle, ListChecks, History, TrendingUp } from "lucide-react";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-[#121826] p-6 space-y-8 border-r border-white/10 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-[#00FF9C] rounded-lg flex items-center justify-center text-black font-bold">P</div>
          <h2 className="text-xl font-bold tracking-tight">Signal Master</h2>
        </div>

        <nav className="flex-1 space-y-1">
          <ProviderNavLink href="/provider" icon={<LayoutDashboard size={18} />} label="Performance" />
          <ProviderNavLink href="/provider/create" icon={<PlusCircle size={18} />} label="New Signal" />
          <ProviderNavLink href="/provider/recommendations" icon={<ListChecks size={18} />} label="Active Signals" />
          <ProviderNavLink href="/provider/history" icon={<History size={18} />} label="Trade History" />
        </nav>

        <div className="pt-6 border-t border-white/5">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
            ← Back to Platform
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}

function ProviderNavLink({ href, icon, label }: any) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-[#00FF9C] transition-all font-medium text-sm"
    >
      {icon}
      {label}
    </Link>
  );
}
