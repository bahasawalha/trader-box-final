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
  Loader2
} from "lucide-react";

export default function AnalystDashboard() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [newReport, setNewReport] = useState({ title: "", content: "", image: "" });

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  async function loadReports() {
    try {
      const data = await apiFetch("/analyst/reports/my");
      setReports(data);
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
      // Direct fetch for multipart upload since apiFetch is optimized for JSON
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
      alert(isRTL ? "فشل رفع الصورة" : "Image upload failed");
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
      alert(isRTL ? "تم نشر التقرير بنجاح!" : "Strategic Intel broadcasted successfully!");
      setShowEditor(false);
      setNewReport({ title: "", content: "", image: "" });
      loadReports();
    } catch (e: any) { alert(e.message); }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center space-y-6">
      <RefreshCw className="text-blue-500 animate-spin" size={32} />
      <div className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">{t.loading}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 md:p-12 font-inter pb-32">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">
              <BookOpen size={14} /> {t.strategic_intelligence}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">{t.analyst_terminal}</h1>
          </div>
          <button 
            onClick={() => setShowEditor(true)}
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-105 transition-all"
          >
            <PenTool size={18} /> {t.new_report}
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricCard icon={<FileText className="text-blue-400" />} label={t.total_reports} value={(reports.length || 0).toString()} trend="Expert" />
          <MetricCard icon={<Eye className="text-purple-400" />} label={t.reader_reach} value="1.2k" trend="+14%" />
          <MetricCard icon={<Zap className="text-yellow-400" />} label={t.accuracy_rate} value="88%" trend="Institutional" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-black tracking-tight">{t.intel_ledger}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-[#121826] border border-white/5 rounded-[40px] overflow-hidden hover:border-blue-500/30 transition-all group">
                   {report.image && (
                     <div className="h-48 overflow-hidden">
                        <img src={report.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     </div>
                   )}
                   <div className="p-8 space-y-4">
                      <div className="text-xl font-black truncate">{report.title}</div>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                         <span className="flex items-center gap-1"><Clock size={10} /> {new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">View Details</button>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
             <h3 className="text-2xl font-black tracking-tight">{t.market_pulse}</h3>
             <div className="bg-[#0D1117] border border-white/5 rounded-[40px] p-8 space-y-6 text-sm text-gray-400">
                <PulseItem icon={<Globe size={16}/>} text={isRTL ? "مراقبة الفيدرالي الليلة" : "FED watch tonight"} />
                <PulseItem icon={<Activity size={16}/>} text={isRTL ? "حركة حيتان ضخمة في BTC" : "Massive BTC whale movement"} />
                <PulseItem icon={<MessageSquare size={16}/>} text={isRTL ? "توجهات تويتر الفنية" : "Twitter Technical Sentiment"} />
             </div>
          </div>

        </div>

      </div>

      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditor(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121826] border border-white/10 w-full max-w-3xl rounded-[40px] p-10 relative z-10 shadow-3xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black uppercase">{t.draft_intel}</h2>
                <button onClick={() => setShowEditor(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all">✕</button>
              </div>
              <form onSubmit={handlePublish} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.report_title}</label>
                   <input 
                     value={newReport.title}
                     onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 text-lg font-bold" 
                     placeholder={isRTL ? "مثال: انفجار سعري قريب لـ BTC..." : "Ex: BTC Imminent Breakout..."}
                     required
                   />
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'إرفاق تحليل فني (صورة)' : 'Attach Technical Chart (Image)'}</label>
                   
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="border-2 border-dashed border-white/5 rounded-[32px] min-h-[250px] flex flex-col items-center justify-center bg-black/20 overflow-hidden relative group cursor-pointer hover:border-blue-500/50 transition-all"
                   >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept="image/*"
                      />

                      {uploading ? (
                        <div className="flex flex-col items-center gap-4 text-blue-500">
                          <Loader2 className="animate-spin" size={40} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Uploading Image...</span>
                        </div>
                      ) : newReport.image ? (
                        <>
                          <img src={newReport.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-full">Change Image</span>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setNewReport({...newReport, image: ''}); }} 
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all"
                          >
                            <CloseIcon size={18}/>
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-600 group-hover:text-blue-500 transition-colors">
                          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center">
                            <Upload size={32} />
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] font-black uppercase tracking-widest mb-1">Click to Upload Chart</div>
                            <div className="text-[9px] font-bold text-gray-500">Supports PNG, JPG, WEBP</div>
                          </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.intel_body}</label>
                  <textarea 
                    value={newReport.content}
                    onChange={(e) => setNewReport({...newReport, content: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-6 outline-none focus:border-blue-500 min-h-[200px] text-gray-300 leading-relaxed" 
                    placeholder={isRTL ? "اكتب تحليلك الاستراتيجي هنا..." : "Write your strategic analysis here..."}
                    required
                  />
                </div>
                <button type="submit" className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-500 transition-all">
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
    <div className="bg-[#121826] border border-white/5 p-8 rounded-[40px] space-y-4 hover:border-blue-500/20 transition-all group">
      <div className="flex justify-between items-start">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{trend}</div>
      </div>
      <div>
        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
        <div className="text-4xl font-black tracking-tighter">{value}</div>
      </div>
    </div>
  );
}

function PulseItem({ icon, text }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="text-gray-700 group-hover:text-blue-500 transition-colors">{icon}</div>
      <div className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{text}</div>
    </div>
  );
}
