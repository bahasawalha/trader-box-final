"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { 
  HeadphonesIcon, 
  Mail, 
  MessageCircle, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Zap,
  Globe
} from "lucide-react";

export default function SupportPage() {
  const { t, isRTL, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* 🎧 Header */}
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-3xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] mx-auto shadow-[0_0_30px_rgba(0,212,255,0.1)]"
          >
            <HeadphonesIcon size={40} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">{isRTL ? 'مركز الدعم الفني' : 'Command Support Terminal'}</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {isRTL ? 'نحن هنا لضمان استقرار عملياتك وتذليل العقبات التقنية.' : 'Our elite support team is ready to assist with any operational or technical queries.'}
          </p>
        </header>

        {/* ⚡ Quick Contact Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContactCard 
            icon={<MessageCircle size={28} />} 
            title={isRTL ? 'دردشة حية' : 'Live Operative Chat'} 
            desc={isRTL ? 'تواصل مع الدعم في أقل من دقيقتين.' : 'Average response time: under 2 minutes.'} 
            action={isRTL ? 'ابدأ الدردشة' : 'Start Session'}
            color="text-green-400"
          />
          <ContactCard 
            icon={<Mail size={28} />} 
            title={isRTL ? 'البريد الرسمي' : 'Official Intelligence'} 
            desc={isRTL ? 'للاستفسارات الرسمية والشركات.' : 'For official inquiries and corporate syncs.'} 
            action={isRTL ? 'إرسال بريد' : 'Compose Email'}
            color="text-[#00D4FF]"
          />
        </section>

        {/* 📚 Knowledge Base / FAQ Preview */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <HelpCircle className="text-gray-500" size={24} />
            <h2 className="text-xl font-bold uppercase tracking-widest">{isRTL ? 'قاعدة المعرفة' : 'Knowledge Repository'}</h2>
          </div>

          <div className="space-y-4">
             <FAQItem 
               question={isRTL ? 'كيف يتم التحقق من الإيداعات؟' : 'How are deposits verified?'} 
               answer={isRTL ? 'تتم مراجعة جميع العمليات من قبل مدققين ماليين لضمان الأمان الكامل.' : 'All inbound liquidity goes through manual audit by our financial orchestrators.'} 
             />
             <FAQItem 
               question={isRTL ? 'هل المنصة تدعم جميع الدول؟' : 'Does the platform support all regions?'} 
               answer={isRTL ? 'نعم، نحن نعمل بنظام لامركزي يدعم الوصول العالمي.' : 'Yes, our terminal is accessible globally via decentralized protocols.'} 
             />
             <FAQItem 
               question={isRTL ? 'ما هي رسوم السحب؟' : 'What are the withdrawal fees?'} 
               answer={isRTL ? 'تعتمد الرسوم على شبكة البلوكشين وتتغير لحظياً لضمان السرعة.' : 'Fees are dynamically adjusted based on blockchain network congestion.'} 
             />
          </div>
        </section>

        {/* 🛡️ Status Center */}
        <div className="bg-[#121826] border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-green-400/10 flex items-center justify-center text-green-400">
                <ShieldAlert size={24} />
             </div>
             <div>
               <div className="text-sm font-bold uppercase tracking-widest">{isRTL ? 'حالة النظام' : 'Protocol Status'}</div>
               <div className="text-green-400 font-mono text-xs">ALL NODES OPERATIONAL</div>
             </div>
           </div>
           <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest">
             {isRTL ? 'عرض تقرير العقد' : 'View Node Reports'} <ExternalLink size={14} />
           </button>
        </div>

      </div>
    </div>
  );
}

function ContactCard({ icon, title, desc, action, color }: any) {
  const { isRTL } = useLanguage();
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-[#121826] border border-white/5 p-8 rounded-[40px] hover:border-white/10 transition-all group"
    >
      <div className={`${color} mb-6 transform group-hover:scale-110 transition-transform`}>{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">{desc}</p>
      <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-xs uppercase tracking-widest group-hover:bg-white/10 transition-all flex items-center justify-center gap-2">
        {action} <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
      </button>
    </motion.div>
  );
}

function FAQItem({ question, answer }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const { isRTL } = useLanguage();

  return (
    <div className="bg-[#121826] border border-white/5 rounded-[24px] overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left rtl:text-right flex justify-between items-center group"
      >
        <span className="font-bold text-sm group-hover:text-[#00D4FF] transition-colors">{question}</span>
        <ChevronRight size={18} className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-90' : (isRTL ? 'rotate-180' : '')}`} />
      </button>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-6 pb-6 text-gray-500 text-sm leading-relaxed border-t border-white/5 pt-4"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
}
