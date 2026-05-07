"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Clock, 
  ShieldCheck,
  Search,
  MoreVertical
} from "lucide-react";

export default function ProviderSubscribers() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubs();
  }, []);

  async function loadSubs() {
    try {
      // For simulation, we'll fetch from a generic endpoint or mock
      const data = await apiFetch("/provider/stats"); 
      // Assuming stats returns subscriber count, but we want a list.
      // For now, we'll use a placeholder list if real list endpoint isn't ready.
      setSubs([
        { id: "1", email: "operative.01@terminal.io", startDate: new Date(), status: "ACTIVE" },
        { id: "2", email: "trader.alpha@global.com", startDate: new Date(), status: "ACTIVE" },
      ]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Audience Matrix</h1>
          <p className="text-gray-500 mt-1">Management of synchronized trading entities.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00FF9C]/10 text-[#00FF9C] text-xs font-bold uppercase tracking-widest border border-[#00FF9C]/20">
           <UserPlus size={14} /> New Growth Detected
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricMini label="Active Nodes" value={subs.length} icon={<Users size={16} />} />
         <MetricMini label="Retention Rate" value="98.2%" icon={<ShieldCheck size={16} />} />
         <MetricMini label="Avg. Lifetime" value="142 Days" icon={<Clock size={16} />} />
         <div className="bg-[#121826] border border-white/5 rounded-3xl p-4 flex items-center gap-3">
            <Search className="text-gray-600" size={18} />
            <input placeholder="Search entities..." className="bg-transparent border-none outline-none text-xs w-full" />
         </div>
      </div>

      <div className="bg-[#121826] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Operative Identity</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Sync Date</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {subs.map((sub) => (
              <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center text-xs font-bold font-mono">
                      {sub.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{sub.email}</div>
                      <div className="text-[9px] text-gray-600 font-mono">NODE_ID: {sub.id.slice(0,8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs text-gray-500 font-mono">
                  {new Date(sub.startDate).toLocaleDateString()}
                </td>
                <td className="px-8 py-5">
                   <span className="px-3 py-1 rounded-full bg-green-400/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-400/20">
                     Synchronized
                   </span>
                </td>
                <td className="px-8 py-5">
                   <button className="p-2 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white transition-all">
                     <MoreVertical size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricMini({ label, value, icon }: any) {
  return (
    <div className="bg-[#121826] border border-white/5 p-6 rounded-3xl flex items-center gap-4">
       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">{icon}</div>
       <div>
          <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">{label}</div>
          <div className="text-xl font-bold">{value}</div>
       </div>
    </div>
  );
}
