'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Check,
  X as CloseIcon,
  AlertCircle,
  ClipboardCheck,
  Clock
} from 'lucide-react';
import type { UsulanBangunanGedung, FilterUsulanBangunan, VerificationStatus } from '@/types/usulan-bangunan';
import { cn } from '@/lib/utils';
import VerificationSequence from './VerificationSequence';

interface UsulanBangunanTableProps {
  data: UsulanBangunanGedung[];
  onFilterChange?: (filters: FilterUsulanBangunan) => void;
  onAddNew?: () => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  isLoading?: boolean;
}

const JenisBadge = ({ jenis }: { jenis: string }) => {
  const jenisConfig = {
    'Pembangunan': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    'Pemeliharaan': {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
  };

  const config = jenisConfig[jenis as keyof typeof jenisConfig] || jenisConfig['Pembangunan'];

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-block w-2 h-2 rounded-full',
          jenis === 'Pembangunan' ? 'bg-green-500' : 'bg-orange-500'
        )}
      />
      <span className={cn('text-sm', config.text)}>{jenis}</span>
    </div>
  );
};

export default function UsulanBangunanTable({ 
  data, 
  onFilterChange, 
  onAddNew,
  onPageChange,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  totalItems: externalTotalItems,
}: UsulanBangunanTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingData, setEditingData] = useState<UsulanBangunanGedung[]>(data);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [showRejectReasonModal, setShowRejectReasonModal] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Use external pagination if provided (server-side), otherwise use internal (client-side)
  const isServerPagination = !!onPageChange;
  const currentPage = isServerPagination ? (externalCurrentPage || 1) : internalCurrentPage;
  const setCurrentPage = isServerPagination 
    ? (page: number | ((prev: number) => number)) => {
        const newPage = typeof page === 'function' ? page(currentPage) : page;
        onPageChange?.(newPage);
      }
    : setInternalCurrentPage;

  // Calculate pagination - use server values if provided, otherwise calculate client-side
  const totalPages = isServerPagination 
    ? (externalTotalPages || 1) 
    : Math.ceil(editingData.length / itemsPerPage);
  const totalItems = isServerPagination 
    ? (externalTotalItems || 0) 
    : editingData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // For server-side pagination, use all data (already paginated); for client-side, slice
  const paginatedData = isServerPagination ? editingData : editingData.slice(startIndex, endIndex);

  // Get user role from cookie
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='));
      
      if (userDataCookie) {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
        setUserRole(userData.role);
      }
    }
  }, []);

  // Update local data when props change
  React.useEffect(() => {
    setEditingData(data);
  }, [data]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onFilterChange) {
      onFilterChange({ 
        search: value,
      });
    }
  };

  // Handle verification status change
  const handleVerificationChange = (itemId: string, stage: 'adbang' | 'bappeda' | 'bpkad', newStatus: VerificationStatus) => {
    setEditingData(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              verificationStatus: {
                ...item.verificationStatus,
                [stage]: newStatus
              }
            }
          : item
      )
    );
    // In production, this would also call an API to update the backend
  };

  // Handle verify button click
  const handleVerifyClick = (itemId: string) => {
    router.push(`/usulan/bangunan-gedung/verify/${itemId}`);
  };

  // Handle edit button click (for OPD role)
  const handleEditClick = (itemId: string) => {
    router.push(`/usulan/bangunan-gedung/edit/${itemId}`);
  };

  // Handle download Surat Permohonan
  const handleDownloadSuratPermohonan = async (itemId: string) => {
    setDownloadingId(itemId);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }

      const response = await fetch(`/api/usulan/bangunan-gedung/document/download-surat-permohonan?idAsb=${itemId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try to parse error as JSON if it's not a PDF
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Gagal mengunduh dokumen');
        }
        throw new Error(`Gagal mengunduh dokumen: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      // If response is PDF directly (blob)
      if (contentType?.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `surat-permohonan-${itemId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // If response is JSON with base64 encoded PDF
        const data = await response.json();
        
        // Check for base64 encoded PDF data
        if (data.data?.pdf || data.data?.file || data.data?.content || data.pdf || data.file) {
          const base64Data = data.data?.pdf || data.data?.file || data.data?.content || data.pdf || data.file;
          
          // Decode base64 to binary
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Create blob and download
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `surat-permohonan-${itemId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else if (data.data?.url || data.url) {
          // If it's a URL, open it
          window.open(data.data?.url || data.url, '_blank');
        } else {
          console.error('Unknown PDF response format:', data);
          alert('Format respons tidak dikenali');
        }
      }
      
    } catch (error) {
      console.error('Error downloading surat permohonan:', error);
      alert(`Gagal mengunduh: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle download Surat Rekomendasi
  const handleDownloadSuratRekomendasi = async (itemId: string) => {
    setDownloadingId(itemId);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }

      const response = await fetch(`/api/usulan/bangunan-gedung/document/download-surat-rekomendasi?idAsb=${itemId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try to parse error as JSON if it's not a PDF
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Gagal mengunduh dokumen');
        }
        throw new Error(`Gagal mengunduh dokumen: ${response.statusText}`);
      }

      // Get the PDF as blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `surat-rekomendasi-${itemId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading surat rekomendasi:', error);
      alert(`Gagal mengunduh: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Project Info and Search - Similar to DashboardTable */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search Bar and Add Button */}
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Cari Uraian..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
            {userRole === 'admin' || userRole === 'opd' && onAddNew && (
              <button
                onClick={onAddNew}
                className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                + Tambah Usulan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-50/50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Jenis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Uraian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Lokasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Info Status
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Dibuat Oleh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tanggal Dibuat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Surat Permohonan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status Verifikasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Surat Rekomendasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <JenisBadge jenis={item.jenis} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{item.uraian}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{item.lokasi}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 max-w-[200px]" title={item.statusInfo}>
                    {item.statusInfo || '-'}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center">
                    {item.createdBy || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.createdDate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDownloadSuratPermohonan(item.id)}
                    disabled={downloadingId === item.id}
                    className=" cursor-pointer inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingId === item.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                        <span className="text-xs">Loading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="text-xs bg-red-100 text-red-600 px-1 rounded">PDF</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <VerificationSequence
                    verificationStatus={item.verificationStatus}
                    userRole={userRole}
                    usulanId={item.id}
                    idAsbStatus={item.idAsbStatus}
                    onStatusChange={(stage, newStatus) => handleVerificationChange(item.id, stage, newStatus)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* Surat Rekomendasi - Only visible when all 3 verifikators have approved and idAsbStatus is 8 */}
                  {item.idAsbStatus === 8 && 
                   item.idVerifikatorAdpem !== null && 
                   item.idVerifikatorBappeda !== null && 
                   item.idVerifikatorBpkad !== null ? (
                    <button
                      onClick={() => handleDownloadSuratRekomendasi(item.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-xs bg-red-100 text-red-600 px-1 rounded">PDF</span>
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400" title="Menunggu verifikasi dari semua verifikator">
                      -
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {/* Green checkmark when idAsbStatus is 8 (fully verified) - shown to all roles */}
                    {item.idAsbStatus === 8 && (
                      <div 
                        className="text-green-500 p-1 rounded bg-green-50"
                        title="Usulan telah disetujui"
                      >
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                    {/* Edit button for OPD/admin/superadmin role - hidden when status is rejected (7), pending verification (6), or approved (8) */}
                    {userRole && (userRole === 'opd' || userRole === 'admin' || userRole === 'superadmin') && item.idAsbStatus !== undefined && item.idAsbStatus < 6 && (
                      <button 
                        onClick={() => handleEditClick(item.id)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Edit Komponen"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                    {/* Waiting icon for OPD/admin when idAsbStatus is 6 */}
                    {userRole && (userRole === 'opd' || userRole === 'admin' || userRole === 'superadmin') && item.idAsbStatus !== undefined && item.idAsbStatus >= 6 && item.idAsbStatus !== 7 && item.idAsbStatus !== 8 && (
                      <div 
                        className="text-yellow-500 p-1 rounded bg-yellow-50"
                        title="Menunggu verifikasi"
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                    )}
                    {/* Verify button for verifikator roles - only shown when idAsbStatus >= 6 AND NOT 7 or 8 */}
                    {userRole && ['verifikator', 'verifikator_adbang', 'verifikator_bappeda', 'verifikator_bpkad'].includes(userRole) && 
                     item.idAsbStatus !== undefined && 
                     item.idAsbStatus >= 6 && 
                     item.idAsbStatus !== 7 && 
                     item.idAsbStatus !== 8 && (
                      <button 
                        onClick={() => handleVerifyClick(item.id)}
                        className="text-teal-500 hover:text-teal-700 transition-colors p-1 rounded hover:bg-teal-50"
                        title="Verify usulan"
                      >
                        <ClipboardCheck className="w-5 h-5" />
                      </button>
                    )}
                    {/* Message for verifikator when status < 6 */}
                    {userRole && ['verifikator', 'verifikator_adbang', 'verifikator_bappeda', 'verifikator_bpkad'].includes(userRole) && 
                     (item.idAsbStatus === undefined || item.idAsbStatus < 6) && (
                      <div 
                        className="text-gray-400 p-1 rounded bg-gray-50"
                        title="Belum dapat diverifikasi"
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                    )}
                    {/* Rejection reason icon - shown when status is rejected (idAsbStatus === 7) */}
                    {item.idAsbStatus === 7 && (
                      <button
                        onClick={() => {
                          setSelectedRejectReason(item.rejectReason || 'Tidak ada alasan yang diberikan');
                          setShowRejectReasonModal(true);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                        title="Lihat alasan penolakan"
                      >
                        <AlertCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{totalItems > 0 ? startIndex + 1 : 0}</span> - <span className="font-medium">{Math.min(endIndex, totalItems)}</span> dari{' '}
            <span className="font-medium">{totalItems}</span> hasil
          </p>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-teal-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Alasan Penolakan
              </h3>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                {selectedRejectReason}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowRejectReasonModal(false);
                  setSelectedRejectReason(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}