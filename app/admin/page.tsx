'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminUsersTable from '@/components/Admin/AdminUsersTable';
import { userService } from '@/lib/user-service';
import { AdminUser } from '@/types/admin';
import { UserPlus } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check if user is admin
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const userDataCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('userData='));
        
        if (userDataCookie) {
          const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
          setUserRole(userData.role);
          
          // Redirect if not admin
          if (userData.role !== 'admin') {
            router.push('/dashboard');
            return;
          }
        } else {
          // No auth, redirect to login
          router.push('/');
          return;
        }
      }
    };

    checkAuth();
  }, [router]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const fetchedUsers = await userService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  if (userRole !== 'admin') {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola akun pengguna sistem
          </p>
        </div>
        <Link
          href="/admin/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm"
        >
          <UserPlus className="h-5 w-5" />
          Tambah Akun
        </Link>
      </div>

      {/* Users Table */}
      <AdminUsersTable users={users} />
    </div>
  );
}
