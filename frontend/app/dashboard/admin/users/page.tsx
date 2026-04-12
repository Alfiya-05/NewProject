'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    api.get('/admin/users')
      .then((r) => setUsers(r.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const verify = async (id: string) => {
    await api.patch(`/admin/users/${id}/verify`);
    fetchUsers();
  };

  const changeRole = async (id: string, role: string) => {
    await api.patch(`/admin/users/${id}/role`, { role });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B3A6B]">User Management</h1>

      {loading ? (
        <p className="text-[#888]">Loading users...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#D9D5C7] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F3EE] border-b border-[#D9D5C7]">
              <tr>
                {['Name', 'Email', 'Role', 'System UID', 'Verified', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[#555] font-medium text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-[#F4F3EE] hover:bg-[#F8F7F2]">
                  <td className="px-4 py-3 font-medium">{u.profile.name}</td>
                  <td className="px-4 py-3 text-[#555]">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      className="text-xs border border-[#D9D5C7] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
                    >
                      {['citizen', 'lawyer', 'judge', 'admin'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#888] text-xs font-mono">{u.systemUid}</td>
                  <td className="px-4 py-3">
                    {u.isVerified ? (
                      <span className="badge-active flex items-center gap-1 w-fit">
                        <CheckCircle className="h-3 w-3" />Verified
                      </span>
                    ) : (
                      <span className="badge-pending">Unverified</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!u.isVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-[#2D6A4F] text-[#2D6A4F]"
                        onClick={() => verify(u._id)}
                      >
                        <Shield className="h-3 w-3 mr-1" />Verify
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
