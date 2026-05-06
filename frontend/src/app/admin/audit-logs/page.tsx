"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Shield, Clock, Globe, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/admin/audit-logs");
      setLogs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="text-gray-500 font-mono">Retrieving secure logs...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">System Audit Trail</h1>
        <p className="text-gray-500 mt-1">Immutable record of all administrative actions and security events.</p>
      </header>

      <div className="bg-[#121826] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Admin</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Details</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">IP Address</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-[#00D4FF]">{log.admin?.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-mono border border-white/10">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400 max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Globe size={12} /> {log.ip}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} /> {new Date(log.createdAt).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
