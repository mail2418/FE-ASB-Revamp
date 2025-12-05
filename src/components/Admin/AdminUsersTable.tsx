'use client'

import { cn } from '@/lib/utils';
import { AdminUser, ROLE_LABELS, ROLE_COLORS } from '@/types/admin';
import { useEffect, useState } from 'react';

interface AdminUsersTableProps {
  users?: AdminUser[];
  className?: string;
}

const RoleBadge = ({ role }: { role: string }) => {
  const roleKey = role as keyof typeof ROLE_COLORS;
  
  return (
    <div
      className={cn(
        'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border',
        ROLE_COLORS[roleKey] || 'bg-gray-100 text-gray-800 border-gray-200'
      )}
    >
      {ROLE_LABELS[roleKey] || role}
    </div>
  );
};

export default function AdminUsersTable({ users: propUsers, className }: AdminUsersTableProps) {
  const [users, setUsers] = useState<AdminUser[]>(propUsers || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If users are provided as props, use them
    if (propUsers) {
      setUsers(propUsers);
      return;
    }

    // Otherwise, fetch from API
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setError('Token tidak ditemukan');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/superadmin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data pengguna');
        }

        const data = await response.json();
        console.log('Fetched users data:', data);
        
        // Handle different response structures
        setUsers(data.data?.data || data.data || data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Gagal memuat data pengguna');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [propUsers]);

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <h3 className="text-white font-semibold text-lg">Daftar Pengguna</h3>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      Tidak ada data pengguna
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-700">
              Total: <span className="font-medium">{users.length}</span> pengguna
            </p>
          </div>
        </>
      )}
    </div>
  );
}
