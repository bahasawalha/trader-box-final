"use client";

import { useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Eye, 
  FileEdit, 
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart3,
  Upload,
  Loader2,
  X as CloseIcon,
  BookOpen
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PublishAnalysis() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({ title: "", content: "", image: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);

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
      if (data.url) setForm({ ...form, image: data.url });
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!form.title || !form.content) return;
    
    setLoading(true);
    try {
      await apiFetch("/analyst/reports", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/analyst/history");
      }, 2000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
       <div className="w-24 h-24 rounded-full bg-[#00FF9C]/10 flex items-center justify-center text-[#00FF9C] shadow-[0_0_50px_rgba(0,255,156,0.2)]">
          <CheckCircle2 size={50} />
       </div>
       <h2 className="text-3xl font-black uppercase tracking-tighter text-center">{isRTL ? 'تم بث التقرير بنجاح!' : 'INTELLIGENCE BROADCASTED!'}</h2>
       <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em]">{isRTL ? 'جاري تحويلك للأرشيف...' : 'RE-INDEXING LEDGER...'}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">
            <BookOpen size={14} /> {t.strategic_intelligence}
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase">{t.publish_report}</h1>
        </div>
        
        <button 
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#121826] border border-white/5 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all shadow-xl"
        >
          {preview ? <FileEdit size={18} className="text-blue-500" /> : <Eye size={18} className="text-blue-500" />}
          {preview ? (isRTL ? 'العودة للمحرر' : 'OPERATIONAL EDITOR') : (isRTL ? 'معاينة حية' : 'LIVE NODE PREVIEW')}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* 📝 Editor Section */}
        <div className={`space-y-8 ${preview ? 'hidden lg:block opacity-40 grayscale pointer-events-none' : ''}`}>
           <div className="bg-[#121826] border border-white/5 rounded-[45px] p-10 space-y-10 shadow-3xl">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{t.report_title}</label>
                  <input 
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="E.g. BTC Market Structural Shift..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 transition-all font-black text-xl placeholder:text-white/5"
                  />
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{t.attach_chart}</label>
                   <div 
                     onClick={() => !uploading && fileInputRef.current?.click()}
                     className="border-2 border-dashed border-white/5 rounded-[35px] min-h-[250px] flex flex-col items-center justify-center bg-black/30 overflow-hidden relative group cursor-pointer hover:border-blue-500/50 transition-all shadow-inner"
                   >
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-4 text-blue-500">
                          <Loader2 className="animate-spin" size={32} />
                          <span className="text-[10px] font-black uppercase tracking-widest">TRANSMITTING IMAGE...</span>
                        </div>
                      ) : form.image ? (
                        <>
                          <img src={form.image} className="w-full h-full object-cover opacity-80" />
                          <button onClick={(e) => { e.stopPropagation(); setForm({...form, image: ''}); }} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl z-20 hover:scale-110 transition-all">✕</button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-700 group-hover:text-blue-500 transition-all">
                          <Upload size={40} />
                          <div className="text-center">
                            <div className="text-[9px] font-black uppercase tracking-[0.3em]">{t.upload_chart}</div>
                          </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{t.intel_body}</label>
                  <textarea 
                    rows={10}
                    value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    placeholder={isRTL ? "اكتب تحليلك الاستراتيجي هنا..." : "Write your strategic analysis here..."}
                    className="w-full bg-black/40 border border-white/10 rounded-[35px] px-8 py-8 outline-none focus:border-blue-500 transition-all font-medium text-sm leading-relaxed text-gray-300 custom-scrollbar"
                  />
                </div>
              </div>

              <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[30px] flex gap-4 items-center">
                 <AlertTriangle className="text-blue-400 shrink-0" size={20} />
                 <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
                   {isRTL ? 'التقارير نهائية بمجرد بثها. تأكد من صحة البيانات بالكامل.' : 'REPORTS ARE IMMUTABLE ONCE BROADCASTED. ENSURE ALL INTELLIGENCE VECTORS ARE VERIFIED.'}
                 </p>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading || !form.title || !form.content}
                className="w-full py-6 rounded-[30px] bg-blue-600 text-white font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:-translate-y-1 transition-all disabled:opacity-30 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                {loading ? (isRTL ? 'جاري البث...' : 'TRANSMITTING...') : t.broadcast_intel}
              </button>
           </div>
        </div>

        {/* 👁️ Preview Section */}
        <div className={`${!preview ? 'hidden lg:block opacity-40' : ''}`}>
           <div className="sticky top-32 space-y-8">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-2 ml-4">
                 <Zap size={14} fill="currentColor" /> {isRTL ? 'معاينة العقدة الحية' : 'LIVE NODE PREVIEW'}
              </div>
              
              <div className="bg-[#121826] border border-white/10 rounded-[50px] p-12 min-h-[600px] shadow-3xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-5">
                    <BarChart3 size={150} className="text-blue-500" />
                 </div>
                 
                 {form.title || form.content ? (
                   <article className="relative z-10 space-y-10">
                      <h2 className={`text-4xl font-black leading-tight border-blue-500 ${isRTL ? 'border-r-8 pr-8' : 'border-l-8 pl-8'}`}>{form.title || "Intelligence Header"}</h2>
                      {form.image && <img src={form.image} className="w-full h-72 object-cover rounded-[35px] border border-white/5 shadow-2xl" />}
                      <div className="prose prose-invert max-w-none">
                         {form.content.split('\n').map((line, i) => (
                           <p key={i} className="text-gray-400 text-lg leading-relaxed mb-6 font-medium">{line}</p>
                         )) || "Awaiting analytical core data..."}
                      </div>
                   </article>
                 ) : (
                   <div className="h-[400px] flex flex-col items-center justify-center text-gray-800 space-y-6">
                      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                        <FileEdit size={40} />
                      </div>
                      <p className="font-black text-[10px] uppercase tracking-[0.5em]">{isRTL ? 'في انتظار بيانات المحرر' : 'AWAITING OPERATIONAL INPUT'}</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
