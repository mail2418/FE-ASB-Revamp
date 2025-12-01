'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AddAdminForm from '@/components/SuperAdmin/AddAdminForm';
import { ArrowLeft, Shield } from 'lucide-react';

export default function TambahAdminPage() {
  const router = useRouter();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check if user is superadmin
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const userDataCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('userData='));
        
        if (userDataCookie) {
          const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
          setUserRole(userData.role);
          
          // Redirect if not superadmin
          if (userData.role !== 'superadmin') {
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

  if (userRole !== 'superadmin') {
    return null; // Will redirect
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <button
          onClick={() => router.push('/superadmin')}
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Kembali</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Admin Baru</h1>
            <p className="mt-1 text-sm text-gray-500">
              Buat akun administrator baru untuk sistem
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <AddAdminForm />
      </div>
    </div>
  );
}
