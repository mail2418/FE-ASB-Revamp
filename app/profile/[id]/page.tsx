'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProfilePage from '@/components/Profile/ProfilePage';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get current user data from cookie
    if (typeof window !== 'undefined') {
      const userDataCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('userData='));

      if (!userDataCookie) {
        // Not logged in, redirect to login
        router.push('/');
        return;
      }

      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setCurrentUserId(userData.id);
        setUserRole(userData.role);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        router.push('/');
      }
    }
  }, [router]);

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfilePage
      userId={params.id as string}
      currentUserId={currentUserId}
      isAdmin={userRole === 'admin' || userRole === 'superadmin'}
    />
  );
}
