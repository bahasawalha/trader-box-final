"use client";

import Link from "next/link";
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Users, Megaphone, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-[#121826] p-6 space-y-8 border-r border-white/10 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-[#00D4FF] rounded-lg flex items-center justify-center text-black font-bold">A</div>
          <h2 className="text-xl font-bold tracking-tight">Admin Terminal</h2>
        </div>

        <nav className="flex-1 space-y-1">
          <AdminNavLink href="/admin" icon={<LayoutDashboard size={18} />} label="Overview" />
          <AdminNavLink href="/admin/deposits" icon={<ArrowDownCircle size={18} />} label="Deposits" />
          <AdminNavLink href="/admin/withdrawals" icon={<ArrowUpCircle size={18} />} label="Withdrawals" />
          <AdminNavLink href="/admin/users" icon={<Users size={18} />} label="User Manager" />
          <AdminNavLink href="/admin/sponsors" icon={<Megaphone size={18} />} label="Sponsorships" />
          <AdminNavLink href="/admin/audit-logs" icon={<Shield size={18} />} label="Audit Trail" />
          <AdminNavLink href="/admin/settings" icon={<Settings size={18} />} label="System Settings" />
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

function AdminNavLink({ href, icon, label }: any) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-[#00D4FF] transition-all font-medium text-sm"
    >
      {icon}
      {label}
    </Link>
  );
}
