"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { User as UserIcon, Mail, Shield, Calendar, Hash } from "lucide-react";
import { motion } from "framer-motion";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/admin/users");
      setUsers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function changeRole(userId: string, newRole: string) {
    try {
      await apiFetch("/admin/users/role", {
        method: "POST",
        body: JSON.stringify({ userId, role: newRole })
      });
      load();
    } catch (e: any) { alert(e.message); }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-500 mt-1">Directory of all registered users and their current roles.</p>
      </header>

      <div className="bg-[#121826] border border-white/10 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Email</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Role</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Joined</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-[#00D4FF] transition-all">
                      <Mail size={14} />
                    </div>
                    <span className="font-medium text-sm">{u.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${
                    u.role === 'ADMIN' ? 'bg-[#FF4D4F]/10 text-[#FF4D4F] border-[#FF4D4F]/20' :
                    u.role === 'PROVIDER' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20' :
                    'bg-white/5 text-gray-400 border-white/10'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#00D4FF] cursor-pointer"
                  >
                    <option value="USER">USER</option>
                    <option value="PROVIDER">PROVIDER</option>
                    <option value="ANALYST">ANALYST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
