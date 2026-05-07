"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowUpRight, 
  CreditCard, 
  History,
  TrendingUp,
  DollarSign
} from "lucide-react";

export default function ProviderEarnings() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await apiFetch("/wallet/balance");
      const tx = await apiFetch("/wallet/transactions");
      setBalance(data.balance);
      setHistory(tx);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Earnings Terminal</h1>
        <p className="text-gray-500 mt-1">Real-time revenue tracking and liquidation node.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <motion.div 
           whileHover={{ y: -5 }}
           className="bg-gradient-to-br from-[#121826] to-[#0B0F1A] border border-white/10 p-8 rounded-[40px] relative overflow-hidden group shadow-2xl"
         >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign size={120} />
           </div>
           <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#00FF9C]/10 flex items-center justify-center text-[#00FF9C]">
                <Wallet size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Available Rewards</div>
                <div className="text-4xl font-bold text-[#00FF9C] font-mono">${balance.toLocaleString()}</div>
              </div>
           </div>
         </motion.div>

         <StatMini label="Total Revenue" value="$42,800" color="text-white" />
         <StatMini label="Monthly Projection" value="+$5,200" color="text-[#00D4FF]" />
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="text-gray-500" size={24} />
          <h2 className="text-xl font-bold">Payout Ledger</h2>
        </div>

        <div className="bg-[#121826] border border-white/5 rounded-[32px] overflow-hidden shadow-xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Event</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center"><ArrowUpRight size={14} /></div>
                      <span className="font-bold text-sm">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs text-gray-500 font-mono">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-sm text-[#00FF9C]">
                    +${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="p-20 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">
              No financial mutations recorded.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatMini({ label, value, color }: any) {
  return (
    <div className="bg-[#121826] border border-white/5 p-8 rounded-[40px] flex flex-col justify-center">
       <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</div>
       <div className={`text-3xl font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}
