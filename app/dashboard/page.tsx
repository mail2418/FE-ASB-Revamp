'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';
import type { UsulanData } from '@/types';
import { cn } from '@/lib/utils';

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

// Map API status to display status
const mapStatus = (asbStatus: { id: number; status: string }): string => {
  if (!asbStatus) return 'Sedang Diproses';
  const statusMap: { [key: string]: string } = {
    'General Documents': 'Sedang Diproses',
    'Approved': 'Sukses',
    'Rejected': 'Ditolak',
    'Pending': 'Sedang Diproses',
    'Review': 'Sedang Diproses',
  };
  return statusMap[asbStatus.status] || 'Sedang Diproses';
};

// Transform API data to table format
const transformAPIData = (apiData: APIUsulanBangunan[]): UsulanData[] => {
  return apiData.map((item) => ({
    id: item.id.toString(),
    jenis: 'Bangunan',
    uraian: item.namaAsb,
    status: mapStatus(item.asbStatus),
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: item.asbStatus?.status === 'Approved' ? '/easb-document.pdf' : undefined,
  }));
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<UsulanData[]>([]);
  const [filteredData, setFilteredData] = useState<UsulanData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('November');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  
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

  // Available months and years
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = ['2025', '2024', '2023', '2022', '2021'];

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
          const apiData: APIUsulanBangunan[] = result.data?.data || result.data || [];
          
          console.log('Dashboard API Response:', apiData);
          
          // Transform API data for table
          const transformedData = transformAPIData(apiData);
          setTableData(transformedData);
          setFilteredData(transformedData);
          
          // Calculate statistics
          const suksesCount = apiData.filter(d => mapStatus(d.asbStatus) === 'Sukses').length;
          const prosesCount = apiData.filter(d => mapStatus(d.asbStatus) === 'Sedang Diproses').length;
          const tolakCount = apiData.filter(d => mapStatus(d.asbStatus) === 'Ditolak').length;
          
          const suksesCountPercentage = (suksesCount / apiData.length) * 100;
          const prosesCountPercentage = (prosesCount / apiData.length) * 100;
          const tolakCountPercentage = (tolakCount / apiData.length) * 100;
          
          setStats({
            total: apiData.length,
            sukses: suksesCount,
            sedangDiproses: prosesCount,
            ditolak: tolakCount,
          });
          
          // Calculate donut chart data for Bangunan Gedung
          const totalBangunan = suksesCount + prosesCount + tolakCount;
          if (totalBangunan > 0) {
            setDonutChartDataBangunanGedung([
              { name: 'Sukses', value: suksesCountPercentage || 1, color: '#22c55e' },
              { name: 'Sedang diproses', value: prosesCountPercentage || 1, color: '#f59e0b' },
              { name: 'Ditolak', value: tolakCountPercentage || 1, color: '#ef4444' },
            ]);
          }
          
          // Generate line chart data (group by date)
          const dateGroups: { [key: string]: number } = {};
          apiData.forEach(item => {
            const date = new Date(item.createdAt);
            const dateKey = `${date.getDate()} ${months[date.getMonth()].substring(0, 3)}`;
            dateGroups[dateKey] = (dateGroups[dateKey] || 0) + 1;
          });
          
          // Create cumulative line chart data
          let cumulative = 0;
          const lineData = Object.entries(dateGroups)
            .sort((a, b) => {
              // Simple sort by date string
              return 0;
            })
            .map(([date, count]) => {
              cumulative += count;
              return {
                date,
                bangunanGedung: cumulative,
                jalan: 0,  // Placeholder for jalan data
                saluran: 0, // Placeholder for saluran data
              };
            });
          
          if (lineData.length > 0) {
            setLineChartData(lineData);
          } else {
            // Default data if no API data available
            setLineChartData([
              { date: 'Nov', bangunanGedung: apiData.length, jalan: 0, saluran: 0 },
            ]);
          }
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
  }, []);

  const handleFilterChange = (filters: { search?: string; status?: string; jenis?: string }) => {
    let filtered = [...tableData];

    // Search across jenis, uraian, and status
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.jenis.toLowerCase().includes(searchLower) ||
          (item.uraian && item.uraian.toLowerCase().includes(searchLower)) ||
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

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2 text-gray-600">Memuat data dashboard...</span>
        </div>
      )}

      {/* Charts Grid - Responsive Layout */}
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Line Chart Card - Trend Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Trend Analisis Usulan</h3>
              <p className="text-xs text-gray-500 mt-1">Data bulanan</p>
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
              
              {/* Year Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                  className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors flex items-center gap-2"
                >
                  {selectedYear}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {yearDropdownOpen && (
                  <div className="absolute top-full mt-2 right-0 w-28 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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
      />

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
    </div>
  );
}