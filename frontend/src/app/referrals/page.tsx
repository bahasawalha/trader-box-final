"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Users, 
  Gift, 
  Copy, 
  CheckCircle2, 
  Share2, 
  TrendingUp,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function ReferralsPage() {
  const { t, isRTL, lang } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data = await apiFetch("/me");
      setUser(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/login?ref=${user?.referralCode}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 md:p-12 font-inter">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* 🎫 Hero Header */}
        <header className="text-center space-y-4 py-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-[#00D4FF]/10 rounded-3xl flex items-center justify-center text-[#00D4FF] mx-auto mb-6 shadow-[0_0_50px_rgba(0,212,255,0.1)]"
          >
            <Gift size={40} />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tight">{isRTL ? 'برنامج الإحالة' : 'Referral Protocol'}</h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
            {isRTL 
              ? 'ادعُ أصدقاءك وانضم إلى ثورة التداول المؤسساتي. احصل على 5 دولارات فورية عن كل اشتراك يتم عبر كودك.' 
              : 'Invite your network and join the institutional trading revolution. Earn an instant $5 for every subscription made through your code.'}
          </p>
        </header>

        {/* 🔗 Referral Link Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#0D1117] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-3xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <Share2 size={200} />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#00D4FF]">{isRTL ? 'رابط الإحالة الخاص بك' : 'YOUR UNIQUE LINK'}</h3>
              <div className="flex flex-col md:flex-row gap-4 items-center pt-4">
                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-5 w-full font-mono text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                  {referralLink}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="w-full md:w-auto px-10 py-5 rounded-2xl bg-[#00D4FF] text-black font-black flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all"
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  {copied ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'نسخ الرابط' : 'Copy Link')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
              <div className="space-y-1">
                <div className="text-3xl font-black text-white">0</div>
                <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{isRTL ? 'إجمالي الإحالات' : 'Total Referrals'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black text-[#00FF9C]">$0.00</div>
                <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{isRTL ? 'إجمالي الأرباح' : 'Total Earnings'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black text-white">5%</div>
                <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{isRTL ? 'معدل التحويل' : 'Conversion Rate'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 🛠️ How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <StepCard 
            num="01" 
            title={isRTL ? 'شارك الكود' : 'Share Code'} 
            desc={isRTL ? 'أرسل رابط الإحالة الخاص بك لأصدقائك أو متابعيك.' : 'Send your referral link to your friends or followers.'} 
          />
          <StepCard 
            num="02" 
            title={isRTL ? 'يقومون بالاشتراك' : 'They Subscribe'} 
            desc={isRTL ? 'بمجرد اشتراكهم في أي خدمة تزويد توصيات.' : 'Once they subscribe to any signal provider service.'} 
          />
          <StepCard 
            num="03" 
            title={isRTL ? 'احصل على عمولتك' : 'Get Paid'} 
            desc={isRTL ? 'تتم إضافة 5 دولارات فوراً إلى محفظتك الشخصية.' : 'Earn $5 instantly added to your personal wallet.'} 
          />
        </div>

        {/* 🛡️ Terms Mini */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-gray-500" size={32} />
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {isRTL 
                ? 'يتم صرف الأرباح بشكل آلي وفوري. أي محاولة للتلاعب بالنظام ستؤدي إلى تجميد الحساب فوراً.' 
                : 'Payouts are automated and instant. Any attempt to manipulate the system will result in immediate account suspension.'}
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00D4FF] hover:gap-4 transition-all">
            {isRTL ? 'الشروط والأحكام' : 'Full Terms'} <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}

function StepCard({ num, title, desc }: any) {
  return (
    <div className="bg-[#121826] border border-white/5 p-10 rounded-[40px] space-y-6 relative overflow-hidden group hover:border-[#00D4FF]/30 transition-all">
      <div className="text-6xl font-black text-white/5 absolute top-0 right-0 p-6 group-hover:text-[#00D4FF]/10 transition-colors">{num}</div>
      <h4 className="text-2xl font-bold">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
