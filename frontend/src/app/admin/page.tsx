"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  Activity,
  ArrowUpRight,
  BarChart3,
  Settings,
  Database,
  Lock,
  Search,
  MoreVertical,
  X,
  CreditCard,
  UserCheck,
  RefreshCw,
  Ban,
  MessageSquare,
  DollarSign,
  Briefcase,
  ExternalLink
} from "lucide-react";

export default function AdminDashboard() {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<"overview" | "finance" | "partners" | "users" | "settings">("overview"); 
  const [stats, setStats] = useState({ totalUsers: 0, pendingDeposits: 0, platformRevenue: 0, activeSignals: 0 });
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [sponsorshipRequests, setSponsorshipRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [d, u, s] = await Promise.all([
        apiFetch("/admin/deposits/pending"),
        apiFetch("/admin/users"),
        apiFetch("/admin/sponsorships")
      ]);
      setPendingDeposits(d);
      setUsers(u);
      setSponsorshipRequests(s);
      
      setStats({
        totalUsers: u.length,
        pendingDeposits: d.length,
        platformRevenue: u.reduce((acc: number, user: any) => acc + (user.balance * 0.1), 0),
        activeSignals: 86
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function approveDeposit(depositId: number) {
    if (!confirm(isRTL ? "هل أنت متأكد من الموافقة؟" : "Are you sure?")) return;
    try {
      await apiFetch("/admin/deposit/approve", { method: "POST", body: JSON.stringify({ depositId }) });
      alert("Done!");
      loadAllData();
    } catch (e: any) { alert(e.message); }
  }

  async function changeUserRole(userId: number, role: string) {
    try {
      await apiFetch("/admin/user/role", { method: "POST", body: JSON.stringify({ userId, role }) });
      loadAllData();
    } catch (e: any) { alert(e.message); }
  }

  async function toggleBlock(userId: number, currentStatus: boolean) {
    const action = currentStatus ? (isRTL ? "إلغاء حظر" : "Unblock") : (isRTL ? "حظر" : "Block");
    if (!confirm(`${action} user?`)) return;
    try {
      await apiFetch("/admin/user/block", { method: "POST", body: JSON.stringify({ userId, isBlocked: !currentStatus }) });
      loadAllData();
    } catch (e: any) { alert(e.message); }
  }

  async function editBalance(userId: number) {
    const amount = prompt(isRTL ? "أدخل المبلغ (استخدم - للخصم):" : "Enter amount (use - to subtract):");
    if (!amount) return;
    try {
      await apiFetch("/admin/user/balance", { method: "POST", body: JSON.stringify({ userId, amount }) });
      loadAllData();
    } catch (e: any) { alert(e.message); }
  }

  async function sendAlert(userId: number) {
    const message = prompt(isRTL ? "أدخل رسالة التنبيه:" : "Enter alert message:");
    if (!message) return;
    try {
      await apiFetch("/admin/user/alert", { method: "POST", body: JSON.stringify({ userId, message }) });
      alert("Sent!");
    } catch (e: any) { alert(e.message); }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center space-y-4">
      <RefreshCw className="text-[#00D4FF] animate-spin" size={32} />
      <div className="text-[#00D4FF] font-black text-[10px] uppercase tracking-[0.4em]">Syncing Master Node...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 md:p-12 font-inter selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 🛡️ Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">
              <Shield size={14} /> {isRTL ? 'نظام الإدارة المركزي' : 'CENTRAL COMMAND SYSTEM'}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">Master Control</h1>
          </div>
          
          <nav className="flex bg-white/5 border border-white/10 p-1.5 rounded-[22px]">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label={isRTL ? 'نظرة عامة' : 'Overview'} />
            <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} label={isRTL ? 'المالية' : 'Finance'} />
            <TabButton active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} label={isRTL ? 'الشركاء' : 'Partners'} />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label={isRTL ? 'المستخدمين' : 'Users'} />
            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label={isRTL ? 'الإعدادات' : 'Config'} />
          </nav>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AdminStat icon={<Users />} label={isRTL ? 'إجمالي المستخدمين' : 'Total Users'} value={(stats.totalUsers || 0).toLocaleString()} color="border-blue-500/20" />
                <AdminStat icon={<AlertCircle />} label={isRTL ? 'إيداعات معلقة' : 'Pending Audits'} value={(stats.pendingDeposits || 0).toString()} color="border-yellow-500/20" />
                <AdminStat icon={<TrendingUp />} label={isRTL ? 'أرباح المنصة' : 'Total Revenue'} value={`$${(stats.platformRevenue || 0).toLocaleString()}`} color="border-green-500/20" />
                <AdminStat icon={<Activity />} label={isRTL ? 'إشارات نشطة' : 'Active Streams'} value={stats.activeSignals.toString()} color="border-purple-500/20" />
              </section>
            </motion.div>
          )}

          {activeTab === 'finance' && (
            <motion.div key="finance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <h3 className="text-3xl font-black">{isRTL ? 'إدارة الإيداعات' : 'Financial Audits'}</h3>
              <div className="bg-[#0D1117] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <table className="w-full text-left rtl:text-right">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr>
                      <th className="px-8 py-5">User</th>
                      <th className="px-8 py-5">Amount</th>
                      <th className="px-8 py-5">Ref / TxID</th>
                      <th className="px-8 py-5 text-right rtl:text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingDeposits.map(d => (
                      <tr key={d.id} className="hover:bg-white/[0.02]">
                        <td className="px-8 py-6">
                          <div className="font-bold text-sm">{d.user.name || 'Anonymous'}</div>
                          <div className="text-[10px] text-gray-600 font-mono">{d.user.email}</div>
                        </td>
                        <td className="px-8 py-6 font-mono text-sm text-green-400 font-bold">${d.amount}</td>
                        <td className="px-8 py-6 font-mono text-xs text-gray-400">{d.reference}</td>
                        <td className="px-8 py-6 text-right rtl:text-left">
                          <button onClick={() => approveDeposit(d.id)} className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 font-black text-[9px] uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all">Approve</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'partners' && (
            <motion.div key="partners" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black">{isRTL ? 'طلبات الرعاية' : 'Sponsorship Requests'}</h3>
                <div className="text-[10px] text-[#00D4FF] font-black uppercase tracking-widest bg-[#00D4FF]/10 px-4 py-2 rounded-full border border-[#00D4FF]/20">
                  {sponsorshipRequests.length} {isRTL ? 'طلبات واردة' : 'PENDING APPLICATIONS'}
                </div>
              </div>
              <div className="bg-[#0D1117] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <table className="w-full text-left rtl:text-right">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr>
                      <th className="px-8 py-5">{isRTL ? 'الشركة' : 'Company'}</th>
                      <th className="px-8 py-5">{isRTL ? 'النوع' : 'Type'}</th>
                      <th className="px-8 py-5">{isRTL ? 'الموقع / الترخيص' : 'Web / License'}</th>
                      <th className="px-8 py-5 text-right rtl:text-left">{isRTL ? 'الإجراء' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sponsorshipRequests.map(s => (
                      <tr key={s.id} className="hover:bg-white/[0.02]">
                        <td className="px-8 py-6">
                          <div className="font-bold text-sm">{s.companyName}</div>
                          <div className="text-[10px] text-gray-600 font-mono">{s.email}</div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">{s.type}</span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="text-[10px] text-gray-500 truncate max-w-[200px]">{s.website || '-'}</div>
                           <div className="text-[10px] text-purple-400 font-bold uppercase tracking-tight truncate max-w-[200px]">{s.license || '-'}</div>
                        </td>
                        <td className="px-8 py-6 text-right rtl:text-left">
                           <div className="flex justify-end gap-2">
                             <a href={`mailto:${s.email}`} className="px-4 py-2 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] font-black text-[9px] uppercase tracking-widest hover:bg-[#00D4FF] hover:text-black transition-all inline-flex items-center gap-2">
                               {isRTL ? 'تواصل' : 'CONTACT'} <ExternalLink size={12} />
                             </a>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {sponsorshipRequests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-gray-600 font-black text-xs uppercase tracking-[0.3em] italic">
                          {isRTL ? 'لا توجد طلبات جديدة حالياً' : 'No incoming applications at the moment'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black">{isRTL ? 'إدارة المستخدمين' : 'Global User Access'}</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input type="text" className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm outline-none focus:border-[#00D4FF] min-w-[300px]" placeholder="Search email..." />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                  <div key={u.id} className={`bg-[#121826] border ${u.isBlocked ? 'border-red-500/50' : 'border-white/5'} p-8 rounded-[40px] space-y-6 group hover:border-white/10 transition-all relative overflow-hidden`}>
                    {u.isBlocked && <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest z-10">Blocked</div>}
                    
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                      </div>
                      <select 
                        value={u.role} 
                        onChange={(e) => changeUserRole(u.id, e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-widest outline-none focus:border-[#00D4FF]"
                      >
                        <option value="USER">USER</option>
                        <option value="ANALYST">ANALYST</option>
                        <option value="PROVIDER">PROVIDER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    <div>
                      <div className="font-black text-lg truncate">{u.name || 'Trader Unit'}</div>
                      <div className="text-[10px] text-gray-600 font-mono truncate">{u.email}</div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="text-xs font-bold text-[#00D4FF]">${(u.balance || 0).toLocaleString()}</div>
                      <div className="flex gap-2">
                        <ActionButton icon={<DollarSign size={14}/>} onClick={() => editBalance(u.id)} color="hover:bg-green-500/10 text-green-500" />
                        <ActionButton icon={<MessageSquare size={14}/>} onClick={() => sendAlert(u.id)} color="hover:bg-blue-500/10 text-blue-500" />
                        <ActionButton icon={<Ban size={14}/>} onClick={() => toggleBlock(u.id, u.isBlocked)} color={u.isBlocked ? "bg-red-500 text-white" : "hover:bg-red-500/10 text-red-500"} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl space-y-12">
               <h3 className="text-3xl font-black">{isRTL ? 'إعدادات المنصة' : 'Global Settings'}</h3>
               <div className="bg-[#121826] border border-white/5 p-10 rounded-[40px] space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold">Platform Fee (%)</div>
                      <div className="text-xs text-gray-500">System slice from each signal</div>
                    </div>
                    <input type="number" defaultValue={30} className="w-20 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-center font-bold" />
                  </div>
                  <button className="w-full py-4 rounded-2xl bg-[#00D4FF] text-black font-black text-[10px] uppercase tracking-widest shadow-xl">Save All Changes</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function ActionButton({ icon, onClick, color }: any) {
  return (
    <button onClick={onClick} className={`w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center transition-all ${color}`}>
      {icon}
    </button>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-[#00D4FF] text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]' : 'text-gray-500 hover:text-white'
    }`}>
      {label}
    </button>
  );
}

function AdminStat({ icon, label, value, color }: any) {
  return (
    <motion.div 
      animate={{ 
        boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 20px rgba(0,212,255,0.1)", "0 0 0px rgba(0,0,0,0)"],
        borderColor: ["rgba(255,255,255,0.05)", "rgba(0,212,255,0.2)", "rgba(255,255,255,0.05)"]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-[#121826] border ${color} p-8 rounded-[40px] space-y-4 shadow-xl relative overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <div className="relative z-10">
        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
        <div className="text-4xl font-black tracking-tighter group-hover:text-[#00D4FF] transition-colors">{value}</div>
      </div>
    </motion.div>
  );
}
