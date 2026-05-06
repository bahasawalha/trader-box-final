"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Clock, ShieldCheck, Wallet as WalletIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      const b = await apiFetch("/wallet/balance");
      const t = await apiFetch("/wallet/transactions");

      setBalance(b.balance);
      setTransactions(t);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit(amount: number) {
    await apiFetch("/deposit", {
      method: "POST",
      body: JSON.stringify({ amount, method: "USDT_TRC20", reference: "Frontend Deposit" })
    });
    loadWallet();
    setShowDeposit(false);
  }

  async function handleWithdraw(amount: number, address: string) {
    await apiFetch("/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount, method: "USDT_TRC20", address })
    });
    loadWallet();
    setShowWithdraw(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00D4FF]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 space-y-10 pb-32 max-w-5xl mx-auto">

      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Financial Hub</h1>
        <p className="text-gray-400">Manage your assets and monitor your ledger entries.</p>
      </header>

      {/* 💰 Balance */}
      <BalanceCard balance={balance} />

      {/* 🔘 Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowDeposit(true)}
          className="flex-1 bg-[#00FF9C] text-black px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
        >
          <ArrowDownLeft size={20} /> Deposit
        </button>

        <button
          onClick={() => setShowWithdraw(true)}
          className="flex-1 bg-[#FF4D4F] text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
        >
          <ArrowUpRight size={20} /> Withdraw
        </button>
      </div>

      {/* 📊 Transactions */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="text-[#00D4FF]" size={20} /> Recent Ledger Entries
          </h2>
          <button className="text-[#00D4FF] text-sm font-bold hover:underline">Download Report</button>
        </div>

        <div className="space-y-3">
          {transactions.map((t) => (
            <TransactionRow key={t.id} tx={t} />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDeposit && (
          <DepositModal 
            onClose={() => setShowDeposit(false)} 
            onDeposit={handleDeposit} 
          />
        )}
        {showWithdraw && (
          <WithdrawModal 
            onClose={() => setShowWithdraw(false)} 
            onWithdraw={handleWithdraw} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

// 💰 2. Balance Card (Premium)
function BalanceCard({ balance }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-3xl shadow-[0_0_50px_rgba(0,212,255,0.15)] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <WalletIcon size={120} className="text-[#00D4FF]" />
      </div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-gray-400 uppercase tracking-widest text-xs font-bold">
          <ShieldCheck size={14} className="text-[#00FF9C]" /> Secure Asset Storage
        </div>

        <div className="space-y-1">
          <p className="text-gray-500 text-sm">Available Balance</p>
          <h1 className="text-6xl font-bold font-mono">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h1>
        </div>
      </div>
    </motion.div>
  );
}

// 📊 3. Transaction Row
function TransactionRow({ tx }: any) {
  const isPositive = tx.amount > 0;
  const isPending = tx.status === "PENDING";

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:bg-white/[0.08] transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${isPositive ? 'bg-[#00FF9C]/10 text-[#00FF9C]' : 'bg-[#FF4D4F]/10 text-[#FF4D4F]'}`}>
          {isPositive ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
        </div>
        <div>
          <p className="font-bold group-hover:text-[#00D4FF] transition-colors">{tx.type.replace('_', ' ')}</p>
          <p className="text-xs text-gray-500">{tx.date}</p>
        </div>
      </div>

      <div className="text-right space-y-1">
        <div
          className={`text-lg font-bold font-mono ${
            isPositive ? "text-[#00FF9C]" : "text-[#FF4D4F]"
          }`}
        >
          {isPositive ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
        </div>
        {isPending && (
          <span className="bg-yellow-500/10 text-yellow-400 text-[10px] px-2 py-0.5 rounded-lg border border-yellow-500/20 font-bold uppercase tracking-wider">
            Pending
          </span>
        )}
      </div>
    </motion.div>
  );
}

// 📥 4. Deposit Modal
function DepositModal({ onClose, onDeposit }: any) {
  const [amount, setAmount] = useState("");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#121826] border border-white/10 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Add Funds</h2>
          <p className="text-sm text-gray-400">
            Securely deposit USDT (TRC20) or use your Binance ID to fund your wallet.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-[#00D4FF] outline-none transition-all font-mono text-xl text-white"
            />
          </div>

          <div className="p-4 bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-[#00D4FF] uppercase tracking-widest">Selected Method</p>
            <p className="text-sm font-semibold text-white">Binance Pay / USDT-TRC20</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button 
            onClick={() => onDeposit(Number(amount))}
            className="w-full bg-[#00D4FF] text-black py-4 rounded-2xl font-bold hover:glow-border transition-all"
          >
            Continue to Payment
          </button>
          <button onClick={onClose} className="w-full text-sm text-gray-500 font-bold hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 📤 5. Withdraw Modal
function WithdrawModal({ onClose, onWithdraw }: any) {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#121826] border border-white/10 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#FF4D4F]">Withdraw Funds</h2>
          <p className="text-sm text-gray-400 text-white/60">
            Minimum withdrawal is <span className="text-white font-bold">$100</span>. Processing takes up to 24 hours.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF4D4F] outline-none transition-all font-mono text-xl text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Withdrawal Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your USDT TRC20 Address or ID"
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF4D4F] outline-none transition-all text-sm text-white"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button 
            onClick={() => onWithdraw(Number(amount), address)}
            className="w-full bg-[#FF4D4F] text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-[#FF4D4F]/20"
          >
            Confirm Withdrawal
          </button>
          <button onClick={onClose} className="w-full text-sm text-gray-500 font-bold hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
