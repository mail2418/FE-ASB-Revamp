'use client';

import { useRouter } from 'next/navigation';
import { Users, UserPlus, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';

const AdminUsersTable = dynamic(() => import('@/components/Admin/AdminUsersTable'), {
  ssr: false,
});

export default function SuperAdminPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
              <p className="text-sm text-gray-500 mt-1">
                Kelola akun administrator sistem
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/superadmin/tambah')}
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Tambah Admin
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Super Admin Access</h3>
            <p className="text-sm text-red-700 mt-1">
              Anda memiliki akses penuh untuk mengelola akun administrator. Gunakan dengan bijak.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Admin</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Admin Aktif</p>
              <p className="text-2xl font-bold text-green-600">1</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pengguna</p>
              <p className="text-2xl font-bold text-blue-600">6</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Administrator</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola akun administrator sistem</p>
        </div>
        <AdminUsersTable />
      </div>
    </div>
  );
}
