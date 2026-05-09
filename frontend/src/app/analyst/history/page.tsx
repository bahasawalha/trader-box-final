"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { 
  History, 
  FileText, 
  Clock, 
  ArrowUpRight, 
  Search,
  Filter,
  Eye,
  Calendar,
  Edit,
  Trash2,
  X,
  Save,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AnalystHistory() {
  const { t, isRTL } = useLanguage();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingReport, setEditingReport] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await apiFetch("/analyst/reports/my");
      setReports(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف هذا التقرير؟" : "Are you sure you want to delete this report?")) return;
    try {
      await apiFetch(`/analyst/reports/${id}`, { method: 'DELETE' });
      toast.success(isRTL ? "تم الحذف بنجاح" : "Deleted successfully");
      loadHistory();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/analyst/reports/${editingReport.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editingReport.title,
          content: editingReport.content,
          image: editingReport.image
        })
      });
      toast.success(isRTL ? "تم التعديل بنجاح" : "Updated successfully");
      setEditingReport(null);
      loadHistory();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse text-blue-500 font-black uppercase tracking-widest">{t.loading}</div>;

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight uppercase">{t.my_reports}</h1>
          <p className="text-gray-500 font-medium">{isRTL ? 'إدارة وأرشفة تحليلاتك الاستراتيجية المنشورة.' : 'Manage and archive your published strategic intelligence.'}</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-blue-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder={isRTL ? "البحث في التقارير..." : "Search intel ledger..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121826] border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-blue-500 transition-all font-bold text-sm"
          />
        </div>
      </header>

      {filteredReports.length === 0 ? (
        <div className="bg-[#121826] border border-dashed border-white/10 rounded-[40px] p-24 flex flex-col items-center justify-center text-center space-y-6">
           <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-gray-700">
             <History size={48} />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-black uppercase">{isRTL ? 'السجل فارغ' : 'LEDGER EMPTY'}</h3>
              <p className="text-gray-500 max-w-sm">{isRTL ? 'لم يتم العثور على أي تقارير مطابقة لبحثك في الأرشيف.' : 'No reports matching your criteria were found in the intelligence archive.'}</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredReports.map((report) => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#121826] border border-white/5 rounded-[35px] p-8 flex flex-col md:flex-row items-center justify-between hover:border-blue-500/30 transition-all group gap-8"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
                   <FileText size={28} />
                 </div>
                 <div className="space-y-1">
                    <h2 className="text-xl font-black leading-tight group-hover:text-blue-400 transition-colors">{report.title}</h2>
                    <div className="flex items-center gap-4 text-[10px] text-gray-600 font-black uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(report.createdAt).toLocaleDateString()}</span>
                       <span className="w-1 h-1 rounded-full bg-white/10" />
                       <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(report.createdAt).toLocaleTimeString()}</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                 <div className="text-right hidden lg:block mr-4">
                    <div className="text-xs font-black uppercase text-blue-500">{isRTL ? 'منشور' : 'PUBLISHED'}</div>
                    <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{isRTL ? 'الحالة التشغيلية' : 'OPERATIONAL STATUS'}</div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingReport(report)}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all"
                    >
                       <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(report.id)}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                       <Trash2 size={18} />
                    </button>
                    <Link 
                      href={`/analyses`}
                      target="_blank"
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-blue-600 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                       <ArrowUpRight size={20} />
                    </Link>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B0F1A] border border-white/10 w-full max-w-3xl rounded-[40px] p-10 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
            
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black uppercase tracking-tight">{isRTL ? 'تعديل التحليل الاستراتيجي' : 'EDIT STRATEGIC INTEL'}</h2>
               <button onClick={() => setEditingReport(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all">
                 <X size={20} />
               </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">{isRTL ? 'عنوان التقرير' : 'INTEL TITLE'}</label>
                <input 
                  required
                  value={editingReport.title}
                  onChange={(e) => setEditingReport({...editingReport, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-bold text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">{isRTL ? 'رابط الصورة المعبرة' : 'VISUAL ASSET URL'}</label>
                <input 
                  value={editingReport.image}
                  onChange={(e) => setEditingReport({...editingReport, image: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-bold text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">{isRTL ? 'محتوى التحليل العميق' : 'DEEP INTEL CONTENT'}</label>
                <textarea 
                  required
                  rows={8}
                  value={editingReport.content}
                  onChange={(e) => setEditingReport({...editingReport, content: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-3xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-medium text-sm leading-relaxed resize-none"
                />
              </div>

              <button 
                disabled={saving}
                type="submit"
                className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {isRTL ? 'تحديث البيانات' : 'UPDATE INTEL'}</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

    </div>
  );
}
