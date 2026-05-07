"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { t, isRTL } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", referralCode: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const data = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(form)
      });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      const role = data.user.role;
      if (role === 'ADMIN') window.location.href = "/admin";
      else if (role === 'PROVIDER') window.location.href = "/provider";
      else if (role === 'ANALYST') window.location.href = "/analyst";
      else window.location.href = "/dashboard";
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
      
      {/* ⬅️ Back to Home */}
      <motion.div 
        animate={{ opacity: [1, 0.5, 1], x: [0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-10 ${isRTL ? 'right-10' : 'left-10'} z-50`}
      >
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[#00D4FF] hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] group"
        >
          <ArrowLeft size={16} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-[-4px] transition-transform`} />
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </motion.div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#0080FF] mb-4 shadow-[0_0_30px_rgba(0,212,255,0.3)] group-hover:scale-110 transition-transform">
              <Zap size={32} className="text-black" fill="currentColor" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isRegister ? t.create_access : t.secure_login}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">{t.terminal_access}</p>
        </div>

        <div className="bg-[#121826] border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">{t.email_label}</label>
              <div className="relative group">
                <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00D4FF] transition-colors`} size={18} />
                <input 
                  type="email"
                  placeholder="name@example.com"
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full bg-black/40 border border-white/5 rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/20 transition-all text-white placeholder:text-gray-700`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">{t.password_label}</label>
              <div className="relative group">
                <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00D4FF] transition-colors`} size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full bg-black/40 border border-white/5 rounded-2xl py-4 ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/20 transition-all text-white placeholder:text-gray-700`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">{isRTL ? 'كود الإحالة (اختياري)' : 'Referral Code (Optional)'}</label>
                <input 
                  type="text"
                  placeholder="REF123"
                  onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
                  className={`w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 outline-none focus:border-[#00D4FF]/50 transition-all text-white`}
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#00D4FF] hover:bg-[#00B4FF] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? t.register_btn : t.login_btn}
                  <ArrowRight size={18} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              {isRegister ? t.have_account : t.no_account}
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] text-gray-700 font-mono uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <ShieldCheck size={14} /> {t.encrypted_session}
        </p>
      </motion.div>
    </div>
  );
}
