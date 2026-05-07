"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { 
  User, 
  Lock, 
  Shield, 
  Globe, 
  Bell, 
  Save, 
  Camera,
  CheckCircle2
} from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { t, isRTL, lang, toggleLang } = useLanguage();
  
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", avatar: user?.avatar || "" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function updateProfile(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/profile/update", { method: "POST", body: JSON.stringify(profileForm) });
      await refreshUser();
      showSuccess("profile");
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  }

  async function updatePassword(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/profile/password", { method: "POST", body: JSON.stringify(passForm) });
      setPassForm({ currentPassword: "", newPassword: "" });
      showSuccess("password");
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  }

  function showSuccess(type: string) {
    setSuccess(type);
    setTimeout(() => setSuccess(null), 3000);
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <header>
          <h1 className="text-4xl font-black tracking-tight">{isRTL ? 'إعدادات النظام' : 'System Configuration'}</h1>
          <p className="text-gray-500 mt-2">{isRTL ? 'إدارة ملفك الشخصي، الأمان، وتفضيلات النظام.' : 'Manage your digital identity, security protocols, and system preferences.'}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* 📋 Sidebar Navigation (Visual Only) */}
          <div className="space-y-2">
             <SidebarItem icon={<User size={18} />} label={isRTL ? 'الملف الشخصي' : 'Profile Identity'} active />
             <SidebarItem icon={<Lock size={18} />} label={isRTL ? 'الأمان' : 'Security Nodes'} />
             <SidebarItem icon={<Globe size={18} />} label={isRTL ? 'اللغة والمنطقة' : 'Locale & Region'} />
             <SidebarItem icon={<Bell size={18} />} label={isRTL ? 'التنبيهات' : 'Signal Notifications'} />
          </div>

          <div className="md:col-span-2 space-y-10">
            
            {/* 👤 Profile Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121826] border border-white/5 rounded-[40px] p-8 md:p-10 space-y-8"
            >
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
                  <User size={24} />
                </div>
                <h2 className="text-xl font-bold">{isRTL ? 'هوية المستخدم' : 'Identity Metadata'}</h2>
              </div>

              <form onSubmit={updateProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      {profileForm.avatar ? <img src={profileForm.avatar} className="w-full h-full object-cover" /> : <User size={40} className="text-gray-700" />}
                    </div>
                    <button type="button" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#00D4FF] text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'البريد الإلكتروني (غير قابل للتغيير)' : 'System Email (Immutable)'}</div>
                    <div className="text-lg font-mono text-gray-300">{user?.email}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{isRTL ? 'الاسم المعروض' : 'Display Name'}</label>
                    <input 
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#00D4FF] transition-all"
                      placeholder="Enter your name..."
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="px-8 py-4 rounded-2xl bg-[#00D4FF] text-black font-black flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50"
                >
                  {success === 'profile' ? <CheckCircle2 size={18} /> : <Save size={18} />}
                  {isRTL ? 'حفظ التغييرات' : 'Synchronize Identity'}
                </button>
              </form>
            </motion.section>

            {/* 🔒 Security Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#121826] border border-white/5 rounded-[40px] p-8 md:p-10 space-y-8"
            >
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Shield size={24} />
                </div>
                <h2 className="text-xl font-bold">{isRTL ? 'بروتوكولات الأمان' : 'Security Protocols'}</h2>
              </div>

              <form onSubmit={updatePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{isRTL ? 'كلمة المرور الحالية' : 'Current Key'}</label>
                    <input 
                      type="password"
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{isRTL ? 'كلمة المرور الجديدة' : 'New Security Key'}</label>
                    <input 
                      type="password"
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {success === 'password' ? <CheckCircle2 size={18} className="text-green-400" /> : <Lock size={18} />}
                  {isRTL ? 'تحديث كلمة المرور' : 'Update Access Key'}
                </button>
              </form>
            </motion.section>

            {/* 🌍 Regional Section */}
            <section className="bg-[#121826] border border-white/5 rounded-[40px] p-8 md:p-10 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <Globe className="text-gray-500" />
                  <div>
                    <div className="font-bold">{isRTL ? 'اللغة المفضلة' : 'System Language'}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">{lang === 'en' ? 'English (Global)' : 'العربية (RTL)'}</div>
                  </div>
               </div>
               <button 
                 onClick={toggleLang}
                 className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
               >
                 {isRTL ? 'تبديل للإنجليزية' : 'Switch to Arabic'}
               </button>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-[#00D4FF]/10 text-[#00D4FF] font-bold' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
