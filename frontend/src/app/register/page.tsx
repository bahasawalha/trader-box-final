"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Zap, 
  ArrowRight, 
  ShieldCheck,
  Rocket,
  ArrowLeft,
  ChevronRight,
  Globe,
  Eye,
  EyeOff
} from "lucide-react";

export default function Register() {
  const { isRTL } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", referralCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch("/auth/register", { method: "POST", body: formData });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) router.push("/");
      }}
      className="min-h-screen bg-[#05070A] text-white flex items-center justify-center p-6 relative overflow-hidden font-inter cursor-pointer"
    >
      
      {/* 🌌 Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00D4FF]/5 blur-[150px] rounded-full" />
      </div>

      <motion.div 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#121826]/60 backdrop-blur-3xl border border-white/5 rounded-[50px] p-12 relative z-10 shadow-3xl"
      >
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
           <Link href="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-2xl shadow-purple-500/20">
                 <Zap size={24} fill="currentColor" />
              </div>
           </Link>
           <h1 className="text-4xl font-black tracking-tighter uppercase">{isRTL ? 'إنشاء حساب جديد' : 'CREATE ACCOUNT'}</h1>
           <p className="text-gray-500 text-sm font-medium tracking-wide">
             {isRTL ? 'انضم إلى نخبة المتداولين والمحللين حول العالم.' : 'JOIN THE ELITE COMMUNITY OF TRADERS AND ANALYSTS.'}
           </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-black uppercase tracking-widest mb-8 text-center">
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-6">
           <div className="space-y-4">
              <div className="relative group">
                 <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={20} />
                 <input 
                   required
                   type="email"
                   placeholder={isRTL ? "البريد الإلكتروني" : "Email Address"}
                   className="w-full bg-black/40 border border-white/5 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-purple-500/50 transition-all text-sm font-medium"
                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 />
              </div>

              <div className="relative group">
                 <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={20} />
                 <input 
                   required
                   type={showPassword ? "text" : "password"}
                   placeholder={isRTL ? "كلمة المرور" : "Password"}
                   className="w-full bg-black/40 border border-white/5 rounded-2xl pl-16 pr-16 py-5 outline-none focus:border-purple-500/50 transition-all text-sm font-medium"
                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                 />
                 <button 
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-purple-500 transition-colors"
                 >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
              </div>

              <div className="relative group">
                 <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={20} />
                 <input 
                   type="text"
                   placeholder={isRTL ? "رمز الإحالة (اختياري)" : "Referral Code (Optional)"}
                   className="w-full bg-black/40 border border-white/5 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-purple-500/50 transition-all text-sm font-medium"
                   onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                 />
              </div>
           </div>

           <button 
             disabled={loading}
             className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-[#00D4FF] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Rocket size={18} />
                  {isRTL ? 'إطلاق الحساب' : 'LAUNCH ACCOUNT'}
                </>
              )}
           </button>
        </form>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center space-y-4">
           <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
              {isRTL ? 'لديك حساب بالفعل؟' : 'ALREADY HAVE AN ACCOUNT?'}
           </div>
           <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              {isRTL ? 'تسجيل الدخول' : 'SIGN IN NOW'} <ChevronRight size={14} className={isRTL ? "rotate-180" : ""} />
           </Link>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 flex items-center justify-center gap-3 text-gray-700">
           <ShieldCheck size={16} />
           <span className="text-[9px] font-black uppercase tracking-widest">{isRTL ? 'نظام تشفير عسكري' : 'MILITARY-GRADE ENCRYPTION'}</span>
        </div>
      </motion.div>
    </div>
  );
}
