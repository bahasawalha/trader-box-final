"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { CheckCircle, XCircle, Clock, User, ShieldAlert, FileText, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoleRequest {
  id: string;
  userId: string;
  requestedRole: string;
  status: string;
  reason: string | null;
  adminNote: string | null;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
  };
}

export default function AdminRoleRequests() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState("");

  const fetchRequests = async () => {
    try {
      const data = await apiFetch("/admin/role-requests");
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const resolveRequest = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    setResolvingId(requestId);
    try {
      await apiFetch("/admin/role-requests/resolve", {
        method: "POST",
        body: JSON.stringify({
          requestId,
          status,
          adminNote: adminNotes[requestId] || ""
        })
      });
      
      setSuccessMsg(status === "APPROVED" ? "User upgraded successfully!" : "Request rejected.");
      setTimeout(() => setSuccessMsg(""), 3000);
      
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Applications...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-black px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl"
          >
            <CheckCircle2 size={16} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#121826]/50 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-purple-500/10 rounded-[24px] flex items-center justify-center text-purple-400 shadow-inner">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Role Upgrade Requests</h1>
            <p className="text-gray-500 text-sm font-medium">Verify credentials for Provider and Analyst status applications</p>
          </div>
        </div>
        <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{requests.filter(r => r.status === 'PENDING').length} Pending Requests</span>
        </div>
      </div>

      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="bg-[#121826] border border-dashed border-white/10 p-32 rounded-[50px] text-center space-y-4">
             <div className="w-20 h-20 bg-white/5 rounded-full mx-auto flex items-center justify-center text-gray-700">
                <Clock size={40} />
             </div>
             <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No pending applications found in the ledger</p>
          </div>
        ) : (
          requests.map((req) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={req.id} 
              className={`bg-[#121826] border border-white/5 p-8 md:p-10 rounded-[50px] flex flex-col lg:flex-row gap-10 items-start lg:items-center transition-all hover:border-purple-500/30 group relative overflow-hidden ${req.status !== 'PENDING' ? 'opacity-60' : ''}`}
            >
              {/* Status Indicator */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                req.status === 'PENDING' ? 'bg-yellow-500' : req.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
              }`} />

              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform"><User size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-white">{req.user.name || "Anonymous User"}</h3>
                    <p className="text-gray-500 text-sm font-mono">{req.user.email}</p>
                  </div>
                  <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                    req.requestedRole === 'PROVIDER' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    Requesting: {req.requestedRole}
                  </div>
                </div>

                {req.reason && (
                  <div className="bg-black/30 p-6 rounded-[30px] border border-white/5 space-y-2">
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                       <FileText size={12} /> Applicant Justification
                    </div>
                    <p className="text-gray-400 text-sm italic leading-relaxed">"{req.reason}"</p>
                  </div>
                )}

                <div className="flex items-center gap-8 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Clock size={14} className="text-purple-500" /> {new Date(req.createdAt).toLocaleString()}</span>
                  <div className={`flex items-center gap-2 ${
                    req.status === 'PENDING' ? 'text-yellow-500' : req.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      req.status === 'PENDING' ? 'bg-yellow-500 animate-pulse' : req.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {req.status}
                  </div>
                </div>
              </div>

              {req.status === 'PENDING' ? (
                <div className="w-full lg:w-72 space-y-4 shrink-0 bg-black/20 p-6 rounded-[40px] border border-white/5">
                  <textarea 
                    placeholder="Admin decision note..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-purple-500 outline-none transition-all resize-none min-h-[100px]"
                    value={adminNotes[req.id] || ""}
                    onChange={(e) => setAdminNotes({...adminNotes, [req.id]: e.target.value})}
                  />
                  <div className="flex flex-col gap-3">
                    <button 
                      disabled={resolvingId === req.id}
                      onClick={() => resolveRequest(req.id, "APPROVED")}
                      className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_10px_30px_rgba(34,197,94,0.2)]"
                    >
                      {resolvingId === req.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} 
                      Approve Upgrade
                    </button>
                    <button 
                      disabled={resolvingId === req.id}
                      onClick={() => resolveRequest(req.id, "REJECTED")}
                      className="w-full bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-500/30 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <XCircle size={18} /> Reject Application
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full lg:w-72 p-6 rounded-[40px] bg-white/[0.02] border border-white/5 text-center lg:text-right space-y-2">
                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em]">Decision Protocol Recorded</p>
                  <p className="text-gray-400 text-sm font-medium italic">
                    {req.adminNote ? `"${req.adminNote}"` : "Resolution executed without additional notes."}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
