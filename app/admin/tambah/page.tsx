'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import AddUserForm from '@/components/Admin/AddUserForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TambahAkunPage() {
  const router = useRouter();
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

  if (userRole !== 'admin') {
    return null; // Will redirect
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Akun Baru</h1>
        <p className="mt-1 text-sm text-gray-500">
          Buat akun pengguna baru untuk sistem
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <AddUserForm />
      </div>
    </div>
  );
}
