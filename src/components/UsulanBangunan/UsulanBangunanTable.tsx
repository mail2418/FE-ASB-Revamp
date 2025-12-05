'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ChevronDown, 
  Download,
  Pencil,
  Check,
  X as CloseIcon
} from 'lucide-react';
import type { UsulanBangunanGedung, FilterUsulanBangunan, VerificationStatus } from '@/types/usulan-bangunan';
import { cn } from '@/lib/utils';
import VerificationSequence from './VerificationSequence';

interface UsulanBangunanTableProps {
  data: UsulanBangunanGedung[];
  onFilterChange?: (filters: FilterUsulanBangunan) => void;
  onAddNew?: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'Sukses': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: <Check className="w-3 h-3" />,
    },
    'Tolak': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: <CloseIcon className="w-3 h-3" />,
    },
    'Proses': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: null,
    },
    'Draft': {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: null,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Draft'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.text
      )}
    >
      {config.icon}
      {status}
    </span>
  );
};

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

const NilaiBkfBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'Sudah': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
    'Belum': {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
    },
    'Tolak': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
    },
    'Sedang': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Belum'];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border',
        config.bg,
        config.text,
        config.border
      )}
    >
      {status}
    </span>
  );
};

export default function UsulanBangunanTable({ data, onFilterChange, onAddNew }: UsulanBangunanTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [jenisFilter, setJenisFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingData, setEditingData] = useState<UsulanBangunanGedung[]>(data);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('Usulan Bangunan Gedung 2025');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Available years
  const years = ['2025', '2024', '2023', '2022', '2021'];

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
        jenis: jenisFilter as any,
        status: statusFilter as any,
      });
    }
  };

  const handleJenisFilter = (jenis: string) => {
    setJenisFilter(jenis);
    if (onFilterChange) {
      onFilterChange({ 
        search: searchTerm,
        jenis: jenis as any,
        status: statusFilter as any,
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle verification status change
  const handleVerificationChange = (itemId: string, stage: 'opd' | 'bappeda' | 'bpkad', newStatus: VerificationStatus) => {
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
    router.push(`/usulan/bangunan-gedung/edit/${itemId}/input-komponen-standar-bangunan`);
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

      const response = await fetch(`/api/generate-surat-permohonan?idAsb=${itemId}`, {
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
      link.download = `surat-permohonan-${itemId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading surat permohonan:', error);
      alert(`Gagal mengunduh: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Project Info and Search - Similar to DashboardTable */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">

            {/* Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                className="bg-white/90 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center gap-2"
              >
                Tahun: {selectedYear}
                <ChevronDown className="w-4 h-4" />
              </button>
              {yearDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setYearDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
                        selectedYear === year && 'bg-teal-50 text-teal-700 font-medium'
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Search Bar and Add Button */}
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Cari usulan..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
            {onAddNew && (
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
                Dibuat Oleh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tanggal Dibuat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tanggal Tenggat
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
            {editingData.map((item) => (
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

                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center">
                    {item.createdBy || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.createdDate || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.tenggatDate || '-'}
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
                    onStatusChange={(stage, newStatus) => handleVerificationChange(item.id, stage, newStatus)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.suratRekomendasi ? (
                    <a
                      href={item.suratRekomendasi}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-xs bg-red-100 text-red-600 px-1 rounded">PDF</span>
                    </a>
                  ) : item.status === 'Proses' ? (
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors">
                      Proses
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {/* Edit button for OPD role */}
                    {userRole && userRole === 'opd' && (
                      <button 
                        onClick={() => handleEditClick(item.id)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Edit Komponen"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                    {/* Verify button for verifikator roles */}
                    {userRole && ['verifikator', 'verifikator_opd', 'verifikator_bappeda', 'verifikator_bpkad'].includes(userRole) && (
                      <button 
                        onClick={() => handleVerifyClick(item.id)}
                        className="text-teal-500 hover:text-teal-700 transition-colors p-1 rounded hover:bg-teal-50"
                        title="Verify usulan"
                      >
                        <Pencil className="w-5 h-5" />
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
            Menampilkan <span className="font-medium">{data.length}</span> dari{' '}
            <span className="font-medium">{data.length}</span> hasil
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600">
              1
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}