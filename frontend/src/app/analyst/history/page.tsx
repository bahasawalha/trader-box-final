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
  Calendar
} from "lucide-react";
import Link from "next/link";

export default function AnalystHistory() {
  const { t, isRTL } = useLanguage();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse text-blue-500 font-black uppercase tracking-widest">{t.loading}</div>;

  return (
    <div className="space-y-12">
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

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                 <div className="text-right">
                    <div className="text-xs font-black uppercase text-blue-500">{isRTL ? 'منشور' : 'PUBLISHED'}</div>
                    <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{isRTL ? 'الحالة التشغيلية' : 'OPERATIONAL STATUS'}</div>
                 </div>
                 <Link 
                   href={`/analyses`}
                   className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-blue-600 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                 >
                    <ArrowUpRight size={20} />
                 </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
