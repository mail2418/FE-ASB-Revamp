'use client';

import { useRouter, useParams } from 'next/navigation';

// Placeholder verify page for jalan
export default function VerifySaluranPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Verifikasi Usulan Saluran</h1>
        <p className="text-gray-600 mb-4">ID: {id}</p>
        <p className="text-gray-500 text-sm">Halaman ini dalam pengembangan.</p>
        <button 
          onClick={() => router.push('/usulan/saluran')}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
