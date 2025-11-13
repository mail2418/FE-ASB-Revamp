'use client'
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
  { name: 'Item 1', value: 8 },
  { name: 'Item 2', value: 12 },
  { name: 'Item 3', value: 16 },
  { name: 'Item 4', value: 20 },
];

const donutChartData1 = [
  { name: 'Item 1', value: 25, color: '#ef4444' },
  { name: 'Item 2', value: 20, color: '#f59e0b' },
  { name: 'Item 3', value: 30, color: '#eab308' },
  { name: 'Item 4', value: 25, color: '#22c55e' },
];

const donutChartData2 = [
  { name: 'Item 1', value: 40, color: '#3b82f6' },
  { name: 'Item 2', value: 30, color: '#10b981' },
  { name: 'Item 3', value: 30, color: '#84cc16' },
];

const donutChartData3 = [
  { name: 'Item 1', value: 65.5, color: '#06b6d4' },
  { name: 'Item 2', value: 22.7, color: '#6366f1' },
  { name: 'Item 3', value: 11.8, color: '#8b5cf6' },
];

const tableData: UsulanData[] = [
  {
    id: '1',
    jenis: 'Umum',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Upload teaser',
    satuan: 'Add here',
    satuan2: 'Add here',
    status: 'Sedang Diproses',
  },
  {
    id: '2',
    jenis: 'Bangunan',
    uraian: 'Bangunan Gedung X',
    spek: '-',
    satuan: 'Add here',
    satuan2: 'Add here',
    status: 'Sukses',
  },
  {
    id: '3',
    jenis: 'Jalan',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Review messaging',
    satuan: 'Add here',
    satuan2: 'Add here',
    status: 'Sukses',
  },
  {
    id: '4',
    jenis: 'Jalan',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Review messaging',
    satuan: 'Add here',
    satuan2: 'Add here',
    status: 'Sukses',
  },
  {
    id: '5',
    jenis: 'Jalan',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Review messaging',
    satuan: 'Add here',
    satuan2: 'Add here',
    status: 'Sukses',
  },
  {
    id: '6',
    jenis: 'Jalan',
    uraian: '1 m1 Konstruksi XXX',
    spek: 'Review messaging',
    satuan: 'Add here',
    satuan2: 'Add here',
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Usulan</h1>
        <div className="mt-4 sm:mt-0 flex items-center gap-2 text-sm text-gray-500">
          <Info className="h-4 w-4" />
          <span>Data terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Usulan</h3>
            <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View Details →
            </button>
          </div>
          <BarChart data={barChartData} />
        </div>

        {/* Status Charts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Prosentase Status Usulan
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Chart 1 */}
            <div className="relative">
              <DonutChart
                data={donutChartData1}
                height={180}
                showLegend={false}
              />
              
              <div className="mt-2 space-y-1">
                {donutChartData1.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-gray-800 font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2 */}
            <div className="relative">
              <DonutChart
                data={donutChartData2}
                height={180}
                showLegend={false}
              />
              
              <div className="mt-2 space-y-1">
                {donutChartData2.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-gray-800 font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 3 */}
            <div className="relative">
              <DonutChart
                data={donutChartData3}
                height={180}
                showLegend={false}
              />
              
              <div className="mt-2 space-y-1">
                {donutChartData3.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-gray-800 font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
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