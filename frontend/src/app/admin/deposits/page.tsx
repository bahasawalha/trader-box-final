"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Check, X, User as UserIcon, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/admin/deposits");
      setDeposits(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    if (!confirm("Approve this deposit?")) return;
    try {
      await apiFetch("/admin/deposit/approve", {
        method: "POST",
        body: JSON.stringify({ depositId: id })
      });
      load();
    } catch (e: any) { alert(e.message); }
  }

  async function reject(id: string) {
    if (!confirm("Reject this deposit?")) return;
    try {
      await apiFetch("/admin/deposit/reject", {
        method: "POST",
        body: JSON.stringify({ depositId: id })
      });
      load();
    } catch (e: any) { alert(e.message); }
  }

  if (loading) return <div>Loading deposits...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Deposit Requests</h1>
          <p className="text-gray-500 mt-1">Review and authorize incoming user deposits.</p>
        </div>
        <div className="bg-[#121826] px-4 py-2 rounded-xl border border-white/5 text-sm">
          Total: <span className="text-[#00D4FF] font-bold">{deposits.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {deposits.map((d) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={d.id}
            className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl flex justify-between items-center group hover:bg-white/[0.08] transition-all"
          >
            <div className="flex gap-6 items-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF] transition-all">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="font-bold text-lg">${d.amount.toFixed(2)}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 font-medium">
                  <span className="flex items-center gap-1"><UserIcon size={12} /> {d.user?.email}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</p>
                <p className={`text-sm font-bold ${d.status === 'APPROVED' ? 'text-[#00FF9C]' : d.status === 'REJECTED' ? 'text-[#FF4D4F]' : 'text-yellow-400'}`}>
                  {d.status}
                </p>
              </div>

              {d.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(d.id)}
                    className="p-3 bg-[#00FF9C]/10 text-[#00FF9C] rounded-xl hover:bg-[#00FF9C] hover:text-black transition-all"
                    title="Approve"
                  >
                    <Check size={20} />
                  </button>

                  <button
                    onClick={() => reject(d.id)}
                    className="p-3 bg-[#FF4D4F]/10 text-[#FF4D4F] rounded-xl hover:bg-[#FF4D4F] hover:text-white transition-all"
                    title="Reject"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
