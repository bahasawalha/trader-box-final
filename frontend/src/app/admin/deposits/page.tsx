"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowDownRight, 
  Search,
  Filter,
  DollarSign,
  User
} from "lucide-react";

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/admin/deposits");
      setDeposits(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function approve(id: string) {
    if (!confirm("Approve this deposit and credit user wallet?")) return;
    try {
      await apiFetch("/admin/deposit/approve", {
        method: "POST",
        body: JSON.stringify({ depositId: id })
      });
      load();
    } catch (e: any) { alert(e.message); }
  }

  if (loading) return <div className="text-gray-500 font-mono p-10 animate-pulse">Scanning Inbound Liquidity...</div>;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Inbound Liquidity Audits</h1>
          <p className="text-gray-500 mt-1">Review and authorize pending deposit requests across the network.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              placeholder="Search by Transaction ID..." 
              className="bg-[#121826] border border-white/5 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-[#00D4FF]/30 transition-all text-sm w-64"
            />
          </div>
          <button className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-sm font-bold hover:bg-white/10 transition-all">
            <Filter size={16} /> Filter
          </button>
        </div>
      </header>

      <div className="bg-[#121826] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Operative</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Method</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Volume</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {deposits.map((d) => (
              <tr key={d.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500"><User size={18} /></div>
                    <div>
                      <div className="text-sm font-bold">{d.user?.email}</div>
                      <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{d.id.split('-')[0]}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                     {d.method}
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="text-sm font-bold text-[#00D4FF]">${d.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">USDT Verified</div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex justify-center">
                    {d.status === "PENDING" ? (
                      <span className="flex items-center gap-2 text-orange-400 text-[10px] font-bold uppercase tracking-widest bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                        <Clock size={12} /> Awaiting Audit
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-green-400 text-[10px] font-bold uppercase tracking-widest bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                        <CheckCircle2 size={12} /> Authorized
                      </span>
                    )}
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {d.status === "PENDING" && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => approve(d.id)}
                        className="px-4 py-2 rounded-xl bg-green-400 text-black text-xs font-bold hover:bg-green-300 transition-all shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                      >
                        Authorize
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-red-400/10 text-red-400 text-xs font-bold hover:bg-red-400/20 transition-all border border-red-400/20">
                        Reject
                      </button>
                    </div>
                  )}
                  {d.status !== "PENDING" && (
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Immutable Record</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {deposits.length === 0 && (
          <div className="p-20 text-center text-gray-600 font-mono text-xs uppercase tracking-[0.2em]">
            No inbound liquidity detected in network queue.
          </div>
        )}
      </div>
    </div>
  );
}
