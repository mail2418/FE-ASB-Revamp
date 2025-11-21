'use client';
import React, { useState, useEffect } from 'react';
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

// Mock data - in production this would come from API
const mockData: UsulanBangunanGedung[] = [
  {
    id: '1',
    jenis: 'Pembangunan',
    uraian: '1 m1 Konstruksi XXX',
    lokasi: 'Jl X, Kab/Kota',
    klasifikasi: 'Gedung Negara Tidak Sederhana',
    satuan: 'm2',
    nilaiBkf: 1000000000,
    sumberPembiayaan: 'APBD',
    status: 'Sukses',
    suratPermohonan: '/docs/permohonan-1.pdf',
    suratRekomendasi: '/docs/rekomendasi-1.pdf',
  },
  {
    id: '2',
    jenis: 'Pembangunan',
    uraian: '1 m1 Konstruksi XXX',
    lokasi: 'Jl X, Kab/Kota',
    klasifikasi: 'Gedung Negara Sederhana',
    satuan: 'm2',
    nilaiBkf: 750000000,
    sumberPembiayaan: 'APBD',
    status: 'Sukses',
    suratPermohonan: '/docs/permohonan-2.pdf',
    suratRekomendasi: '/docs/rekomendasi-2.pdf',
  },
  {
    id: '3',
    jenis: 'Pembangunan',
    uraian: '1 m1 Konstruksi XXX',
    lokasi: 'Jl X, Kab/Kota',
    klasifikasi: 'Rumah Negara Tipe A',
    satuan: 'm2',
    nilaiBkf: 500000000,
    sumberPembiayaan: 'APBN',
    status: 'Tolak',
    suratPermohonan: '/docs/permohonan-3.pdf',
  },
  {
    id: '4',
    jenis: 'Pemeliharaan',
    uraian: '1 m1 Konstruksi XXX',
    lokasi: 'Jl X, Kab/Kota',
    klasifikasi: 'Gedung Negara Sederhana',
    satuan: 'm2',
    nilaiBkf: 250000000,
    sumberPembiayaan: 'APBD',
    status: 'Proses',
    suratPermohonan: '/docs/permohonan-4.pdf',
  },
];

// Chart data - from API in production
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
  { name: 'Item 2', value: 30, color: '#22c55e' },
  { name: 'Item 3', value: 30, color: '#84cc16' },
];

const donutChartData3 = [
  { name: 'Item 1', value: 62.5, color: '#06b6d4' },
  { name: 'Item 3', value: 25, color: '#8b5cf6' },
  { name: 'Item 5', value: 12.5, color: '#a855f7' },
];

export default function UsulanBangunanGedungPage() {
  const router = useRouter();
  const [data, setData] = useState(mockData);
  const [filteredData, setFilteredData] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);

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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Usulan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola usulan bangunan gedung dari berbagai instansi
          </p>
        </div>
      </div>

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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Usulan</h3>
          <div className="h-[250px]">
            <BarChart data={barChartData} height={220} />
          </div>
        </div>

        {/* Donut Charts Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <DonutChart
                data={donutChartData1}
                height={180}
                showLegend={true}
                showLabels={false}
              />
            </div>
            <div className="relative">
              <DonutChart
                data={donutChartData2}
                height={180}
                showLegend={true}
                showLabels={false}
              />
            </div>
            <div className="relative">
              <DonutChart
                data={donutChartData3}
                height={180}
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