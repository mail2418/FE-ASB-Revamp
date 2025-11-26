'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Info } from 'lucide-react';
import type { UsulanData } from '@/types';

// Dynamic imports for charts to avoid SSR issues
const BarChart = dynamic(() => import('@/components/Charts/BarChart'), {
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

// Mock data - in production this would come from API
const barChartData = [
  { name: 'Bangunan Gedung', value: 8, color: '#ef4444' },
  { name: 'Jalan', value: 12, color: '#f59e0b' },
  { name: 'Saluran', value: 16, color: '#eab308' },
];

const donutChartData1 = [
  { name: 'Sukses', value: 40, color: '#ef4444' },
  { name: 'Sedang diproses', value: 25, color: '#f59e0b' },
  { name: 'Ditolak', value: 20, color: '#eab308' },
  { name: 'Menunggu Verifikator', value: 15, color: '#22c55e' },
];

const donutChartData2 = [
  { name: 'Sukses', value: 15, color: '#ef4444' },
  { name: 'Sedang diproses', value: 25, color: '#f59e0b' },
  { name: 'Ditolak', value: 10, color: '#eab308' },
  { name: 'Menunggu Verifikator', value: 50, color: '#22c55e' },
];

const donutChartData3 = [
  { name: 'Sukses', value: 55, color: '#ef4444' },
  { name: 'Sedang diproses', value: 15, color: '#f59e0b' },
  { name: 'Ditolak', value: 10, color: '#eab308' },
  { name: 'Menunggu Verifikator', value: 20, color: '#22c55e' },
];

// GET FROM API
const tableData: UsulanData[] = [
  {
    id: '1',
    jenis: 'Umum',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Upload teaser',
    satuan: 'Add here',
    
    status: 'Sedang Diproses',
  },
  {
    id: '2',
    jenis: 'Bangunan',
    uraian: 'Bangunan Gedung X',
    spek: '-',
    satuan: 'Add here',
    
    status: 'Sukses',
  },
  {
    id: '3',
    jenis: 'Jalan',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Review messaging',
    satuan: 'Add here',
    
    status: 'Sukses',
  },
  {
    id: '4',
    jenis: 'Jalan',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Review messaging',
    satuan: 'Add here',
    
    status: 'Sukses',
  },
  {
    id: '5',
    jenis: 'Jalan',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Review messaging',
    satuan: 'Add here',
    
    status: 'Sukses',
  },
  {
    id: '6',
    jenis: 'Jalan',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Review messaging',
    satuan: 'Add here',
    
    status: 'Sukses',
  },
];

export default function DashboardPage() {
  const [filteredData, setFilteredData] = React.useState(tableData);

  const handleFilterChange = (filters: { search?: string; status?: string }) => {
    let filtered = [...tableData];

    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.uraian.toLowerCase().includes(filters.search!.toLowerCase()) ||
          item.spek.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    setFilteredData(filtered);
  };

  return (
    <div className="space-y-6">
      {/* Charts Grid - Responsive Layout */}
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Bar Chart Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Persebaran Usulan</h3>
            <button className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium">
              View Details →
            </button>
          </div>
          <div className="h-[250px] sm:h-[300px]">
            <BarChart data={barChartData} height={250} />
          </div>
        </div>

        {/* Status Charts Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Persentase Status Usulan
          </h3>
          
          {/* Responsive Grid: Stack on mobile, 3 columns on desktop */}
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-3 lg:gap-4">
            {/* Chart 1 */}
            <div className="bg-gray-50 rounded-lg p-3 relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-100 text-teal-600 text-[10px] sm:text-xs font-bold">
                  Usulan Bangunan Gedung
                </span>
              </div>
              <div className="h-[200px] sm:h-40">
                <DonutChart
                  data={donutChartData1}
                  height={140}
                  showLegend={true}
                  showLabels={false}
                />
              </div>
            </div>

            {/* Chart 2 */}
            <div className="bg-gray-50 rounded-lg p-3 relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-100 text-teal-600 text-[10px] sm:text-xs font-bold">
                   Usulan Jalan
                </span>
              </div>
              <div className="h-[200px] sm:h-40">
                <DonutChart
                  data={donutChartData2}
                  height={140}
                  showLegend={true}
                  showLabels={false}
                />
              </div>
            </div>

            {/* Chart 3 */}
            <div className="bg-gray-50 rounded-lg p-3 relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-100 text-teal-600 text-[10px] sm:text-xs font-bold">
                   Usulan Saluran
                </span>
              </div>
              <div className="h-[200px] sm:h-40">
                <DonutChart
                  data={donutChartData3}
                  height={140}
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
              {[...donutChartData1, ...donutChartData2, ...donutChartData3]
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