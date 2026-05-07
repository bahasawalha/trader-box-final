"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus, 
  Minus, 
  CreditCard, 
  ShieldCheck, 
  Clock
} from "lucide-react";

export default function WalletPage() {
  const { t, isRTL } = useLanguage();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [b, t] = await Promise.all([
        apiFetch("/wallet/balance"),
        apiFetch("/wallet/transactions")
      ]);
      setBalance(b.balance);
      setTransactions(t);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDeposit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const amount = parseFloat(data.amount as string);

    if (amount <= 0) {
      alert(isRTL ? "يرجى إدخال مبلغ صحيح أكبر من صفر." : "Please enter a valid amount greater than zero.");
      return;
    }

    try {
      await apiFetch("/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({ ...data, amount, method: "BINANCE_USDT" })
      });
      alert(isRTL ? "تم إرسال الطلب بنجاح، بانتظار المراجعة." : "Request submitted successfully, pending audit.");
      setShowDeposit(false);
    } catch (e: any) { alert(e.message); }
  }

  async function handleWithdraw(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      await apiFetch("/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ ...data, method: "TRC20" })
      });
      alert(isRTL ? "تم تسجيل طلب السحب بنجاح." : "Withdrawal request recorded successfully.");
      setShowWithdraw(false);
      loadData(); // Refresh balance
    } catch (e: any) { alert(e.message); }
  }

  if (loading) return <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white font-mono uppercase tracking-widest animate-pulse">{t.loading}</div>;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.financial_terminal}</h1>
            <p className="text-gray-500 mt-1">{t.liquidity_desc}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowDeposit(true)}
              className="px-6 py-3 rounded-2xl bg-[#00D4FF] text-black font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
            >
              <Plus size={18} /> {t.deposit}
            </button>
            <button 
              onClick={() => setShowWithdraw(true)}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
            >
              <Minus size={18} /> {t.withdraw}
            </button>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-[#121826] to-[#0B0F1A] border border-white/10 rounded-[40px] p-10 overflow-hidden group shadow-2xl"
        >
          <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-12 opacity-5 group-hover:opacity-10 transition-opacity`}>
            <CreditCard size={240} />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
                <Wallet size={20} />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.available_liquidity}</span>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-400 mb-1 font-mono uppercase tracking-widest">{t.global_balance}</div>
              <div className="text-6xl md:text-7xl font-bold tracking-tighter text-[#00D4FF]">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-8 h-8 rounded-full bg-green-400/10 flex items-center justify-center"><ArrowUpRight size={14} className={isRTL ? 'rotate-180' : ''} /></div>
                <div className="text-xs font-bold uppercase tracking-widest">{t.ledger_verified}</div>
              </div>
              <div className="flex items-center gap-2 text-[#00D4FF]">
                <div className="w-8 h-8 rounded-full bg-[#00D4FF]/10 flex items-center justify-center"><ShieldCheck size={14} /></div>
                <div className="text-xs font-bold uppercase tracking-widest">{t.secured_node}</div>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <History className="text-gray-500" size={24} />
            <h2 className="text-xl font-bold">{t.audit_history}</h2>
          </div>

          <div className="bg-[#121826] border border-white/5 rounded-[32px] overflow-hidden shadow-xl overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.operation}</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.date_time}</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right rtl:text-left">{t.amount}</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right rtl:text-left">{t.running_balance}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                          {tx.amount > 0 ? <ArrowDownLeft size={16} className={isRTL ? 'rotate-180' : ''} /> : <ArrowUpRight size={16} className={isRTL ? 'rotate-180' : ''} />}
                        </div>
                        <span className="font-bold text-sm">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs text-gray-500 font-mono">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className={`px-8 py-5 text-right rtl:text-left font-bold text-sm ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}$
                    </td>
                    <td className="px-8 py-5 text-right rtl:text-left font-mono text-xs text-gray-400">
                      ${tx.balanceAfter.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="p-20 text-center text-gray-600 font-mono text-xs uppercase tracking-[0.2em]">
                {t.no_tx}
              </div>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showDeposit && (
          <Modal title={t.deposit} close={() => setShowDeposit(false)}>
             <form onSubmit={handleDeposit} className="space-y-6">
                <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/20 p-4 rounded-2xl flex items-center gap-4">
                  <CreditCard className="text-[#00D4FF]" />
                  <p className="text-xs text-gray-400">{isRTL ? 'يرجى إرسال USDT إلى العنوان أدناه ثم إدخال المبلغ ومعرف العملية.' : 'Please send USDT to the address below, then enter the amount and transaction ID.'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'عنوان المحفظة (TRC20)' : 'TRC20 Wallet Address'}</label>
                  <div className="p-4 bg-black/40 border border-white/10 rounded-2xl font-mono text-sm break-all text-[#00D4FF]">
                    TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'المبلغ (USDT)' : 'Amount (USDT)'}</label>
                    <input name="amount" type="number" min="1" step="any" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D4FF]" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'معرف العملية (Binance ID / TxID)' : 'Transaction ID / Binance ID'}</label>
                    <input name="reference" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D4FF]" placeholder="Ex: 5829103..." />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 rounded-2xl bg-[#00D4FF] text-black font-bold hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all">{isRTL ? 'تأكيد الإرسال' : 'Confirm Submission'}</button>
             </form>
          </Modal>
        )}

        {showWithdraw && (
          <Modal title={t.withdraw} close={() => setShowWithdraw(false)}>
             <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center gap-4">
                  <ArrowUpRight className="text-orange-500" />
                  <p className="text-xs text-gray-400">{isRTL ? 'الحد الأدنى للسحب هو 100$. سيتم خصم المبلغ من رصيدك فوراً.' : 'Minimum withdrawal is $100. Amount will be deducted immediately.'}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'المبلغ المراد سحبه' : 'Amount to Withdraw'}</label>
                    <input name="amount" type="number" min="100" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D4FF]" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isRTL ? 'عنوان محفظة USDT (TRC20)' : 'USDT Wallet Address (TRC20)'}</label>
                    <input name="address" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D4FF]" placeholder="TXXXX..." />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all">{isRTL ? 'طلب سحب' : 'Request Withdrawal'}</button>
             </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, title, close }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121826] border border-white/10 w-full max-w-lg rounded-[40px] p-10 relative z-10 shadow-3xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={close} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">✕</button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
