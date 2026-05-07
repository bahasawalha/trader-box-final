"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Star, 
  LineChart, 
  ArrowUpRight,
  Cpu,
  Globe,
  Lock,
  MessageSquare,
  BarChart3,
  Activity,
  ArrowDownRight,
  Wallet,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  PlayCircle,
  ShieldAlert,
  Headphones,
  Mail,
  UserPlus,
  Rocket,
  Shield,
  Coins,
  X,
  Building2,
  FileText,
  Send,
  Loader2,
  Target,
  Flag,
  Lightbulb,
  ExternalLink,
  Smartphone,
  Gift
} from "lucide-react";

export default function Home() {
  const { t, lang, isRTL, toggleLang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [providers, setProviders] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [dynamicNews, setDynamicNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showSponsorsModal, setShowSponsorsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ company: "", email: "", website: "", license: "", type: "LIQUIDITY" });

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'ADMIN') router.push("/admin");
      else if (user.role === 'PROVIDER') router.push("/provider");
      else if (user.role === 'ANALYST') router.push("/analyst");
      else router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [p, a, n] = await Promise.all([
        apiFetch("/providers/top"),
        apiFetch("/analyses/latest"),
        apiFetch("/news")
      ]);
      setProviders(p);
      setAnalyses(a);
      setDynamicNews(n);
    } catch (error) {
      console.error("Failed to load home data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitSponsorship(e: any) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = e.target;
      const payload = {
        companyName: form[0].value,
        email: form[1].value,
        website: form[2].value || "",
        license: form[3].value || "",
        type: formData.type || "OTHER"
      };

      await apiFetch("/sponsorships", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      alert(isRTL ? "تم إرسال طلب الرعاية بنجاح. سنتواصل معكم قريباً." : "Sponsorship request sent successfully. We will contact you soon.");
      setShowApplyForm(false);
      setShowSponsorsModal(false);
      setFormData({ company: "", email: "", website: "", license: "", type: "LIQUIDITY" });
    } catch (error: any) {
      alert(isRTL ? "فشل إرسال الطلب: " + error.message : "Failed to send request: " + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || authLoading || user) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center space-y-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-[#00D4FF] animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#00D4FF]/30 overflow-x-hidden font-inter">
      
      {/* 🚀 Header */}
      <nav className="fixed top-0 left-0 right-0 z-[150] px-6 py-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-black/40 backdrop-blur-xl border border-white/5 px-8 py-4 rounded-[30px] pointer-events-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF] flex items-center justify-center text-black"><Zap size={20} fill="currentColor" /></div>
            <span className="font-black text-xl tracking-tighter uppercase">Trader Box</span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={toggleLang} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">{lang === 'en' ? 'AR' : 'EN'}</button>
            <Link href="/login" className="px-6 py-3 rounded-2xl bg-[#00D4FF] text-black font-black text-[10px] uppercase tracking-widest">{t.get_started}</Link>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* 🌌 News Ticker ... (Rest of Hero/About/Providers/Intelligence Sections) */}
        {/* 📰 Premium News Ticker (Intelligence Ribbon) */}
        <div className="sticky top-24 z-[100] px-6">
          <div className="max-w-7xl mx-auto bg-black/80 backdrop-blur-3xl border border-white/5 rounded-2xl py-3 overflow-hidden whitespace-nowrap shadow-2xl relative group">
            {/* Edge Gradients */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
            
            <motion.div 
              animate={{ x: isRTL ? "100%" : "-100%" }} 
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }} 
              className="inline-flex gap-20 px-10"
            >
              {[...dynamicNews.map(n => n.text), ...dynamicNews.map(n => n.text), "BTC +2.4%", "ETH -0.8%", "GOLD ATH"].map((news, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#00FF9C] shadow-[0_0_8px_#00FF9C]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                  <span className="font-mono text-[9px] font-black tracking-[0.2em] text-white/70 uppercase flex items-center gap-2">
                    {news}
                    {i % 2 === 0 ? <TrendingUp size={10} className="text-[#00FF9C]" /> : <ArrowDownRight size={10} className="text-red-500" />}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <section className="relative pt-8 pb-16 px-6 min-h-[60vh] flex items-center justify-center overflow-hidden text-center">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00D4FF]/10 blur-[120px] -z-10 animate-pulse" />
           <motion.div style={{ opacity: heroOpacity }} className="max-w-7xl mx-auto space-y-12">
              <h1 className="text-7xl md:text-[140px] font-black tracking-tighter leading-[0.75] bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
                {isRTL ? 'صندوق' : 'TRADER'}<br/>
                <motion.span animate={{ color: ["#00D4FF", "#FFFFFF", "#00D4FF"], textShadow: ["0 0 20px rgba(0,212,255,0.2)", "0 0 50px rgba(0,212,255,0.6)", "0 0 20px rgba(0,212,255,0.2)"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-[#00D4FF] inline-block">
                  {isRTL ? 'المتداول' : 'BOX'}
                </motion.span>
              </h1>
              <p className="text-gray-400 text-xl md:text-3xl max-w-4xl mx-auto font-medium">
                {isRTL ? 'بوابتك الاحترافية لإشارات التداول والتحليلات العميقة.' : 'Your professional portal for signals and deep analytics.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                <Link 
                  href="/login" 
                  className="px-10 py-5 rounded-[24px] bg-[#00D4FF] text-black font-black text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] hover:scale-105 transition-all flex items-center gap-3"
                >
                  <Rocket size={18} />
                  {isRTL ? 'ابدأ الآن' : 'START NOW'}
                </Link>
                <button 
                  onClick={() => setShowAboutModal(true)}
                  className="px-10 py-5 rounded-[24px] bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:scale-105 transition-all flex items-center gap-3"
                >
                  <Users size={18} />
                  {isRTL ? 'من نحن' : 'ABOUT US'}
                </button>
              </div>
           </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20 -mt-20 relative z-20">
           <div className="bg-[#121826]/80 backdrop-blur-3xl border border-white/10 rounded-[50px] p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                 <h3 className="text-3xl font-black shrink-0">{isRTL ? 'الشركات الراعية' : 'Official Sponsors'}</h3>
                 <div className="flex-1 overflow-hidden relative">
                    <motion.div animate={{ x: isRTL ? ["0%", "-50%"] : ["0%", "50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex items-center gap-16 md:gap-32 whitespace-nowrap">
                       <SponsorLogo name="Binance" />
                       <SponsorLogo name="NEXUS NETWORK" />
                       <SponsorLogo name="MetaTrader" />
                       <SponsorLogo name="TradingView" />
                    </motion.div>
                 </div>
              </div>
           </div>
        </section>

        {/* Restore About/Providers/Intelligence Sections */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-16 space-y-16">
           <div className="text-center space-y-8">
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight">{isRTL ? 'منصة واحدة... لكل ما يحتاجه المتداول' : 'One Platform... For Everything a Trader Needs'}</h2>
              <p className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed">{isRTL ? 'يجمع TraderBox بين الإشارات والتحليلات والتدريب في مكان واحد.' : 'TraderBox brings together signals, analytics, and training in one place.'}</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureBlock icon={<Zap className="text-blue-400" />} title={isRTL ? 'الإشارات' : 'Signals'} color="bg-blue-500/10" />
              <FeatureBlock icon={<Award className="text-green-400" />} title={isRTL ? 'التدريب' : 'Coaching'} color="bg-green-500/10" />
              <FeatureBlock icon={<Users className="text-purple-400" />} title={isRTL ? 'التحليلات' : 'Analysis'} color="bg-purple-500/10" />
              <FeatureBlock icon={<LineChart className="text-orange-400" />} title={isRTL ? 'البيانات' : 'Live Intel'} color="bg-orange-500/10" />
           </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16 relative">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[150px] -z-10" />
           <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="space-y-4">
                 <div className="text-[#00D4FF] text-[10px] font-black uppercase tracking-[0.4em]">{isRTL ? 'النخبة' : 'THE ELITE'}</div>
                 <h2 className="text-6xl font-black uppercase tracking-tighter">{isRTL ? 'أفضل المزودين' : 'Top Operatives'}</h2>
              </div>
              <motion.div
                animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Link href="/providers" className="group flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-[#00D4FF] hover:text-white transition-all">
                   {isRTL ? 'عرض الكل' : 'VIEW ALL ASSETS'} <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {providers.map((p, i) => (
                <div key={i} className="bg-[#121826] border border-white/5 p-10 rounded-[50px] space-y-8 hover:border-[#00D4FF]/30 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity"><ArrowUpRight size={40} /></div>
                   <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
                      {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" /> : <Users size={32} className="text-gray-600" />}
                   </div>
                   <div>
                      <h4 className="text-2xl font-black truncate">{p.email.split('@')[0]}</h4>
                      <div className="text-[10px] text-[#00D4FF] font-black uppercase tracking-widest mt-1">Status: Active</div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl">
                         <div className="text-[9px] text-gray-500 font-bold uppercase">{isRTL ? 'الإشارات' : 'Signals'}</div>
                         <div className="text-xl font-black">{p.recommendations?.length || 0}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl">
                         <div className="text-[9px] text-gray-500 font-bold uppercase">{isRTL ? 'المشتركين' : 'Assets'}</div>
                         <div className="text-xl font-black">{p.providerSubs?.length || 0}</div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <section className="bg-white/[0.02] border-y border-white/5 py-16 relative overflow-hidden">
           <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] -z-10" />
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-32">
              <div className="space-y-12">
                 <div className="space-y-4">
                    <div className="text-purple-500 text-[10px] font-black uppercase tracking-[0.4em]">{isRTL ? 'الذكاء السوقي' : 'MARKET INTELLIGENCE'}</div>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">{isRTL ? 'تحليلات' : 'STRATEGIC'}<br/>{isRTL ? 'استراتيجية' : 'INTEL'}</h2>
                 </div>
                 <p className="text-gray-400 text-xl leading-relaxed max-w-md italic">
                    {isRTL ? 'تقارير معمقة من أفضل المحللين المعتمدين لدينا حول توجهات السوق الكبرى.' : 'In-depth reports from our top certified analysts on major market trends.'}
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href="/analyses" className="px-10 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#00D4FF] hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2">
                       <LineChart size={14} />
                       {isRTL ? 'اكتشف التحليلات' : 'DISCOVER ANALYSES'}
                    </Link>
                    <Link href="/register" className="px-10 py-5 rounded-2xl bg-purple-600/10 border border-purple-500/30 text-purple-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-purple-600/20 hover:border-purple-500 hover:scale-105 transition-all flex items-center justify-center gap-2">
                       <Users size={14} />
                       {isRTL ? 'انضم لمجتمع المحللين' : 'JOIN ANALYSTS'}
                    </Link>
                 </div>
              </div>
              <div className="relative">
                 <div className="absolute inset-0 bg-purple-500/10 blur-[120px] -z-10" />
                 <div className="bg-[#121826]/40 border border-white/5 p-12 rounded-[50px] backdrop-blur-3xl space-y-12 relative overflow-hidden group hover:border-purple-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity"><Activity size={40} className="text-purple-400" /></div>
                    
                    <div className="space-y-2">
                       <div className="text-[10px] text-purple-400 font-black uppercase tracking-[0.4em]">{isRTL ? 'مؤشر الثقة' : 'CONFIDENCE INDEX'}</div>
                       <div className="text-6xl font-black text-white flex items-baseline gap-2">94.2<span className="text-2xl text-purple-500">%</span></div>
                       <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">{isRTL ? 'دقة التوقعات التاريخية' : 'HISTORICAL FORECAST ACCURACY'}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                       <div className="space-y-2">
                          <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{isRTL ? 'تقارير منشورة' : 'REPORTS PUBLISHED'}</div>
                          <div className="text-2xl font-black text-white">+2,840</div>
                       </div>
                       <div className="space-y-2">
                          <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{isRTL ? 'محلل معتمد' : 'CERTIFIED ANALYSTS'}</div>
                          <div className="text-2xl font-black text-white">150+</div>
                       </div>
                    </div>

                    <div className="bg-purple-500/5 border border-purple-500/10 p-6 rounded-3xl flex items-center gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400"><ShieldCheck size={24} /></div>
                       <div className="text-[10px] text-gray-400 leading-relaxed font-bold">
                          {isRTL 
                            ? 'يتم مراجعة جميع التقارير من قبل لجنة التدقيق الفني لضمان أعلى معايير الجودة.' 
                            : 'All reports are reviewed by the Technical Audit Committee to ensure the highest quality standards.'}
                       </div>
                    </div>
                 </div>
                 
                 {/* Mini Analyst List Overlay (Optional feel) */}
                 <div className="mt-8 space-y-4">
                    {analyses.slice(0, 2).map((a, i) => (
                       <div key={i} className="bg-black/40 border border-white/5 p-6 rounded-[30px] flex items-center justify-between group hover:border-purple-500/20 transition-all opacity-60 hover:opacity-100">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"><MessageSquare size={16} /></div>
                             <div className="text-xs font-black group-hover:text-purple-400 transition-colors truncate max-w-[150px]">{a.title}</div>
                          </div>
                          <div className="text-[8px] text-gray-600 font-bold uppercase">{new Date(a.createdAt).toLocaleDateString()}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* 🗺️ Professional Footer */}
        <footer className="bg-[#0A0D14] border-t border-white/5 pt-20 pb-12">
           <div className="max-w-7xl mx-auto px-6 space-y-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
                 
                 {/* Links Columns (Left & Center) */}
                 <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-16 order-2 lg:order-1">
                    <div className="space-y-8">
                       <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#00D4FF]">{isRTL ? 'قانوني' : 'Legal'}</h4>
                       <ul className="space-y-6">
                          <li><FooterLink onClick={() => setShowPrivacyModal(true)} icon={<Lock size={16} />} label={isRTL ? 'الخصوصية' : 'Privacy'} /></li>
                       </ul>
                    </div>
                    <div className="space-y-8">
                       <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#00D4FF]">{isRTL ? 'الدعم' : 'Support'}</h4>
                       <ul className="space-y-6">
                          <li><FooterLink onClick={() => setShowContactModal(true)} icon={<Mail size={16} />} label={isRTL ? 'تواصل معنا' : 'Contact'} /></li>
                          <li><FooterLink onClick={() => setShowRiskModal(true)} icon={<ShieldAlert size={16} />} label={isRTL ? 'تحذير المخاطر' : 'Risk Warning'} /></li>
                       </ul>
                    </div>
                    <div className="space-y-8">
                       <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#00D4FF]">{isRTL ? 'البرامج' : 'Programs'}</h4>
                       <ul className="space-y-6">
                          <li><FooterLink onClick={() => setShowAboutModal(true)} icon={<Users size={16} />} label={isRTL ? 'من نحن' : 'About Us'} /></li>
                          <li>
                            <motion.div 
                              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.02, 1] }} 
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <FooterLink onClick={() => setShowSponsorsModal(true)} icon={<Award size={16} className="text-[#00D4FF]" />} label={isRTL ? 'برنامج الرعاة' : 'Sponsors'} />
                            </motion.div>
                          </li>
                          <li>
   <motion.div 
     animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }} 
     transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
   >
      <FooterLink onClick={() => setShowReferralModal(true)} icon={<UserPlus size={16} className="text-purple-400" />} label={isRTL ? 'نظام الإحالة' : 'Referral'} />
   </motion.div>
</li>
                       </ul>
                    </div>
                 </div>

                 {/* Brand Column (Right Side) */}
                 <div className="lg:col-span-5 space-y-10 order-1 lg:order-2 lg:text-right flex flex-col lg:items-end">
                    <div className="flex items-center gap-6 lg:flex-row-reverse">
                       <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center text-[#00D4FF] shadow-2xl">
                          <Zap size={44} fill="currentColor" />
                       </div>
                       <div className="text-5xl font-black tracking-tighter uppercase">Trader Box</div>
                    </div>
                    <p className="text-gray-500 text-xl leading-relaxed max-w-md">
                       {isRTL 
                         ? 'المنصة الرائدة لتوفير إشارات التداول والتحليلات الفنية المدعومة بنخبة من أفضل الخبراء في الأسواق العالمية.' 
                         : 'The leading platform for providing trading signals and technical analysis backed by the best experts in global markets.'}
                    </p>
                 </div>

              </div>
           </div>
        </footer>
      </div>

      {/* 🤝 Sponsors Modal */}
      <AnimatePresence>
        {showSponsorsModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSponsorsModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121826] border border-white/10 w-full max-w-4xl rounded-[50px] p-12 relative z-10 shadow-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-[#00D4FF] to-purple-500"></div>
                <AnimatePresence mode="wait">
                  {!showApplyForm ? (
                    <motion.div key="info" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                      <div className="flex justify-between items-start mb-12">
                         <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#00D4FF] text-[10px] font-black uppercase tracking-[0.4em]"><Award size={14} /> {isRTL ? 'منظومة تداول احترافية' : 'PROFESSIONAL TRADING ECOSYSTEM'}</div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">{isRTL ? 'برنامج الرعاية الاستراتيجي' : 'Strategic Sponsorship Program'}</h2>
                         </div>
                         <button onClick={() => setShowSponsorsModal(false)} className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all border border-white/10"><X size={24} /></button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-right">
                         <div className="space-y-8">
                            <p className="text-gray-300 text-xl font-bold leading-relaxed">
                               {isRTL ? 'في TraderBox لا نقدّم مجرد مساحة إعلانية، بل نبني شراكات استراتيجية تمنح علامتك التجارية حضورًا مؤثرًا.' : 'At TraderBox, we don’t just offer ad space; we build strategic partnerships.'}
                            </p>
                            <div className="space-y-6">
                               <h4 className="text-[#00D4FF] text-xs font-black uppercase tracking-widest">{isRTL ? 'لماذا الرعاية معنا؟' : 'WHY SPONSOR US?'}</h4>
                               <ul className="space-y-4 text-gray-500 text-sm">
                                  <li className="flex items-center gap-3 justify-end"> {isRTL ? 'وصول مباشر لجمهور مهتم بالتداول والاستثمار' : 'Direct access to trading audience'} <CheckCircle2 size={16} className="text-[#00D4FF]" /></li>
                                  <li className="flex items-center gap-3 justify-end"> {isRTL ? 'ظهور احترافي داخل المنصة وصفحات التصنيفات' : 'Professional platform visibility'} <CheckCircle2 size={16} className="text-[#00D4FF]" /></li>
                                  <li className="flex items-center gap-3 justify-end"> {isRTL ? 'فرص ترويج ذكية مرتبطة بالأداء والتفاعل' : 'Performance-linked promotion'} <CheckCircle2 size={16} className="text-[#00D4FF]" /></li>
                               </ul>
                            </div>
                         </div>
                         
                         <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden">
                            <div className="space-y-6">
                               <h4 className="text-purple-400 text-xs font-black uppercase tracking-widest">{isRTL ? 'ماذا يحصل الراعي؟' : 'SPONSOR BENEFITS'}</h4>
                               <div className="grid grid-cols-1 gap-4">
                                  {[
                                    isRTL ? 'إبراز العلامة التجارية داخل المنصة' : 'Brand highlights',
                                    isRTL ? 'حملات ظهور مخصصة حسب الفئة' : 'Targeted campaigns',
                                    isRTL ? 'مساحات دعائية Premium' : 'Premium ad spaces',
                                    isRTL ? 'فرص تعاون مع نخبة المتداولين' : 'Collaborate with elite'
                                  ].map((b, i) => (
                                    <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400">{b}</div>
                                  ))}
                               </div>
                            </div>
                            <button onClick={() => setShowApplyForm(true)} className="w-full py-5 rounded-2xl bg-[#00D4FF] text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">{isRTL ? 'انضم الآن للشركاء' : 'JOIN PARTNERS NOW'}</button>
                         </div>
                      </div>

                      <div className="mt-12 pt-8 border-t border-white/5 text-center">
                         <p className="text-gray-600 text-xs italic">{isRTL ? 'للشركات المالية، الوسطاء، ومنصات التداول الباحثة عن التميز.' : 'For financial firms, brokers, and trading platforms seeking excellence.'}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                       <div className="flex justify-between items-center mb-10">
                          <button onClick={() => setShowApplyForm(false)} className="text-[#00D4FF] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">{isRTL ? '← العودة' : '← BACK'}</button>
                          <h2 className="text-2xl font-black uppercase">{isRTL ? 'طلب الشراكة' : 'Partnership Request'}</h2>
                       </div>
                       <form onSubmit={handleSubmitSponsorship} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <input required placeholder={isRTL ? "اسم الشركة" : "Company Name"} className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#00D4FF]" />
                           <input required type="email" placeholder={isRTL ? "البريد الإلكتروني" : "Business Email"} className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#00D4FF]" />
                           <input placeholder={isRTL ? "الموقع الإلكتروني" : "Website (Optional)"} className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#00D4FF]" />
                           <input placeholder={isRTL ? "الترخيص / نبذة" : "License / Brief"} className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#00D4FF]" />
                           <div className="md:col-span-2">
                             <select 
                               onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                               className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#00D4FF] text-gray-400"
                             >
                                <option value="LIQUIDITY">{isRTL ? "مزود سيولة" : "Liquidity Provider"}</option>
                                <option value="BROKER">{isRTL ? "وسيط مالي" : "Broker"}</option>
                                <option value="TECH">{isRTL ? "حلول تقنية" : "Tech Solutions"}</option>
                                <option value="OTHER">{isRTL ? "أخرى" : "Other"}</option>
                             </select>
                           </div>
                           <button disabled={submitting} type="submit" className="md:col-span-2 py-5 rounded-2xl bg-[#00D4FF] text-black font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                              {submitting ? <Loader2 className="animate-spin" size={16} /> : (isRTL ? 'إرسال الطلب الرسمي' : 'SUBMIT OFFICIAL REQUEST')}
                           </button>
                       </form>
                    </motion.div>
                  )}
                </AnimatePresence>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🏢 About Us Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 text-center">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAboutModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121826] border border-white/10 w-full max-w-5xl rounded-[60px] p-12 relative z-10 shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-[#00D4FF] to-blue-600"></div>
                <div className="flex justify-end mb-4"><button onClick={() => setShowAboutModal(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"><X size={20} /></button></div>
                
                <div className="max-w-4xl mx-auto space-y-16">
                   <div className="text-center space-y-6">
                      <h2 className="text-6xl font-black tracking-tighter uppercase">{isRTL ? 'قصة Trader Box' : 'TRADER BOX STORY'}</h2>
                      <p className="text-gray-300 text-xl leading-relaxed max-w-3xl mx-auto font-medium">
                         {isRTL ? 'Trader Box هي منصة مالية حديثة تهدف إلى إعادة تعريف تجربة التداول في العالم العربي من خلال دمج التكنولوجيا المتقدمة مع الخبرة البشرية.' : 'Trader Box is a modern financial platform redefining the trading experience in the Arab world.'}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-right rtl:text-right">
                      <div className="space-y-8 p-10 bg-white/5 rounded-[40px] border border-white/5 hover:border-[#00D4FF]/20 transition-all group">
                         <div className="w-14 h-14 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] group-hover:scale-110 transition-transform"><Target size={32} /></div>
                         <div className="space-y-4">
                            <h3 className="text-2xl font-black uppercase">{isRTL ? 'رؤيتنا' : 'OUR VISION'}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">{isRTL ? 'بناء مجتمع تداول عربي أكثر شفافية واحترافية، حيث تصبح البيانات الدقيقة والثقة أساس كل قرار مالي.' : 'Building a transparent Arab trading community where accurate data is the foundation of every decision.'}</p>
                         </div>
                      </div>
                      <div className="space-y-8 p-10 bg-white/5 rounded-[40px] border border-white/5 hover:border-[#00D4FF]/20 transition-all group">
                         <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><Rocket size={32} /></div>
                         <div className="space-y-4">
                            <h3 className="text-2xl font-black uppercase">{isRTL ? 'مهمتنا' : 'OUR MISSION'}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">{isRTL ? 'توفير منصة ذكية وآمنة تمنح المستخدمين الأدوات والمعرفة اللازمة للنمو داخل الأسواق المالية بطريقة احترافية.' : 'Providing a smart and secure platform that empowers users with tools and knowledge to grow.'}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-10">
                      <h3 className="text-center text-xs font-black uppercase tracking-[0.5em] text-gray-500">{isRTL ? 'قيمنا الجوهرية' : 'OUR CORE VALUES'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <AboutCard icon={<Lightbulb size={24} />} title={isRTL ? 'الابتكار' : 'Innovation'} desc={isRTL ? 'نطوّر حلولًا مالية حديثة تواكب تطور الأسواق والتكنولوجيا.' : 'Developing modern financial solutions.'} />
                         <AboutCard icon={<Flag size={24} />} title={isRTL ? 'الشفافية' : 'Transparency'} desc={isRTL ? 'نعتمد على الوضوح والمصداقية في عرض البيانات والنتائج.' : 'Relying on clarity and credibility.'} />
                         <AboutCard icon={<ShieldCheck size={24} />} title={isRTL ? 'الثقة' : 'Trust'} desc={isRTL ? 'نبني بيئة آمنة تحمي المستخدم وتدعم علاقات طويلة المدى.' : 'Building a secure environment.'} />
                      </div>
                   </div>

                   <div className="pt-12 text-center">
                      <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-full">
                         <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-ping" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{isRTL ? 'نحن نبني منظومة مالية متكاملة للمستقبل' : 'WE ARE BUILDING AN INTEGRATED FINANCIAL SYSTEM'}</span>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ Risk Warning Modal */}
      <AnimatePresence>
        {showRiskModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 text-center">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRiskModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121826] border border-red-500/20 w-full max-w-4xl rounded-[50px] p-12 relative z-10 shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
                <div className="flex justify-end mb-4"><button onClick={() => setShowRiskModal(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-all"><X size={20} /></button></div>
                
                <div className="max-w-2xl mx-auto space-y-12">
                   <div className="space-y-6">
                      <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto shadow-2xl shadow-red-500/20">
                         <ShieldAlert size={40} />
                      </div>
                      <h2 className="text-5xl font-black tracking-tighter uppercase text-red-500">{isRTL ? 'تحذير المخاطر وإخلاء المسؤولية' : 'RISK WARNING & DISCLAIMER'}</h2>
                      <p className="text-gray-300 text-xl leading-relaxed font-bold">
                         {isRTL ? 'التداول في الأسواق المالية يتضمن مستوى عاليًا من المخاطر، وقد لا يكون مناسبًا لجميع المستثمرين.' : 'Trading financial markets involves a high level of risk and may not be suitable for all investors.'}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-right rtl:text-right border-y border-white/5 py-12">
                      <div className="space-y-6">
                         <h4 className="text-red-400 text-xs font-black uppercase tracking-widest">{isRTL ? 'مسؤولية المستخدم' : 'USER RESPONSIBILITY'}</h4>
                         <ul className="space-y-3 text-gray-500 text-xs font-bold">
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'جميع قرارات التداول تقع تحت مسؤولية المستخدم الكاملة' : 'Trading decisions are user responsibility'} <XCircle size={14} className="text-red-500" /></li>
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'الأداء السابق لا يضمن النتائج المستقبلية أبداً' : 'Past performance is no guarantee of results'} <XCircle size={14} className="text-red-500" /></li>
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'تقييم المخاطر بعناية قبل الدخول في أي صفقة' : 'Assess risk carefully before trading'} <XCircle size={14} className="text-red-500" /></li>
                         </ul>
                      </div>
                      <div className="space-y-6">
                         <h4 className="text-[#00D4FF] text-xs font-black uppercase tracking-widest">{isRTL ? 'إدارة المخاطر' : 'RISK MANAGEMENT'}</h4>
                         <ul className="space-y-3 text-gray-500 text-xs font-bold">
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'استخدام استراتيجيات إدارة رأس المال الصارمة' : 'Use strict capital management strategies'} <CheckCircle2 size={14} className="text-[#00D4FF]" /></li>
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'عدم المخاطرة بأموال لا يمكنك تحمل خسارتها' : 'Don\'t risk money you can\'t afford to lose'} <CheckCircle2 size={14} className="text-[#00D4FF]" /></li>
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'تنويع المحافظ والاعتماد على الانضباط' : 'Diversify portfolios & rely on discipline'} <CheckCircle2 size={14} className="text-[#00D4FF]" /></li>
                         </ul>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl text-gray-400 text-sm leading-relaxed italic">
                         {isRTL ? 'جميع التحليلات، الإشارات، والبيانات تُقدَّم لأغراض تعليمية ومعلوماتية فقط، ولا تُعتبر توصية استثمارية مباشرة أو ضمانًا لتحقيق الأرباح.' : 'All analyses and signals are for educational purposes only and are not direct investment advice.'}
                      </div>
                      <p className="text-[#00FF9C] text-xs font-black uppercase tracking-[0.4em]">
                         {isRTL ? 'تداول بوعي… واستثمر بمسؤولية.' : 'TRADE CONSCIOUSLY... INVEST RESPONSIBLY.'}
                      </p>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔒 Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPrivacyModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121826] border border-white/10 w-full max-w-4xl rounded-[50px] p-12 relative z-10 shadow-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00D4FF] to-green-500"></div>
                <div className="flex justify-end mb-6"><button onClick={() => setShowPrivacyModal(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all"><X size={20} /></button></div>
                <div className="max-w-2xl mx-auto space-y-12 text-center">
                   <div className="w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-400 mx-auto shadow-2xl shadow-green-500/20">
                      <Lock size={40} />
                   </div>
                   <h2 className="text-5xl font-black tracking-tighter uppercase">{isRTL ? 'سياسة الخصوصية والأمان' : 'PRIVACY & SECURITY POLICY'}</h2>
                   <p className="text-gray-300 text-xl leading-relaxed font-bold">
                      {isRTL ? 'خصوصيتك وأمان بياناتك يمثلان أولوية أساسية لدينا. نعتمد على بنية حماية متقدمة وتقنيات تشفير حديثة لضمان سرية المعلومات.' : 'Your privacy and data security are our top priority. We rely on advanced protection and modern encryption.'}
                   </p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right rtl:text-right">
                      <div className="space-y-6">
                         <h4 className="text-[#00D4FF] text-xs font-black uppercase tracking-widest">{isRTL ? 'التزامنا تجاهك' : 'OUR COMMITMENT'}</h4>
                         <ul className="space-y-4 text-gray-500 text-sm">
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'عدم بيع أو مشاركة بياناتك مع أي طرف خارجي' : 'No selling or sharing data'} <CheckCircle2 size={16} className="text-green-500" /></li>
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'حماية المعاملات باستخدام تقنيات تشفير متقدمة' : 'Encrypted transactions'} <CheckCircle2 size={16} className="text-green-500" /></li>
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'مراقبة أمنية مستمرة لمنع أي نشاط مشبوه' : 'Continuous security monitoring'} <CheckCircle2 size={16} className="text-green-500" /></li>
                         </ul>
                      </div>
                      <div className="space-y-6">
                         <h4 className="text-[#00D4FF] text-xs font-black uppercase tracking-widest">{isRTL ? 'كيف نحمي بياناتك؟' : 'HOW WE PROTECT YOU?'}</h4>
                         <ul className="space-y-4 text-gray-500 text-sm">
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'سرية مطلقة للحسابات والمحافظ المالية' : 'Absolute wallet confidentiality'} <ShieldCheck size={16} className="text-[#00D4FF]" /></li>
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'أمان عمليات الدفع والسحب والتحويل' : 'Secure payment operations'} <ShieldCheck size={16} className="text-[#00D4FF]" /></li>
                            <li className="flex items-center gap-3 justify-end"> {isRTL ? 'حماية المحادثات والأنشطة داخل المنصة' : 'Chat & activity protection'} <ShieldCheck size={16} className="text-[#00D4FF]" /></li>
                         </ul>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-white/5">
                      <p className="text-gray-600 text-xs font-bold italic uppercase tracking-widest">
                         {isRTL ? 'أمانك الرقمي ليس ميزة إضافية… بل جزء أساسي من بنية TraderBox.' : 'Your digital security is not an add-on... it is a core part of TraderBox.'}
                      </p>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📞 Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowContactModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121826] border border-white/10 w-full max-w-4xl rounded-[50px] p-12 relative z-10 shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#00D4FF]"></div>
                <div className="flex justify-end mb-4"><button onClick={() => setShowContactModal(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all"><X size={20} /></button></div>
                
                <div className="max-w-2xl mx-auto space-y-12 text-center">
                   <div className="space-y-6">
                      <h2 className="text-5xl font-black tracking-tighter uppercase">{isRTL ? 'تواصل مع TraderBox' : 'CONTACT TRADERBOX'}</h2>
                      <p className="text-gray-400 text-lg leading-relaxed font-bold">
                         {isRTL ? 'فريقنا جاهز دائمًا للإجابة على استفساراتك وتقديم الدعم الذي تحتاجه لضمان أفضل تجربة ممكنة.' : 'Our team is always ready to answer your inquiries and provide the support you need.'}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <a href="mailto:support@traderbox.com" className="p-10 bg-white/5 border border-white/5 rounded-[40px] hover:border-[#00D4FF]/40 transition-all group">
                         <div className="w-16 h-16 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] mb-6 group-hover:scale-110 transition-transform mx-auto"><Mail size={32} /></div>
                         <div className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">{isRTL ? 'البريد الإلكتروني' : 'EMAIL SUPPORT'}</div>
                         <div className="text-white font-bold text-sm">support@traderbox.com</div>
                      </a>
                      <div className="p-10 bg-white/5 border border-white/5 rounded-[40px] hover:border-[#00FF9C]/40 transition-all group cursor-pointer">
                         <div className="w-16 h-16 rounded-2xl bg-[#00FF9C]/10 flex items-center justify-center text-[#00FF9C] mb-6 group-hover:scale-110 transition-transform mx-auto"><Smartphone size={32} /></div>
                         <div className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">{isRTL ? 'تيليجرام الرسمي' : 'OFFICIAL TELEGRAM'}</div>
                         <div className="text-white font-bold text-sm">@TraderBox_Support</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 text-right rtl:text-right border-t border-white/5">
                      <div className="space-y-4">
                         <h4 className="text-[#00D4FF] text-xs font-black uppercase tracking-widest">{isRTL ? 'الدعم الفني' : 'TECHNICAL HELP'}</h4>
                         <ul className="space-y-3 text-gray-500 text-xs font-bold">
                            <li className="flex items-center gap-2 justify-end">{isRTL ? 'دعم متواصل لمعالجة المشاكل والاستفسارات' : 'Continuous support for all issues'} <CheckCircle2 size={14} className="text-[#00D4FF]" /></li>
                            <li className="flex items-center gap-2 justify-end">{isRTL ? 'متابعة سريعة للحالات التقنية والمالية' : 'Fast follow-up for finance/tech'} <CheckCircle2 size={14} className="text-[#00D4FF]" /></li>
                            <li className="flex items-center gap-2 justify-end">{isRTL ? 'فريق متخصص لضمان تجربة آمنة' : 'Dedicated professional team'} <CheckCircle2 size={14} className="text-[#00D4FF]" /></li>
                         </ul>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-purple-400 text-xs font-black uppercase tracking-widest">{isRTL ? 'الشراكات والتعاون' : 'PARTNERSHIPS'}</h4>
                         <p className="text-gray-500 text-xs leading-relaxed font-bold">
                            {isRTL ? 'يسعدنا التواصل مع الشركات والمستثمرين لبناء شراكات طويلة المدى.' : 'We welcome companies and investors to build long-term strategic partnerships.'}
                         </p>
                      </div>
                   </div>

                   <div className="pt-10 flex flex-col items-center gap-4">
                      <div className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">{isRTL ? 'متاح 24/7 لدعمكم' : 'AVAILABLE 24/7 FOR YOUR SUPPORT'}</div>
                      <p className="text-gray-600 text-[10px] font-bold italic">
                         {isRTL ? 'نحن لا نقدّم منصة فقط… بل نبني علاقة ثقة مستمرة مع مستخدمينا.' : 'We don\'t just provide a platform... we build a lasting relationship of trust.'}
                      </p>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
       {/* 💸 Referral System Modal */}
       <AnimatePresence>
         {showReferralModal && (
           <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 text-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReferralModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121826] border border-white/10 w-full max-w-4xl rounded-[50px] p-12 relative z-10 shadow-3xl overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00D4FF] to-purple-600"></div>
                 <div className="flex justify-end mb-6"><button onClick={() => setShowReferralModal(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all"><X size={20} /></button></div>
                 <div className="max-w-2xl mx-auto space-y-12">
                    <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-400 mx-auto shadow-2xl shadow-purple-500/20">
                       <Gift size={40} />
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter uppercase">{isRTL ? 'نظام الإحالة العالمي' : 'GLOBAL REFERRAL SYSTEM'}</h2>
                    <p className="text-gray-400 text-xl leading-relaxed">{isRTL ? 'حول شبكتك الاجتماعية إلى مصدر دخل سلبي من خلال دعوة المتداولين للمنصة.' : 'Turn your social network into a passive income source by inviting traders to the platform.'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                       <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#00D4FF] mx-auto font-black text-xl">1</div>
                          <div className="font-black text-[10px] uppercase tracking-widest">{isRTL ? 'انسخ الرابط' : 'COPY LINK'}</div>
                          <p className="text-gray-500 text-[10px] font-bold">{isRTL ? 'احصل على رابطك الفريد من لوحة التحكم.' : 'Get your unique link from the dashboard.'}</p>
                       </div>
                       <div className="p-8 bg-purple-500/10 rounded-3xl border border-purple-500/20 space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={40} /></div>
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mx-auto font-black text-xl">2</div>
                          <div className="font-black text-[10px] uppercase tracking-widest text-purple-400">{isRTL ? 'اربح 5$' : 'EARN $5'}</div>
                          <p className="text-gray-300 text-[10px] font-black">{isRTL ? 'عن كل اشتراك مكتمل يتم من خلالك.' : 'For every completed subscription via you.'}</p>
                       </div>
                       <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#00D4FF] mx-auto font-black text-xl">3</div>
                          <div className="font-black text-[10px] uppercase tracking-widest">{isRTL ? 'سحب فوري' : 'INSTANT PAYOUT'}</div>
                          <p className="text-gray-500 text-[10px] font-bold">{isRTL ? 'اسحب أرباحك فوراً لمحفظتك الرقمية.' : 'Withdraw earnings instantly to your crypto wallet.'}</p>
                       </div>
                    </div>

                    <div className="pt-8 flex flex-col items-center gap-6">
                       <Link href="/register" className="px-12 py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-[#00D4FF] hover:scale-105 transition-all shadow-2xl">
                          {isRTL ? 'ابدأ الآن' : 'START EARNING NOW'}
                       </Link>
                       <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                          {isRTL ? 'لا يوجد سقف للأرباح. كلما دعوت أكثر، ربحت أكثر.' : 'NO EARNING LIMITS. THE MORE YOU INVITE, THE MORE YOU EARN.'}
                       </p>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
       </AnimatePresence>

    </div>
  );
}

function AboutCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-4">
       <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] mx-auto">{icon}</div>
       <div className="font-black text-[10px] uppercase tracking-widest">{title}</div>
       <p className="text-gray-500 text-[10px] font-bold">{desc}</p>
    </div>
  );
}

function SponsorBenefit({ icon, title, desc }: any) {
  return (
    <div className="flex gap-5 group text-left">
       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#00D4FF] shrink-0 border border-white/5 group-hover:bg-[#00D4FF]/10 transition-colors">{icon}</div>
       <div className="space-y-1">
          <div className="font-bold text-white uppercase text-xs tracking-wider">{title}</div>
          <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

function SponsorLogo({ name }: { name: string }) {
   const getSponsorIcon = (n: string) => {
      if (n.includes("BINANCE")) return <Zap size={24} className="text-yellow-400" />;
      if (n.includes("NEXUS")) return <Activity size={24} className="text-[#00FF9C]" />;
      if (n.includes("METATRADER")) return <Cpu size={24} className="text-blue-400" />;
      if (n.includes("TRADINGVIEW")) return <LineChart size={24} className="text-blue-500" />;
      return <Cpu size={24} />;
   };
   return (
      <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.98, 1.02, 0.98] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }} className="flex items-center gap-4">
         <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">{getSponsorIcon(name.toUpperCase())}</div>
         <span className="font-black text-2xl tracking-tighter uppercase text-gray-600">{name}</span>
      </motion.div>
   );
}

function FooterLink({ icon, label, onClick }: any) {
   return (
      <button onClick={onClick} className="group flex items-center gap-4 text-gray-500 hover:text-white transition-all text-sm font-semibold text-left">
         {icon && <span className="text-gray-800 group-hover:text-[#00D4FF] transition-colors">{icon}</span>}
         {label}
      </button>
   );
}

function FeatureBlock({ icon, title, color }: any) {
   return (
      <motion.div 
        animate={{ 
          opacity: [1, 0.3, 1], 
          scale: [1, 1.04, 1],
          boxShadow: ["0 0 0px rgba(0,212,255,0)", "0 0 30px rgba(0,212,255,0.15)", "0 0 0px rgba(0,212,255,0)"]
        }} 
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
        className={`${color} p-10 rounded-[40px] text-center space-y-6 border border-white/10 shadow-2xl hover:border-[#00D4FF]/40 transition-all cursor-pointer group`}
      >
         <div className="w-16 h-16 rounded-2xl bg-black/40 mx-auto flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">{icon}</div>
         <h4 className="text-2xl font-black uppercase tracking-tighter group-hover:text-white transition-colors">{title}</h4>
      </motion.div>
   );
}
