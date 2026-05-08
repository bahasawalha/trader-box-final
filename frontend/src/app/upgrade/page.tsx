
"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, TrendingUp, Microscope, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UpgradePage() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [role, setRole] = useState<"PROVIDER" | "ANALYST" | null>(null);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    setStatus("loading");
    try {
      await axios.post("http://localhost:5000/role-requests", {
        requestedRole: role,
        reason
      }, { withCredentials: true });
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.response?.data?.error || (isRTL ? "فشل إرسال الطلب" : "Submission failed"));
    }
  };

  if (user?.role !== 'USER') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-[#121826] border border-white/5 p-12 rounded-[50px] text-center max-w-md">
          <ShieldCheck size={64} className="text-purple-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">{t.already_upgraded}</h1>
          <p className="text-gray-400">{t.already_upgraded_desc} <span className="text-purple-400 font-bold">{user?.role}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-32 pb-20 px-6 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl font-black text-white tracking-tight italic">
            {isRTL ? (
              <>ارفع مستوى <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-purple-500">حسابك</span></>
            ) : (
              <>ELEVATE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-purple-500">STATUS</span></>
            )}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t.upgrade_desc}</p>
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/20 p-12 rounded-[50px] text-center space-y-6"
            >
              <CheckCircle2 size={80} className="text-green-500 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">{t.request_success}</h2>
                <p className="text-gray-400">{t.request_success_desc}</p>
              </div>
              <button 
                onClick={() => window.location.href = "/dashboard"}
                className="bg-green-500 text-black font-bold px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
              >
                {t.back_dashboard}
              </button>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provider Card */}
                <button
                  type="button"
                  onClick={() => setRole("PROVIDER")}
                  className={`relative p-8 rounded-[40px] border transition-all text-left rtl:text-right group overflow-hidden ${
                    role === 'PROVIDER' ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)]' : 'bg-[#121826] border-white/5 hover:border-blue-500/30'
                  }`}
                >
                  <div className={`p-4 rounded-2xl mb-6 w-fit transition-colors ${role === 'PROVIDER' ? 'bg-blue-500 text-black' : 'bg-white/5 text-blue-400'}`}>
                    <TrendingUp size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 italic">{t.provider_title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{t.provider_desc}</p>
                  {role === 'PROVIDER' && <div className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-blue-500`}><CheckCircle2 /></div>}
                </button>

                {/* Analyst Card */}
                <button
                  type="button"
                  onClick={() => setRole("ANALYST")}
                  className={`relative p-8 rounded-[40px] border transition-all text-left rtl:text-right group overflow-hidden ${
                    role === 'ANALYST' ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)]' : 'bg-[#121826] border-white/5 hover:border-purple-500/30'
                  }`}
                >
                  <div className={`p-4 rounded-2xl mb-6 w-fit transition-colors ${role === 'ANALYST' ? 'bg-purple-500 text-black' : 'bg-white/5 text-purple-400'}`}>
                    <Microscope size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 italic">{t.analyst_title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{t.analyst_desc}</p>
                  {role === 'ANALYST' && <div className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-purple-500`}><CheckCircle2 /></div>}
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-gray-400 font-bold uppercase tracking-widest text-xs px-2">{t.why_approve}</label>
                <textarea 
                  required
                  placeholder={t.reason_placeholder}
                  className="w-full bg-[#121826] border border-white/5 rounded-[32px] p-8 text-white min-h-[200px] focus:border-purple-500 outline-none transition-all resize-none text-lg"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {status === "error" && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle size={20} />
                  {errorMessage}
                </div>
              )}

              <button
                disabled={!role || status === "loading"}
                className={`w-full py-6 rounded-[32px] font-black text-xl flex items-center justify-center gap-3 transition-all ${
                  !role || status === "loading" 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#00D4FF] to-purple-500 text-black hover:scale-[1.02] active:scale-95 shadow-xl'
                }`}
              >
                {status === "loading" ? t.processing : (
                  <>
                    <Send size={24} className={isRTL ? 'rotate-180' : ''} />
                    {t.submit_app}
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
