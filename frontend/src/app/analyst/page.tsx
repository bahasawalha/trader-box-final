"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { 
  BookOpen, 
  PenTool, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  FileText, 
  Plus, 
  Globe, 
  MessageSquare, 
  ChevronRight,
  Eye,
  Clock,
  Zap,
  LayoutDashboard,
  RefreshCw,
  Image as ImageIcon,
  Camera,
  X as CloseIcon,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Trash2,
  BellRing
} from "lucide-react";
import Link from "next/link";

export default function AnalystDashboard() {
  const { user } = useAuth();
  const { t, isRTL, lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalReports: 0, readerReach: 0, accuracy: 88 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [newReport, setNewReport] = useState({ title: "", content: "", image: "" });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      const [reportsData, statsData] = await Promise.all([
        apiFetch("/analyst/reports/my"),
        apiFetch("/analyst/stats")
      ]);
      setReports(reportsData);
      setStats(statsData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setNewReport({ ...newReport, image: data.url });
      }
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setUploading(false);
    }
  }

  async function handlePublish(e: any) {
    e.preventDefault();
    try {
      await apiFetch("/analyst/reports", {
        method: "POST",
        body: JSON.stringify(newReport)
      });
      setSuccessMsg(isRTL ? "تم بث المعلومات بنجاح!" : "Intelligence broadcasted successfully!");
      setShowEditor(false);
      setNewReport({ title: "", content: "", image: "" });
      loadDashboardData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e: any) { 
      alert(e.message); 
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <div className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">{t.loading}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-2 font-inter pb-32">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 📢 Success Notification */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] bg-[#00FF9C] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-[0_0_50px_rgba(0,255,156,0.3)]"
            >
              <CheckCircle2 size={18} /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">
              <BookOpen size={14} /> {t.strategic_intelligence}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">{t.analyst_terminal}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowEditor(true)}
              className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-105 transition-all"
            >
              <Plus size={18} /> {t.new_report}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricCard 
            icon={<FileText className="text-blue-400" />} 
            label={t.total_reports} 
            value={stats.totalReports.toString()} 
            trend="Active" 
          />
          <MetricCard 
            icon={<Eye className="text-purple-400" />} 
            label={t.reader_reach} 
            value={stats.readerReach >= 1000 ? `${(stats.readerReach/1000).toFixed(1)}k` : stats.readerReach.toString()} 
            trend="+14%" 
          />
          <MetricCard 
            icon={<Zap className="text-[#00FF9C]" />} 
            label={t.accuracy_rate} 
            value={`${stats.accuracy}%`} 
            trend="Elite" 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-black tracking-tight">{t.intel_ledger}</h3>
            {reports.length === 0 ? (
              <div className="bg-[#121826] border border-dashed border-white/10 rounded-[40px] p-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-gray-700">
                  <FileText size={40} />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-black uppercase text-xs tracking-widest">{t.no_reports_yet}</p>
                  <p className="text-gray-500 text-sm max-w-xs">{t.start_broadcasting}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-[#121826] border border-white/5 rounded-[40px] overflow-hidden hover:border-blue-500/30 transition-all group flex flex-col">
                     {report.image && (
                       <div className="h-48 overflow-hidden relative">
                          <img src={report.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#121826] to-transparent opacity-60" />
                       </div>
                     )}
                     <div className="p-8 space-y-4 flex-1 flex flex-col">
                        <div className="text-xl font-black leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">{report.title}</div>
                        <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                           <span className="flex items-center gap-2"><Clock size={12} className="text-blue-500" /> {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex-1" />
                        <Link 
                          href={`/analyses`}
                          className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black text-center uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        >
                          {t.view_analysis}
                        </Link>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
             <h3 className="text-2xl font-black tracking-tight">{t.market_pulse}</h3>
             <div className="bg-[#0D1117] border border-white/5 rounded-[40px] p-8 space-y-6 text-sm text-gray-400">
                <PulseItem icon={<Globe size={16} className="text-blue-500"/>} text={isRTL ? "مراقبة الفيدرالي الليلة" : "FED watch tonight"} />
                <PulseItem icon={<Activity size={16} className="text-[#00FF9C]"/>} text={isRTL ? "حركة حيتان ضخمة في BTC" : "Massive BTC whale movement"} />
                <PulseItem icon={<AlertTriangle size={16} className="text-orange-500"/>} text={isRTL ? "تحذير: سيولة ضعيفة في الأسواق الآسيوية" : "Warning: Thin liquidity in Asia session"} />
                <PulseItem icon={<MessageSquare size={16} className="text-purple-500"/>} text={isRTL ? "توجهات تويتر الفنية" : "Twitter Technical Sentiment"} />
             </div>

             <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/10 rounded-[40px] p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                   <TrendingUp size={24} />
                </div>
                <div className="space-y-2">
                   <h4 className="font-black text-lg">{isRTL ? 'نصيحة المحلل' : 'Expert Protocol'}</h4>
                   <p className="text-xs text-gray-400 leading-relaxed">
                     {isRTL ? 'تذكر دائماً أن جودة التحليل أهم من الكمية. التقارير التي تحتوي على رسوم بيانية واضحة تحقق تفاعلاً أكبر بـ 4 أضعاف.' : 'Quality over quantity. Reports indexed with high-resolution technical charts achieve 4x higher operational engagement.'}
                   </p>
                </div>
             </div>
          </div>

        </div>

      </div>

      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditor(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-[#121826] border border-white/10 w-full max-w-3xl rounded-[50px] p-10 relative z-10 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                    <PenTool size={24} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{t.draft_intel}</h2>
                </div>
                <button onClick={() => setShowEditor(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all text-xl">✕</button>
              </div>

              <form onSubmit={handlePublish} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{t.report_title}</label>
                   <input 
                     value={newReport.title}
                     onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 text-xl font-black transition-all placeholder:text-white/10" 
                     placeholder={isRTL ? "مثال: انفجار سعري قريب لـ BTC..." : "Ex: BTC Imminent Breakout..."}
                     required
                   />
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{t.attach_chart}</label>
                   
                   <div 
                     onClick={() => !uploading && fileInputRef.current?.click()}
                     className="border-2 border-dashed border-white/5 rounded-[40px] min-h-[300px] flex flex-col items-center justify-center bg-black/30 overflow-hidden relative group cursor-pointer hover:border-blue-500/50 transition-all shadow-inner"
                   >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept="image/*"
                      />

                      {uploading ? (
                        <div className="flex flex-col items-center gap-6 text-blue-500">
                          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t.loading}</span>
                        </div>
                      ) : newReport.image ? (
                        <>
                          <img src={newReport.image} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-6 py-3 rounded-full shadow-2xl">Change Intel Image</span>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setNewReport({...newReport, image: ''}); }} 
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-20"
                          >
                            <CloseIcon size={20}/>
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-6 text-gray-700 group-hover:text-blue-500 transition-all">
                          <div className="w-24 h-24 rounded-[35px] bg-white/5 flex items-center justify-center shadow-xl">
                            <Upload size={40} />
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">{t.upload_chart}</div>
                            <div className="text-[9px] font-bold text-gray-600 italic">Industry standard: PNG, JPG (Max 5MB)</div>
                          </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{t.intel_body}</label>
                  <textarea 
                    value={newReport.content}
                    onChange={(e) => setNewReport({...newReport, content: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-[35px] px-8 py-8 outline-none focus:border-blue-500 min-h-[250px] text-gray-300 leading-relaxed font-medium transition-all" 
                    placeholder={isRTL ? "اكتب تحليلك الاستراتيجي هنا..." : "Write your strategic analysis here..."}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full py-6 rounded-[30px] bg-blue-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {t.broadcast_intel}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-[#121826] border border-white/5 p-8 rounded-[45px] space-y-4 hover:border-blue-500/20 transition-all group relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/10 transition-all" />
      <div className="flex justify-between items-start relative z-10">
        <div className="w-16 h-16 rounded-[22px] bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600/10 transition-all">{icon}</div>
        <div className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest">{trend}</div>
      </div>
      <div className="relative z-10">
        <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-4xl font-black tracking-tighter">{value}</div>
      </div>
    </div>
  );
}

function PulseItem({ icon, text }: any) {
  return (
    <div className="flex items-center gap-5 group cursor-pointer py-1">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-700 group-hover:text-white group-hover:bg-white/10 transition-all">{icon}</div>
      <div className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">{text}</div>
    </div>
  );
}
