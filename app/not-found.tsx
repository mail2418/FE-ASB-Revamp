import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-teal-50">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-9xl font-bold text-orange-500 opacity-80">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Halaman Tidak Ditemukan</h2>
        <p className="mt-2 text-lg text-gray-600">
          Maaf, halaman yang Anda cari tidak dapat ditemukan.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Kembali ke Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}