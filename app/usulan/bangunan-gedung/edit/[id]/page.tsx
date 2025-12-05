'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

// Redirect to the edit standard components page
export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    // Redirect to standard components edit page
    router.replace(`/usulan/bangunan-gedung/edit/${id}/input-komponen-standar-bangunan`);
  }, [router, id]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      <span className="ml-2 text-gray-600">Memuat...</span>
    </div>
  );
}
