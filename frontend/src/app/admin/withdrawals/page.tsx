"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Check, X, User as UserIcon, Wallet, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function WithdrawalsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await apiFetch("/admin/withdrawals");
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    if (!confirm("Confirm withdrawal approval? This will deduct funds and record the transaction.")) return;
    try {
      await apiFetch("/admin/withdraw/approve", {
        method: "POST",
        body: JSON.stringify({ withdrawalId: id })
      });
      load();
    } catch (e: any) { alert(e.message); }
  }

  async function reject(id: string) {
    if (!confirm("Reject this withdrawal?")) return;
    try {
      await apiFetch("/admin/withdraw/reject", {
        method: "POST",
        body: JSON.stringify({ withdrawalId: id })
      });
      load();
    } catch (e: any) { alert(e.message); }
  }

  if (loading) return <div>Loading withdrawals...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#FF4D4F]">Withdrawal Requests</h1>
        <p className="text-gray-500 mt-1">Review payouts and manage user fund withdrawals.</p>
      </div>

      <div className="space-y-4">
        {data.map((w) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={w.id}
            className="bg-[#121826] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-[#FF4D4F]/10 text-[#FF4D4F] rounded-xl">
                <ArrowUpRight size={24} />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold">${w.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-400 font-medium">{w.user?.email}</p>
              </div>
            </div>

            <div className="flex-1 px-8 py-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Withdrawal Details</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Method: <span className="text-white font-medium">{w.method}</span></span>
                <span className="text-gray-400">Address: <span className="text-white font-medium truncate max-w-[200px]">{w.address}</span></span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {w.status === "PENDING" ? (
                <>
                  <button
                    onClick={() => approve(w.id)}
                    className="bg-[#00FF9C] text-black px-6 py-2 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(0,255,156,0.3)] transition-all"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => reject(w.id)}
                    className="bg-[#FF4D4F]/10 text-[#FF4D4F] border border-[#FF4D4F]/20 px-6 py-2 rounded-xl font-bold hover:bg-[#FF4D4F] hover:text-white transition-all"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <div className={`px-6 py-2 rounded-xl font-bold border ${w.status === 'APPROVED' ? 'bg-[#00FF9C]/10 text-[#00FF9C] border-[#00FF9C]/20' : 'bg-[#FF4D4F]/10 text-[#FF4D4F] border-[#FF4D4F]/20'}`}>
                  {w.status}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
