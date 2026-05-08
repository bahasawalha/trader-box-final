"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function ProviderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [provider, setProvider] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) loadProvider();
  }, [id]);

  async function loadProvider() {
    try {
      const [p, r, s] = await Promise.all([
        apiFetch(`/providers/${id}`),
        apiFetch(`/providers/${id}/recommendations`),
        apiFetch(`/subscription/status?providerId=${id}`).catch(() => ({ active: false }))
      ]);

      setProvider(p);
      setRecommendations(r);
      setSubscribed(s.active);
    } catch (error) {
      console.error("Failed to load provider data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubscribe = async () => {
    setActionLoading(true);
    try {
      await apiFetch("/subscribe", {
        method: "POST",
        body: JSON.stringify({ providerId: id })
      });
      setSubscribed(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00D4FF]"></div>
    </div>
  );

  if (!provider) return <div className="min-h-screen flex items-center justify-center text-white">Provider not found</div>;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-12 space-y-10 pb-32">
      
      {/* 🔙 Back Button */}
      <motion.button 
        onClick={() => router.back()}
        animate={{ 
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="flex items-center gap-2 text-[#00D4FF] hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] group mb-4"
      >
        <ArrowLeft size={16} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-[-4px] transition-transform`} />
        {isRTL ? 'الرجوع للرئيسية' : 'Back to Terminal'}
      </motion.button>

      {/* 👤 Provider Header */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,212,255,0.15)] flex flex-col md:flex-row justify-between items-center gap-6">

        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {provider.name}
            </h1>
            <ShieldCheck size={24} className="text-[#00D4FF] drop-shadow-[0_0_15px_rgba(0,212,255,0.6)]" />
          </div>

          <p className="text-gray-400 mt-2 font-medium">
            Score: <span className="text-[#00D4FF]">{provider.score}</span> • Subscribers: <span className="text-[#00FF9C]">{provider.subscribers}</span>
          </p>
        </div>

        <SubscribeButton
          subscribed={subscribed}
          loading={loading}
          price={provider.price}
          onClick={handleSubscribe}
        />

      </div>

      {/* 📊 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Platform Score" value={provider.score} />
        <StatCard label="Active Subscribers" value={provider.subscribers} />
        <StatCard label="Monthly Plan" value={`$${provider.price}`} />
      </div>

      {/* 📈 Recommendations */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold ml-2">{isRTL ? 'سجل التوصيات' : 'Recommendation History'}</h2>

        <div className="space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map((r) => (
              <RecommendationRow key={r.id} rec={r} isRTL={isRTL} />
            ))
          ) : (
            <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center text-gray-500 italic">
               {isRTL ? 'لا يوجد سجل توصيات متوفر حالياً.' : 'No recommendation history available yet.'}
            </div>
          )}
        </div>
      </div>

      {/* 📝 About / Strategy Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold ml-2">{isRTL ? 'عن المزود واستراتيجيته' : 'About the Operative & Strategy'}</h2>
        <div className="bg-[#121826] border border-white/5 p-8 rounded-[40px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={100} /></div>
           <div className="relative z-10">
              <p className="text-lg text-gray-400 leading-relaxed font-medium italic">
                "{provider.bio || (isRTL ? 'لا توجد معلومات إضافية متوفرة حالياً لهذا المزود.' : 'No additional intelligence records available for this operative at this time.')}"
              </p>
           </div>
           <div className="mt-8 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#00D4FF]/30 to-transparent"></div>
              <div className="text-[10px] font-black text-[#00D4FF] uppercase tracking-[0.4em]">Verified Operative</div>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#00D4FF]/30 to-transparent"></div>
           </div>
        </div>
      </div>

    </div>
  );
}

// 💳 2. Subscribe Button
function SubscribeButton({ subscribed, loading, price, onClick }: any) {
  if (subscribed) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#00FF9C]/20 text-[#00FF9C] px-8 py-3 rounded-2xl border border-[#00FF9C]/20 font-bold"
      >
        Subscribed
      </motion.div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-[#00D4FF] text-black px-10 py-3 rounded-2xl font-bold hover:scale-105 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50"
    >
      {loading ? "Processing..." : `Subscribe for $${price}`}
    </button>
  );
}

// 📊 3. Stat Card
function StatCard({ label, value }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl text-center shadow-lg hover:border-[#00D4FF]/20 transition-all"
    >
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-bold mt-2 font-mono">{value}</h3>
    </motion.div>
  );
}

// 📈 4. Recommendation Row
function RecommendationRow({ rec, isRTL }: any) {
  const isBuy = rec.type.includes("BUY");
  const typeColor = isBuy ? "text-[#00FF9C]" : "text-[#FF4D4F]";
  const date = new Date(rec.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-white/20 transition-all"
    >
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[10px] text-center ${isBuy ? 'bg-[#00FF9C]/10' : 'bg-[#FF4D4F]/10'} ${typeColor}`}>
          {rec.type.replace('_', ' ')}
        </div>
        <div>
          <h3 className="text-lg font-bold">{rec.pair?.symbol || "N/A"}</h3>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">{date}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 w-full md:w-auto text-center md:text-left">
        <div className="space-y-1">
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{isRTL ? 'الدخول' : 'Entry'}</p>
          <p className="font-mono text-sm">{rec.entryPrice}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{isRTL ? 'الهدف' : 'Target'}</p>
          <p className="font-mono text-sm text-[#00FF9C]">{rec.takeProfit}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{isRTL ? 'الوقف' : 'Stop'}</p>
          <p className="font-mono text-sm text-[#FF4D4F]">{rec.stopLoss}</p>
        </div>
      </div>

      <div className="w-full md:w-auto flex justify-end">
        <StatusBadge status={rec.status} result={rec.result} isRTL={isRTL} />
      </div>
    </motion.div>
  );
}

// 🟡 5. Status Badge
function StatusBadge({ status, result, isRTL }: any) {
  let label = status;
  let color = "bg-gray-500/20 text-gray-400 border-gray-500/20";

  if (status === "ACTIVE") {
    label = isRTL ? "نشطة" : "ACTIVE";
    color = "bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/20";
  } else if (status === "PENDING") {
    label = isRTL ? "معلقة" : "PENDING";
    color = "bg-yellow-500/20 text-yellow-400 border-yellow-500/20";
  } else if (status === "CLOSED") {
    if (result === "WIN") {
      label = isRTL ? "ربح" : "WIN";
      color = "bg-[#00FF9C]/20 text-[#00FF9C] border-[#00FF9C]/20";
    } else if (result === "LOSS") {
      label = isRTL ? "خسارة" : "LOSS";
      color = "bg-red-500/20 text-red-500 border-red-500/20";
    } else {
      label = isRTL ? "مغلقة" : "CLOSED";
      color = "bg-gray-500/20 text-gray-400 border-gray-500/20";
    }
  } else if (status === "EXPIRED") {
    label = isRTL ? "منتهية" : "EXPIRED";
  }

  return (
    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${color}`}>
      {label}
    </div>
  );
}
