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
  const { isRTL, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"overview" | "finance" | "partners" | "users" | "upgrades" | "settings">("overview"); 
  const [userRoleTab, setUserRoleTab] = useState<"ALL" | "USER" | "PROVIDER" | "ANALYST" | "COMPANY" | "ADMIN">("ALL");
  const [stats, setStats] = useState({ totalUsers: 0, pendingDeposits: 0, platformRevenue: 0, activeSignals: 0 });
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [sponsorshipRequests, setSponsorshipRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [config, setConfig] = useState<{ settings: any, methods: any[], pairs: any[] }>({ settings: { platformFee: 30 }, methods: [], pairs: [] });
  const [newMethod, setNewMethod] = useState({ name: "", address: "" });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [d, u, s, r, st, cfg] = await Promise.all([
        apiFetch("/admin/deposits/pending"),
        apiFetch("/admin/users"),
        apiFetch("/admin/sponsorships"),
        apiFetch("/admin/role-requests"),
        apiFetch("/admin/stats"),
        apiFetch("/admin/settings")
      ]);
      setPendingDeposits(d);
      setUsers(u);
      setSponsorshipRequests(s);
      setRoleRequests(r);
      setStats(st);
      setConfig(cfg);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function updateFee(fee: number) {
    if (fee < 0) {
      alert(isRTL ? "يجب أن تكون الرسوم قيمة موجبة!" : "Fee must be a positive value!");
      return;
    }
    try {
      await apiFetch("/admin/settings/fee", { method: "POST", body: JSON.stringify({ platformFee: fee }) });
      alert(isRTL ? "تم تحديث الرسوم!" : "Fees updated!");
      setConfig(prev => ({ ...prev, settings: { ...prev.settings, platformFee: fee } }));
    } catch (e: any) { alert(e.message); }
  }

  async function addMethod() {
    if (!newMethod.name || !newMethod.address) return;
    try {
      await apiFetch("/admin/settings/methods", { method: "POST", body: JSON.stringify(newMethod) });
      setNewMethod({ name: "", address: "" });
      const cfg = await apiFetch("/admin/settings");
      setConfig(cfg);
    } catch (e: any) { alert(e.message); }
  }

  async function deleteMethod(id: string) {
    if (!confirm(isRTL ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      await apiFetch(`/admin/settings/methods/${id}`, { method: "DELETE" });
      const cfg = await apiFetch("/admin/settings");
      setConfig(cfg);
    } catch (e: any) { alert(e.message); }
  }

  async function resolveRoleRequest(requestId: string, status: "APPROVED" | "REJECTED") {
    if (!requestId) return;
    const adminNote = prompt(isRTL ? "ملاحظة إدارية (اختياري):" : "Admin Note (Optional):") || "";
    
    try {
      const res = await apiFetch("/admin/role-requests/resolve", {
        method: "POST",
        body: JSON.stringify({ requestId, status, adminNote })
      });
      
      if (res && res.success) {
        await loadAllData();
      }
    } catch (e: any) { 
    }
  }

  async function approveDeposit(depositId: number) {
    if (!confirm(isRTL ? "هل أنت متأكد من الموافقة؟" : "Are you sure you want to approve?")) return;
    try {
      await apiFetch("/admin/deposit/approve", { method: "POST", body: JSON.stringify({ depositId }) });
      alert(isRTL ? "تم بنجاح!" : "Done!");
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
    if (!confirm(isRTL ? `هل تريد ${action} هذا المستخدم؟` : `${action} user?`)) return;
    try {
      await apiFetch("/admin/user/block", { method: "POST", body: JSON.stringify({ userId, isBlocked: !currentStatus }) });
      loadAllData();
    } catch (e: any) { alert(e.message); }
  }

  async function changePrice(userId: string, currentPrice: number) {
    const newPriceStr = prompt(isRTL ? "أدخل سعر الاشتراك الجديد (الحد الأدنى $29):" : "Enter new subscription price (Min $29):", currentPrice.toString());
    if (!newPriceStr) return;
    const price = parseFloat(newPriceStr);
    if (isNaN(price) || price < 29) {
       alert(isRTL ? "السعر غير صالح (الحد الأدنى $29)" : "Invalid price (Min $29)");
       return;
    }
    try {
      await apiFetch("/admin/user/price", { method: "POST", body: JSON.stringify({ userId, price }) });
      loadAllData();
    } catch (e: any) { alert(e.message); }
  }

  async function editBalance(userId: number) {
    const amountStr = prompt(isRTL ? "أدخل المبلغ (استخدم - للخصم):" : "Enter amount (use - to subtract):");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return;

    try {
      // Fetch current balance to prevent negative result
      const user = users.find(u => u.id === userId);
      if (user && (user.balance + amount) < 0) {
        alert(isRTL ? "لا يمكن أن يكون الرصيد النهائي سالباً!" : "Final balance cannot be negative!");
        return;
      }

      await apiFetch("/admin/user/balance", { method: "POST", body: JSON.stringify({ userId, amount }) });
      loadAllData();
    } catch (e: any) { alert(e.message); }
  }

  async function sendAlert(userId: number) {
    const message = prompt(isRTL ? "أدخل رسالة التنبيه:" : "Enter alert message:");
    if (!message) return;
    try {
      await apiFetch("/admin/user/alert", { method: "POST", body: JSON.stringify({ userId, message }) });
      alert(isRTL ? "تم الإرسال!" : "Sent!");
    } catch (e: any) { alert(e.message); }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center space-y-4">
      <RefreshCw className="text-[#00D4FF] animate-spin" size={32} />
      <div className="text-[#00D4FF] font-black text-[10px] uppercase tracking-[0.4em]">
        {isRTL ? 'جاري مزامنة عقدة الإدارة...' : 'Syncing Master Node...'}
      </div>
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
            <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">
              {isRTL ? 'تحكم الإدارة' : 'Master Control'}
            </h1>
          </div>
          
          <nav className="flex bg-white/5 border border-white/10 p-1.5 rounded-[22px]">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label={isRTL ? 'نظرة عامة' : 'Overview'} />
            <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} label={isRTL ? 'المالية' : 'Finance'} />
            <TabButton active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} label={isRTL ? 'الشركاء' : 'Partners'} />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label={isRTL ? 'المستخدمين' : 'Users'} />
            <TabButton active={activeTab === 'upgrades'} onClick={() => setActiveTab('upgrades')} label={isRTL ? 'الترقيات' : 'Upgrades'} />
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
                      <th className="px-8 py-5">{isRTL ? 'المستخدم' : 'User'}</th>
                      <th className="px-8 py-5">{isRTL ? 'المبلغ' : 'Amount'}</th>
                      <th className="px-8 py-5">{isRTL ? 'رقم العملية' : 'Ref / TxID'}</th>
                      <th className="px-8 py-5 text-right rtl:text-left">{isRTL ? 'الإجراء' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingDeposits.map(d => (
                      <tr key={d.id} className="hover:bg-white/[0.02]">
                        <td className="px-8 py-6">
                          <div className="font-bold text-sm">{d.user.name || (isRTL ? 'مجهول' : 'Anonymous')}</div>
                          <div className="text-[10px] text-gray-600 font-mono">{d.user.email}</div>
                        </td>
                        <td className="px-8 py-6 font-mono text-sm text-green-400 font-bold">${d.amount}</td>
                        <td className="px-8 py-6 font-mono text-xs text-gray-400">{d.reference}</td>
                        <td className="px-8 py-6 text-right rtl:text-left">
                          <button onClick={() => approveDeposit(d.id)} className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 font-black text-[9px] uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all">
                            {isRTL ? 'موافقة' : 'Approve'}
                          </button>
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
                  <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500`} size={16} />
                  <input 
                    type="text" 
                    className={`bg-white/5 border border-white/10 rounded-2xl ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-3 text-sm outline-none focus:border-[#00D4FF] min-w-[300px]`} 
                    placeholder={isRTL ? 'ابحث عن إيميل...' : 'Search email...'} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* 📂 Role Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 max-w-fit">
                {[
                  { id: 'ALL', label: isRTL ? 'الكل' : 'ALL' },
                  { id: 'USER', label: isRTL ? 'المتداولين' : 'TRADERS' },
                  { id: 'PROVIDER', label: isRTL ? 'المزودين' : 'PROVIDERS' },
                  { id: 'ANALYST', label: isRTL ? 'المحللين' : 'ANALYSTS' },
                  { id: 'COMPANY', label: isRTL ? 'الشركات' : 'COMPANIES' },
                  { id: 'ADMIN', label: isRTL ? 'المدراء' : 'ADMINS' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setUserRoleTab(tab.id as any)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      userRoleTab === tab.id 
                        ? 'bg-[#00D4FF] text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users
                .filter(u => userRoleTab === 'ALL' || u.role === userRoleTab)
                .filter(u => 
                  u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  u.name?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(u => (
                  <div key={u.id} className={`bg-[#121826] border ${u.isBlocked ? 'border-red-500/50' : 'border-white/5'} p-8 rounded-[40px] space-y-6 group hover:border-white/10 transition-all relative overflow-hidden`}>
                    {u.isBlocked && <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest z-10">{isRTL ? 'محظور' : 'Blocked'}</div>}
                    
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
                        <option value="COMPANY">COMPANY</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    <div>
                      <div className="font-black text-lg truncate">{u.name || (isRTL ? 'متداول' : 'Trader Unit')}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] text-gray-600 font-mono truncate">{u.email}</div>
                        {u.role === 'PROVIDER' && (
                          <button 
                            onClick={() => changePrice(u.id, u.subscriptionPrice || 29)}
                            className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all"
                          >
                            ${u.subscriptionPrice || 29}/mo
                          </button>
                        )}
                      </div>
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

          {activeTab === 'upgrades' && (
            <motion.div key="upgrades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black">{isRTL ? 'طلبات ترقية الرتب' : 'Role Upgrade Applications'}</h3>
              </div>
              <div className="bg-[#0D1117] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <table className="w-full text-left rtl:text-right">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr>
                      <th className="px-8 py-5">{isRTL ? 'المستخدم' : 'User'}</th>
                      <th className="px-8 py-5">{isRTL ? 'الرتبة المطلوبة' : 'Requested Role'}</th>
                      <th className="px-8 py-5">{isRTL ? 'السبب' : 'Reason'}</th>
                      <th className="px-8 py-5">{isRTL ? 'الحالة' : 'Status'}</th>
                      <th className="px-8 py-5 text-right rtl:text-left">{isRTL ? 'الإجراء' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {roleRequests.filter(r => r.status?.toUpperCase() === 'PENDING').map(r => (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <td className="px-8 py-6">
                          <div className="font-bold text-sm">{r.user.name || (isRTL ? 'مجهول' : 'Anonymous')}</div>
                          <div className="text-[10px] text-gray-600 font-mono">{r.user.email}</div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                             r.requestedRole === 'PROVIDER' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                           }`}>
                             {r.requestedRole}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="text-[10px] text-gray-500 italic max-w-[250px] truncate" title={r.reason}>"{r.reason}"</div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`text-[9px] font-black uppercase tracking-widest ${
                             r.status === 'PENDING' ? 'text-yellow-500' : r.status === 'APPROVED' ? 'text-green-500' : r.status === 'REJECTED' ? 'text-red-500' : ''
                           }`}>
                             {isRTL ? (r.status === 'PENDING' ? 'معلق' : r.status === 'APPROVED' ? 'تمت الموافقة' : 'مرفوض') : r.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right rtl:text-left">
                           {r.status === 'PENDING' ? (
                             <div className="flex justify-end gap-2">
                               <button onClick={() => resolveRoleRequest(r.id, "APPROVED")} className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 font-black text-[9px] uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all">{isRTL ? 'موافقة' : 'Approve'}</button>
                               <button onClick={() => resolveRoleRequest(r.id, "REJECTED")} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">{isRTL ? 'رفض' : 'Reject'}</button>
                             </div>
                           ) : (
                             <div className="text-[9px] text-gray-600 font-bold uppercase italic">{r.adminNote || (isRTL ? 'تمت المعالجة' : 'Processed')}</div>
                           )}
                        </td>
                      </tr>
                    ))}
                    {roleRequests.filter(r => r.status?.toUpperCase() === 'PENDING').length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-gray-600 font-black text-xs uppercase tracking-[0.3em] italic">
                          {isRTL ? 'لا توجد طلبات حالياً' : 'No pending applications'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl space-y-12">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <h3 className="text-3xl font-black">{isRTL ? 'إعدادات المنصة' : 'Global Settings'}</h3>
                 <div className="text-[10px] text-purple-400 font-black uppercase tracking-[0.3em] bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
                    {isRTL ? 'تكوين النظام الأساسي' : 'CORE SYSTEM CONFIG'}
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 {/* Left Column: Core Controls */}
                 <div className="space-y-8">
                   {/* 💰 Platform Fee Section */}
                   <div className="bg-[#121826] border border-white/5 p-10 rounded-[40px] space-y-8 h-fit shadow-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                           <TrendingUp size={24} />
                        </div>
                        <div>
                          <div className="text-sm font-black italic">{isRTL ? 'رسوم المنصة (%)' : 'Platform Fee (%)'}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest">{isRTL ? 'نسبة النظام من كل توصية' : 'System slice per signal'}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <input 
                          type="number" 
                          min="0"
                          defaultValue={Math.max(0, config.settings?.platformFee || 30)} 
                          id="feeInput"
                          onKeyDown={(e) => { if(e.key === '-') e.preventDefault(); }}
                          className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-center font-black text-xl outline-none focus:border-blue-500 transition-all" 
                        />
                        <button 
                          onClick={() => {
                            const val = parseFloat((document.getElementById('feeInput') as HTMLInputElement).value);
                            updateFee(Math.max(0, val));
                          }}
                          className="bg-blue-500 text-black font-black px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                        >
                          {isRTL ? 'حفظ' : 'SAVE'}
                        </button>
                      </div>
                   </div>

                    {/* 🔗 Trading Pairs Section */}
                    <div className="bg-[#121826] border border-white/5 p-10 rounded-[40px] space-y-8 shadow-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                           <BarChart3 size={24} />
                        </div>
                        <div>
                          <div className="text-sm font-black italic">{t.trading_pairs}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest">{t.authorized_symbols}</div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          id="newPairSymbol"
                          placeholder="BTC/USDT"
                          className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-purple-500 transition-all"
                        />
                        <button 
                          onClick={async () => {
                            const input = document.getElementById('newPairSymbol') as HTMLInputElement;
                            if(!input.value) return;
                            try {
                              await apiFetch("/admin/settings/pairs", { method: "POST", body: JSON.stringify({ symbol: input.value }) });
                              input.value = "";
                              const cfg = await apiFetch("/admin/settings");
                              setConfig(cfg);
                            } catch (e: any) { alert(e.message); }
                          }}
                          className="bg-purple-600 text-white font-black px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                        >
                          {t.add_pair?.split(' ')[0] || 'ADD'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                        {config.pairs?.map((p: any) => (
                          <div key={p.id} className="bg-black/30 px-4 py-3 rounded-2xl border border-white/5 flex justify-between items-center group">
                            <span className="text-[10px] font-black tracking-widest">{p.symbol}</span>
                            <button 
                              onClick={async () => {
                                if(!confirm(isRTL ? "هل أنت متأكد؟" : "Are you sure?")) return;
                                try {
                                  await apiFetch(`/admin/settings/pairs/${p.id}`, { method: "DELETE" });
                                  const cfg = await apiFetch("/admin/settings");
                                  setConfig(cfg);
                                } catch (e: any) { alert(e.message); }
                              }}
                              className="text-red-500/30 hover:text-red-500 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>

                 {/* Right Column: Financial Routes */}
                 <div className="space-y-8">
                    {/* 💳 Payment Methods Section */}
                    <div className="bg-[#121826] border border-white/5 p-10 rounded-[40px] space-y-8 shadow-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
                           <CreditCard size={24} />
                        </div>
                        <div>
                          <div className="text-sm font-black italic">{isRTL ? 'طرق الإيداع' : 'Deposit Methods'}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest">{isRTL ? 'إدارة عناوين المحافظ' : 'Manage wallet destinations'}</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <input 
                          type="text" 
                          placeholder={isRTL ? "اسم الطريقة (مثلاً USDT TRC20)" : "Method Name (e.g. USDT TRC20)"}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-green-500 transition-all"
                          value={newMethod.name}
                          onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder={isRTL ? "عنوان المحفظة" : "Wallet Address"}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono outline-none focus:border-green-500 transition-all"
                          value={newMethod.address}
                          onChange={(e) => setNewMethod({...newMethod, address: e.target.value})}
                        />
                        <button 
                          onClick={addMethod}
                          className="w-full py-4 rounded-2xl bg-green-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                        >
                          {isRTL ? 'إضافة طريقة جديدة' : 'Add New Method'}
                        </button>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-white/5 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {config.methods.map(m => (
                          <div key={m.id} className="bg-black/30 p-5 rounded-3xl border border-white/5 flex justify-between items-center group">
                            <div>
                              <div className="text-xs font-black text-white">{m.name}</div>
                              <div className="text-[9px] text-gray-600 font-mono truncate max-w-[200px]">{m.address}</div>
                            </div>
                            <button 
                              onClick={() => deleteMethod(m.id)}
                              className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        {config.methods.length === 0 && (
                          <div className="text-center py-6 text-gray-600 font-black text-[10px] uppercase tracking-widest italic">
                            {isRTL ? 'لا توجد طرق مضافة' : 'No methods defined'}
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
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
