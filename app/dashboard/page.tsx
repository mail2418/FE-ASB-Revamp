'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';
import type { UsulanData } from '@/types';
import { cn } from '@/lib/utils';
import WelcomeToast from '@/components/WelcomeToast';

// Dynamic imports for charts to avoid SSR issues
const LineChart = dynamic(() => import('@/components/Charts/LineChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />,
});

const DonutChart = dynamic(() => import('@/components/Charts/DonutChart'), {
  ssr: false,
  loading: () => <div className="h-[250px] bg-gray-100 animate-pulse rounded-lg" />,
});

const DashboardTable = dynamic(() => import('@/components/Dashboard/DashboardTable'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />,
});

// Line chart configuration
const lineChartLines = [
  { dataKey: 'bangunanGedung', color: '#ef4444', name: 'Bangunan Gedung' },
  { dataKey: 'jalan', color: '#f59e0b', name: 'Jalan' },
  { dataKey: 'saluran', color: '#eab308', name: 'Saluran' },
];

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

// Status ID to name mapping based on idAsbStatus
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

// Map API status to display status based on idAsbStatus and verifikator IDs
const mapStatus = (
  idAsbStatus: number,
  idVerifikatorAdpem: number | null,
  idVerifikatorBpkad: number | null,
  idVerifikatorBappeda: number | null
): string => {
  // Sukses when idAsbStatus is 8 AND all verifikator IDs are not null
  if (
    idAsbStatus === 8 &&
    idVerifikatorAdpem !== null &&
    idVerifikatorBpkad !== null &&
    idVerifikatorBappeda !== null
  ) {
    return 'Sukses';
  }
  
  // Ditolak when idAsbStatus is 7
  if (idAsbStatus === 7) return 'Ditolak';
  
  // Sedang diproses BPKAD when idAsbStatus is 13
  if (idAsbStatus === 13) return 'Sedang diproses BPKAD';
  
  // Sedang diproses BAPPEDA when idAsbStatus is 12
  if (idAsbStatus === 12) return 'Sedang diproses BAPPEDA';
  
  // Sedang diproses Adbang when idAsbStatus is > 5 and < 12, excluding 7 and 8
  if (idAsbStatus !== 7 && idAsbStatus !== 8) {
    return 'Sedang diproses Adbang';
  }
  
  // Default: Sedang Diproses for all other statuses
  return 'Sedang diproses Adbang';
};

// Transform API data to table format
const transformAPIData = (apiData: APIUsulanBangunan[]): UsulanData[] => {
  return apiData.map((item) => ({
    id: item.id.toString(),
    jenis: 'Bangunan',
    namaAsb: item.namaAsb,
    status: mapStatus(
      item.asbStatus?.id || item.idAsbStatus,
      item.idVerifikatorAdpem,
      item.idVerifikatorBpkad,
      item.idVerifikatorBappeda
    ),
    idAsbStatus: item.asbStatus?.id || item.idAsbStatus,
    idVerifikatorAdpem: item.idVerifikatorAdpem,
    idVerifikatorBappeda: item.idVerifikatorBappeda,
    idVerifikatorBpkad: item.idVerifikatorBpkad,
    suratPermohonan: 'download',
    suratRekomendasi: (item.idVerifikatorAdpem !== null && 
                       item.idVerifikatorBappeda !== null && 
                       item.idVerifikatorBpkad !== null) ? 'download' : undefined,
    createdAt: new Date(item.createdAt),
  }));
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<UsulanData[]>([]);
  const [filteredData, setFilteredData] = useState<UsulanData[]>([]);
  const [rawApiData, setRawApiData] = useState<APIUsulanBangunan[]>([]);
  
  // Get current month/year for initial values
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = typeof window !== 'undefined' 
    ? (localStorage.getItem('selectedTahunAnggaran') || currentDate.getFullYear().toString())
    : currentDate.getFullYear().toString();
  
  // Available months and years
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIndex]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

  // Chart data states
  const [lineChartData, setLineChartData] = useState<any[]>([]);

  const [donutChartDataBangunanGedung, setDonutChartDataBangunanGedung] = useState([
    { name: 'Sukses', value: 1, color: '#22c55e' },
    { name: 'Sedang diproses', value: 1, color: '#f59e0b' },
    { name: 'Ditolak', value: 1, color: '#ef4444' },
  ]);
  const [donutChartDataJalan, setDonutChartDataJalan] = useState([
    { name: 'Sukses', value: 1, color: '#22c55e' },
    { name: 'Sedang diproses', value: 1, color: '#f59e0b' },
    { name: 'Ditolak', value: 1, color: '#ef4444' },
  ]);
  const [donutChartDataSaluran, setDonutChartDataSaluran] = useState([
    { name: 'Sukses', value: 1, color: '#22c55e' },
    { name: 'Sedang diproses', value: 1, color: '#f59e0b' },
    { name: 'Ditolak', value: 1, color: '#ef4444' },
  ]);
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    sukses: 0,
    sedangDiproses: 0,
    ditolak: 0,
  });

  // Pagination state for API fetch
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  // Welcome toast state
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [userName, setUserName] = useState('User');
  const [welcomeYear, setWelcomeYear] = useState(currentDate.getFullYear());
  const itemsPerPage = 10; // Fetch more items for dashboard statistics

  // Function to update line chart data based on selected month/year
  const updateLineChartData = (apiData: APIUsulanBangunan[], month: string, year: string) => {
    const monthIndex = months.indexOf(month);
    const yearNum = parseInt(year);
    
    // Filter data by selected month and year
    const filteredByDate = apiData.filter(item => {
      const date = new Date(item.createdAt);
      return date.getMonth() === monthIndex && date.getFullYear() === yearNum;
    });
    
    // Group by day
    const dateGroups: { [key: string]: number } = {};
    filteredByDate.forEach(item => {
      const date = new Date(item.createdAt);
      const dateKey = `${date.getDate()} ${month.substring(0, 3)}`;
      dateGroups[dateKey] = (dateGroups[dateKey] || 0) + 1;
    });
    
    // Create cumulative line chart data
    let cumulative = 0;
    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
      const dayA = parseInt(a.split(' ')[0]);
      const dayB = parseInt(b.split(' ')[0]);
      return dayA - dayB;
    });
    
    const lineData = sortedDates.map(dateKey => {
      cumulative += dateGroups[dateKey];
      return {
        date: dateKey,
        bangunanGedung: cumulative,
        jalan: 0,
        saluran: 0,
      };
    });
    
    if (lineData.length > 0) {
      setLineChartData(lineData);
    } else {
      // Show empty state if no data for selected period
      setLineChartData([{ date: `1 ${month.substring(0, 3)}`, bangunanGedung: 0, jalan: 0, saluran: 0 }]);
    }
  };

  // Update line chart when month/year selection changes
  useEffect(() => {
    if (rawApiData.length > 0) {
      updateLineChartData(rawApiData, selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, rawApiData]);

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

        const response = await fetch(`/api/usulan/bangunan-gedung/asb?page=${currentPage}&amount=${itemsPerPage}&tahunAnggaran=${selectedYear}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Feth Data Usulan Jalan
        // Fetch Data Usulan Saluran

        if (response.ok) {
          const result = await response.json();
          console.log(result)
          setTotalPage(result.data?.totalPages || 1);
          let apiData: APIUsulanBangunan[] = result.data?.data || result.data || [];
          
          console.log('Dashboard API Response:', apiData);
          
          // Filter by selected tahun anggaran if set
          const storedYear = localStorage.getItem('selectedTahunAnggaran');
          if (storedYear) {
            const filterYear = parseInt(storedYear);
            apiData = apiData.filter(d => d.tahunAnggaran === filterYear);
            console.log(`Filtered by tahunAnggaran ${filterYear}:`, apiData.length, 'items');
          }
          
          // Transform API data for table
          const transformedData = transformAPIData(apiData);
          setTableData(transformedData);
          setFilteredData(transformedData);
          
          // Calculate statistics using idAsbStatus directly
          const suksesCount = apiData.filter(d => (d.asbStatus?.id || d.idAsbStatus) === 8).length;
          const tolakCount = apiData.filter(d => (d.asbStatus?.id || d.idAsbStatus) === 7).length;
          const prosesCount = apiData.filter(d => {
            const statusId = d.asbStatus?.id || d.idAsbStatus;
            return statusId !== 8 && statusId !== 7;
          }).length;
          
          setStats({
            total: apiData.length,
            sukses: suksesCount,
            sedangDiproses: prosesCount,
            ditolak: tolakCount,
          });
          
          // Calculate donut chart data for Bangunan Gedung
          const totalBangunan = apiData.length;
          if (totalBangunan > 0) {
            const suksesPercentage = Number(((suksesCount / totalBangunan) * 100).toFixed(2));
            const prosesPercentage = Number(((prosesCount / totalBangunan) * 100).toFixed(2));
            const tolakPercentage = Number(((tolakCount / totalBangunan) * 100).toFixed(2));
            setDonutChartDataBangunanGedung([
              { name: 'Sukses', value: suksesPercentage || 1, color: '#22c55e' },
              { name: 'Sedang diproses', value: prosesPercentage || 1, color: '#f59e0b' },
              { name: 'Ditolak', value: tolakPercentage || 1, color: '#ef4444' },
            ]);
          }
          
          // Store raw API data for line chart filtering
          setRawApiData(apiData);
        } else {
          console.error('Failed to fetch data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear, currentPage]);

  // Check for welcome toast flag after page load (set by TahunAnggaranModal)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldShowToast = localStorage.getItem('showWelcomeToast');
      if (shouldShowToast === 'true') {
        // Get user data from cookie for the welcome message
        const userDataCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('userData='));
        
        if (userDataCookie) {
          const parsed = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
          setUserName(parsed.name || 'User');
        }
        
        // Get selected year
        const storedYear = localStorage.getItem('selectedTahunAnggaran');
        if (storedYear) {
          setWelcomeYear(parseInt(storedYear));
        }
        
        // Show toast and clear the flag
        setShowWelcomeToast(true);
        localStorage.removeItem('showWelcomeToast');
      }
    }
  }, []);

  const handleFilterChange = (filters: { search?: string; status?: string; jenis?: string }) => {
    let filtered = [...tableData];

    // Search across jenis, uraian, and status
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.jenis.toLowerCase().includes(searchLower) ||
          (item.namaAsb && item.namaAsb.toLowerCase().includes(searchLower)) ||
          item.status.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((item) => item.status === filters.status);
    }
    if (filters.jenis && filters.jenis !== 'all') {
      filtered = filtered.filter((item) => item.jenis === filters.jenis);
    }

    setFilteredData(filtered);
  };

  // Handle page change for pagination
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPage) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers array for pagination
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPage <= maxVisiblePages) {
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPage);
      } else if (currentPage >= totalPage - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPage - 3; i <= totalPage; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPage);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2 text-gray-600">Memuat data dashboard...</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Usulan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sedang Diproses</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.sedangDiproses}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">{stats.ditolak}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid - Responsive Layout */}
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Line Chart Card - Trend Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Trend Analisis Usulan</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Month Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                  className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors flex items-center gap-2"
                >
                  {selectedMonth}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {monthDropdownOpen && (
                  <div className="absolute top-full mt-2 right-0 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-60 overflow-y-auto">
                    {months.map((month) => (
                      <button
                        key={month}
                        onClick={() => {
                          setSelectedMonth(month);
                          setMonthDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
                          selectedMonth === month && 'bg-teal-50 text-teal-700 font-medium'
                        )}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="h-[250px] sm:h-[300px]">
            <LineChart data={lineChartData} lines={lineChartLines} height={250} />
          </div>
        </div>

        {/* Status Charts Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Persentase Status Usulan
          </h3>
          
          {/* Responsive Grid: Stack on mobile, 3 columns on desktop */}
          <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:gap-8">
            {/* Chart 1 - Bangunan Gedung */}
            <div className="rounded-lg p-4 relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-100 text-teal-600 text-[10px] sm:text-xs font-bold">
                  Usulan Bangunan Gedung
                </span>
              </div>
              <div className="h-[240px] sm:h-60">
                <DonutChart
                  data={donutChartDataBangunanGedung}
                  height={240}
                  showLegend={true}
                  showLabels={false}
                />
              </div>
            </div>

            {/* Chart 2 - Jalan */}
            <div className="rounded-lg p-4 relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-100 text-teal-600 text-[10px] sm:text-xs font-bold">
                   Usulan Jalan
                </span>
              </div>
              <div className="h-[240px] sm:h-60">
                <DonutChart
                  data={donutChartDataJalan}
                  height={240}
                  showLegend={true}
                  showLabels={false}
                />
              </div>
            </div>

            {/* Chart 3 - Saluran */}
            <div className="rounded-lg p-4 relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-100 text-teal-600 text-[10px] sm:text-xs font-bold">
                   Usulan Saluran
                </span>
              </div>
              <div className="h-[240px] sm:h-60">
                <DonutChart
                  data={donutChartDataSaluran}
                  height={240}
                  showLegend={true}
                  showLabels={false}
                />
              </div>
            </div>
          </div>
          
          {/* Mobile-only: Show combined legend below all charts */}
          <div className="mt-4 sm:hidden border-t pt-4">
            <p className="text-xs text-gray-500 mb-2">Keterangan:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {donutChartDataBangunanGedung.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Table */}
      <DashboardTable
        data={filteredData}
        onFilterChange={handleFilterChange}
        currentPage={currentPage}
        totalPages={totalPage}
        totalItems={stats.total}
        onPageChange={handlePageChange}
      />

      {/* Welcome Toast */}
      <WelcomeToast 
        isVisible={showWelcomeToast}
        userName={userName}
        selectedYear={welcomeYear}
        onClose={() => setShowWelcomeToast(false)}
      />
    </div>
  );
}
