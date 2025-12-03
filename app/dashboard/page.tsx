'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Info, ChevronDown } from 'lucide-react';
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

// Mock data - One month trend analysis (30 days)
const lineChartData = [
  { date: '1 Nov', bangunanGedung: 2, jalan: 1, saluran: 3 },
  { date: '3 Nov', bangunanGedung: 3, jalan: 2, saluran: 4 },
  { date: '5 Nov', bangunanGedung: 3, jalan: 3, saluran: 5 },
  { date: '7 Nov', bangunanGedung: 4, jalan: 4, saluran: 6 },
  { date: '9 Nov', bangunanGedung: 5, jalan: 6, saluran: 7 },
  { date: '11 Nov', bangunanGedung: 5, jalan: 7, saluran: 8 },
  { date: '13 Nov', bangunanGedung: 6, jalan: 8, saluran: 10 },
  { date: '15 Nov', bangunanGedung: 6, jalan: 9, saluran: 11 },
  { date: '17 Nov', bangunanGedung: 7, jalan: 10, saluran: 12 },
  { date: '19 Nov', bangunanGedung: 7, jalan: 11, saluran: 13 },
  { date: '21 Nov', bangunanGedung: 8, jalan: 11, saluran: 14 },
  { date: '23 Nov', bangunanGedung: 8, jalan: 12, saluran: 15 },
  { date: '25 Nov', bangunanGedung: 8, jalan: 12, saluran: 15 },
  { date: '27 Nov', bangunanGedung: 8, jalan: 12, saluran: 16 },
  { date: '29 Nov', bangunanGedung: 8, jalan: 12, saluran: 16 },
];

const lineChartLines = [
  { dataKey: 'bangunanGedung', color: '#ef4444', name: 'Bangunan Gedung' },
  { dataKey: 'jalan', color: '#f59e0b', name: 'Jalan' },
  { dataKey: 'saluran', color: '#eab308', name: 'Saluran' },
];

const donutChartDataBangunanGedung = [
  { name: 'Sukses', value: 40, color: '#ef4444' },
  { name: 'Sedang diproses', value: 25, color: '#f59e0b' },
  { name: 'Ditolak', value: 20, color: '#eab308' },
  { name: 'Menunggu Verifikator', value: 15, color: '#22c55e' },
];

const donutChartDataJalan = [
  { name: 'Sukses', value: 15, color: '#ef4444' },
  { name: 'Sedang diproses', value: 25, color: '#f59e0b' },
  { name: 'Ditolak', value: 10, color: '#eab308' },
  { name: 'Menunggu Verifikator', value: 50, color: '#22c55e' },
];

const donutChartDataSaluran = [
  { name: 'Sukses', value: 55, color: '#ef4444' },
  { name: 'Sedang diproses', value: 15, color: '#f59e0b' },
  { name: 'Ditolak', value: 10, color: '#eab308' },
  { name: 'Menunggu Verifikator', value: 20, color: '#22c55e' },
];

// GET FROM API
const tableData: UsulanData[] = [
  {
    id: '1',
    jenis: 'Bangunan',
    uraian: 'Gedung Negara Sederhana',
    status: 'Sedang Diproses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
  },
  {
    id: '2',
    jenis: 'Bangunan',
    uraian: 'Gedung Negara Tidak Sederhana',
    status: 'Sukses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
  },
  {
    id: '3',
    jenis: 'Jalan',
    uraian: 'Rumah Negara Tipe A',
    status: 'Sukses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
  },
  {
    id: '4',
    jenis: 'Jalan',
    uraian: 'Gedung Negara Sederhana',
    status: 'Sukses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
  },
  {
    id: '5',
    jenis: 'Jalan',
    uraian: 'Rumah Negara Tipe B',
    status: 'Sukses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
  },
  {
    id: '6',
    jenis: 'Jalan',
    uraian: 'Gedung Negara Tidak Sederhana',
    status: 'Sukses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
  },
];

export default function DashboardPage() {
  const [filteredData, setFilteredData] = React.useState(tableData);
  const [selectedMonth, setSelectedMonth] = React.useState('November');
  const [selectedYear, setSelectedYear] = React.useState('2024');
  const [monthDropdownOpen, setMonthDropdownOpen] = React.useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = React.useState(false);

  // Available months and years
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = ['2024', '2023', '2022', '2021'];

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
            {/* Chart 1 */}
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

            {/* Chart 2 */}
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

            {/* Chart 3 */}
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
              {[...donutChartDataBangunanGedung, ...donutChartDataJalan, ...donutChartDataSaluran]
                .filter((item, index, self) => 
                  index === self.findIndex(t => t.name === item.name)
                )
                .map((item, idx) => (
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
              <p className="text-2xl font-bold text-gray-900">{tableData.length}</p>
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
              <p className="text-2xl font-bold text-green-600">
                {tableData.filter(d => d.status === 'Sukses').length}
              </p>
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
              <p className="text-2xl font-bold text-yellow-600">
                {tableData.filter(d => d.status === 'Sedang Diproses').length}
              </p>
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
              <p className="text-2xl font-bold text-red-600">
                {tableData.filter(d => d.status === 'Ditolak').length}
              </p>
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