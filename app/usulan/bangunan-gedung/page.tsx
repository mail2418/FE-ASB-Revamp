'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Building2, TrendingUp, FileText, CheckCircle } from 'lucide-react';
import type { UsulanBangunanGedung, FilterUsulanBangunan } from '@/types/usulan-bangunan';

// Dynamic imports for better performance
const BarChart = dynamic(() => import('@/components/Charts/BarChart'), {
  ssr: false,
  loading: () => <div className="h-[250px] bg-gray-100 animate-pulse rounded-lg" />,
});
const DonutChart = dynamic(() => import('@/components/Charts/DonutChart'), {
  ssr: false,
  loading: () => <div className="h-[180px] bg-gray-100 animate-pulse rounded-lg" />,
});
const UsulanBangunanTable = dynamic(() => import('@/components/UsulanBangunan/UsulanBangunanTable'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />,
});

// Interface for API response
interface APIUsulanBangunan {
  id: number;
  idAsbJenis: number;
  idAsbStatus: number;
  idOpd: number;
  idAsbTipeBangunan: number;
  idRekening: number | null;
  idRekeningReview: number | null;
  idKabkota: number;
  idAsbKlasifikasi: number | null;
  idVerifikatorAdpem: number | null;
  idVerifikatorBappeda: number | null;
  idVerifikatorBpkad: number | null;
  tahunAnggaran: number;
  namaAsb: string;
  alamat: string;
  jumlahKontraktor: number;
  totalLantai: number;
  rejectReason: string | null;
  shst: number | null;
  luasTotalBangunan: number | null;
  totalBiayaPembangunan: number | null;
  kabkota: {
    id: number;
    kode: string;
    nama: string;
  };
  asbStatus: {
    id: number;
    status: string;
  };
  asbJenis: {
    id: number;
    jenis: string;
    asb: string;
  };
  opd: {
    id: number;
    opd: string;
    alias: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Status ID to status name mapping (based on sequence)
const STATUS_ID_MAP: { [key: number]: string } = {
  1: 'General Documents',
  2: 'Luas Total Bangunan (LTB), Koefesien Luas Bangunan (KLB) dan Koefesien Fungsi Bangunan (KFB)',
  3: 'Kebutuhan Biaya Pekerjaan Standar (BPS)',
  4: 'Kebutuhan Biaya Pekerjaan Non Standar (BPNS)',
  5: 'Setup Rekening',
  6: 'Proses Verifikasi',
  7: 'Tidak Memenuhi Syarat',
  8: 'Memenuhi Syarat',
  9: 'Verifikasi Luas Total Bangunan (LTB), Koefesien Luas Bangunan (KLB) dan Koefesien Fungsi Bangunan (KFB)',
  10: 'Verifikasi Kebutuhan Biaya Pekerjaan Standart (BPS)',
  11: 'Verifikasi Kebutuhan Biaya Pekerjaan Non Standar (BPNS)',
  12: 'Verifikasi Rekening Belanja',
  13: 'Verifikasi Biaya Pekerjaan',
};

// Get status name from ID
const getStatusNameById = (id: number): string => {
  return STATUS_ID_MAP[id] || 'Unknown';
};

// Map API status to display status for table/charts
const mapStatus = (asbStatus: { id: number; status: string }): string => {
  // Map status to simplified display categories
  const statusDisplayMap: { [key: string]: string } = {
    'General Documents': 'Proses',
    'Luas Total Bangunan (LTB), Koefesien Luas Bangunan (KLB) dan Koefesien Fungsi Bangunan (KFB)': 'Proses',
    'Kebutuhan Biaya Pekerjaan Standar (BPS)': 'Proses',
    'Kebutuhan Biaya Pekerjaan Non Standar (BPNS)': 'Proses',
    'Setup Rekening': 'Proses',
    'Proses Verifikasi': 'Proses',
    'Tidak Memenuhi Syarat': 'Tolak',
    'Memenuhi Syarat': 'Sukses',
    'Verifikasi Luas Total Bangunan (LTB), Koefesien Luas Bangunan (KLB) dan Koefesien Fungsi Bangunan (KFB)': 'Proses',
    'Verifikasi Kebutuhan Biaya Pekerjaan Standart (BPS)': 'Proses',
    'Verifikasi Kebutuhan Biaya Pekerjaan Non Standar (BPNS)': 'Proses',
    'Verifikasi Rekening Belanja': 'Proses',
    'Verifikasi Biaya Pekerjaan': 'Proses',
    'Approved': 'Sukses',
    'Rejected': 'Tolak',
    'Pending': 'Proses',
    'Review': 'Proses',
  };
  return statusDisplayMap[asbStatus.status] || 'Proses';
};

// Helper function to determine verification status based on idAsbStatus and verifikator IDs
const getVerificationStatus = (item: APIUsulanBangunan) => {
  const statusId = item.asbStatus?.id || item.idAsbStatus;
  
  // If rejected (idAsbStatus = 7), all statuses are Ditolak
  if (statusId === 7) {
    return {
      adbang: 'Ditolak' as const,
      bappeda: 'Ditolak' as const,
      bpkad: 'Ditolak' as const,
    };
  }
  
  // If approved by ADBANG (idAsbStatus = 8 and idVerifikatorAdpem exists)
  if (statusId === 8 && item.idVerifikatorAdpem) {
    return {
      adbang: 'Disetujui' as const,
      bappeda: item.idVerifikatorBappeda ? 'Disetujui' as const : 'Menunggu' as const,
      bpkad: item.idVerifikatorBpkad ? 'Disetujui' as const : 'Menunggu' as const,
    };
  }
  
  // Default status based on verifikator IDs
  return {
    adbang: item.idVerifikatorAdpem ? 'Disetujui' as const : 'Menunggu' as const,
    bappeda: item.idVerifikatorBappeda ? 'Disetujui' as const : 'Belum' as const,
    bpkad: item.idVerifikatorBpkad ? 'Disetujui' as const : 'Belum' as const,
  };
};

// Transform API data to display format
const transformAPIData = (apiData: APIUsulanBangunan[]): UsulanBangunanGedung[] => {
  return apiData.map((item) => ({
    id: item.id.toString(),
    jenis: item.asbJenis?.jenis,
    uraian: item.namaAsb,
    lokasi: item.alamat,
    klasifikasi: item.idAsbKlasifikasi ? `Klasifikasi ${item.idAsbKlasifikasi}` : 'Belum Ditentukan',
    satuan: 'm2',
    verificationStatus: getVerificationStatus(item),
    nilaiBkf: item.shst ? 'Sudah' : 'Belum',
    status: mapStatus(item.asbStatus),
    statusInfo: getStatusNameById(item.asbStatus?.id || item.idAsbStatus),
    idAsbStatus: item.asbStatus?.id || item.idAsbStatus,
    idVerifikatorAdpem: item.idVerifikatorAdpem,
    idVerifikatorBappeda: item.idVerifikatorBappeda,
    idVerifikatorBpkad: item.idVerifikatorBpkad,
    rejectReason: item.rejectReason,
    suratPermohonan: '/easb-document.pdf',
    createdBy: item.opd?.opd || 'Unknown',
    createdDate: new Date(item.createdAt).toLocaleDateString('id-ID'),
  }));
};

export default function UsulanBangunanGedungPage() {
  const router = useRouter();
  const [data, setData] = useState<UsulanBangunanGedung[]>([]);
  const [filteredData, setFilteredData] = useState<UsulanBangunanGedung[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chart data states
  const [barChartData, setBarChartData] = useState([
    { name: 'Pembangunan', value: 0, color: '#ef4444' },
    { name: 'Pemeliharaan', value: 0, color: '#f59e0b' },
  ]);
  
  const [donutChartData1, setDonutChartData1] = useState([
    { name: 'Pembangunan', value: 0, color: '#ef4444' },
    { name: 'Pemeliharaan', value: 0, color: '#f59e0b' },
  ]);
  
  const [donutChartData2, setDonutChartData2] = useState([
    { name: 'Sukses', value: 0, color: '#3b82f6' },
    { name: 'Proses', value: 0, color: '#22c55e' },
    { name: 'Tolak', value: 0, color: '#ef4444' },
  ]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/usulan/bangunan-gedung/asb', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          let apiData: APIUsulanBangunan[] = result.data?.data || result.data || [];
          
          console.log('API Response:', apiData);
          
          // Filter by selected tahun anggaran if set
          const storedYear = localStorage.getItem('selectedTahunAnggaran');
          if (storedYear) {
            const filterYear = parseInt(storedYear);
            apiData = apiData.filter(d => d.tahunAnggaran === filterYear);
            console.log(`Filtered by tahunAnggaran ${filterYear}:`, apiData.length, 'items');
          }
          
          // Transform API data to display format
          const transformedData = transformAPIData(apiData);
          console.log('Transformed Data:', transformedData);
          
          setData(transformedData);
          setFilteredData(transformedData);
          
          // Calculate chart data based on fetched data
          const pembangunanCount = apiData.filter(d => d.asbJenis?.jenis === 'Pembangunan').length;
          const pemeliharaanCount = apiData.filter(d => d.asbJenis?.jenis === 'Pemeliharaan' || d.asbJenis?.jenis === 'Rehabilitasi').length;

          const percentagePembangunan = Math.floor(pembangunanCount / (pembangunanCount + pemeliharaanCount) * 100);
          const percentagePemeliharaan = Math.floor(pemeliharaanCount / (pembangunanCount + pemeliharaanCount) * 100);
          
          // Update Bar Chart data
          setBarChartData([
            { name: 'Pembangunan', value: pembangunanCount, color: '#ef4444' },
            { name: 'Pemeliharaan', value: pemeliharaanCount, color: '#f59e0b' },
          ]);
          
          // Update Donut Chart 1 (Jenis distribution)
          setDonutChartData1([
            { name: 'Pembangunan', value: percentagePembangunan || 1, color: '#ef4444' },
            { name: 'Pemeliharaan', value: percentagePemeliharaan || 1, color: '#f59e0b' },
          ]);
          
          // Calculate status counts
          const suksesCount = apiData.filter(d => mapStatus(d.asbStatus) === 'Sukses').length;
          const prosesCount = apiData.filter(d => mapStatus(d.asbStatus) === 'Proses').length;
          const tolakCount = apiData.filter(d => mapStatus(d.asbStatus) === 'Tolak').length;
          
          const percentageSukses = Math.floor(suksesCount / (suksesCount + prosesCount + tolakCount) * 100);
          const percentageProses = Math.floor(prosesCount / (suksesCount + prosesCount + tolakCount) * 100);
          const percentageTolak = Math.floor(tolakCount / (suksesCount + prosesCount + tolakCount) * 100);
          
          // Update Donut Chart 2 (Status distribution)
          setDonutChartData2([
            { name: 'Sukses', value: percentageSukses || 1, color: '#3b82f6' },
            { name: 'Proses', value: percentageProses || 1, color: '#22c55e' },
            { name: 'Tolak', value: percentageTolak || 1, color: '#ef4444' },
          ]);
        } else {
          console.error('Failed to fetch data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching usulan data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (filters: FilterUsulanBangunan) => {
    let filtered = [...data];

    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.uraian.toLowerCase().includes(filters.search!.toLowerCase()) ||
          item.lokasi.toLowerCase().includes(filters.search!.toLowerCase()) ||
          item.klasifikasi.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.jenis && filters.jenis !== 'all') {
      filtered = filtered.filter((item) => item.jenis === filters.jenis);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    setFilteredData(filtered);
  };

  // Handle add new proposal
  const handleAddNew = () => {
    router.push('/usulan/bangunan-gedung/tambah');
  };

  // Calculate statistics
  const stats = {
    total: data.length,
    sukses: data.filter((d) => d.status === 'Sukses').length,
    proses: data.filter((d) => d.status === 'Proses').length,
    tolak: data.filter((d) => d.status === 'Tolak').length,
    pembangunan: data.filter((d) => d.jenis === 'Pembangunan').length,
    pemeliharaan: data.filter((d) => d.jenis === 'Pemeliharaan').length,
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Usulan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sukses</p>
              <p className="text-2xl font-bold text-green-600">{stats.sukses}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Dalam Proses</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.proses}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">{stats.tolak}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Persebaran Aktivitas</h3>
          <div className="h-[250px]">
            <BarChart data={barChartData} height={220} />
          </div>
        </div>

        {/* Donut Charts Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribusi Status</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="relative">
              <p className="text-sm text-gray-500 text-center mb-2">Berdasarkan Jenis</p>
              <DonutChart
                data={donutChartData1}
                height={220}
                showLegend={true}
                showLabels={false}
              />
            </div>
            <div className="relative">
              <p className="text-sm text-gray-500 text-center mb-2">Berdasarkan Status</p>
              <DonutChart
                data={donutChartData2}
                height={220}
                showLegend={true}
                showLabels={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <UsulanBangunanTable
        data={filteredData}
        onFilterChange={handleFilterChange}
        onAddNew={handleAddNew}
      />
    </div>
  );
}
