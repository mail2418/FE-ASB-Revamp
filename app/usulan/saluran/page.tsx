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
    uraian: 'Pembangunan Gedung Kantor Dinas Pendidikan 3 Lantai',
    lokasi: 'Jl. Gatot Subroto No. 45, Kota Bandung',
    klasifikasi: 'Gedung Negara Tidak Sederhana',
    satuan: 'm2',
    verificationStatus: {
      adpem: 'Disetujui',
      bappeda: 'Disetujui',
      bpkad: 'Disetujui',
    },
    nilaiBkf: 'Sudah',
    status: 'Sukses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
    createdBy: 'Anggito Anju',
    createdDate: '15-11-2024',
  },
  {
    id: '2',
    jenis: 'Pembangunan',
    uraian: 'Pembangunan Gedung Puskesmas Tipe B',
    lokasi: 'Jl. Ahmad Yani Km 5, Kecamatan Cibiru',
    klasifikasi: 'Gedung Negara Sederhana',
    satuan: 'm2',
    verificationStatus: {
      adpem: 'Disetujui',
      bappeda: 'Disetujui',
      bpkad: 'Menunggu',
    },
    nilaiBkf: 'Sudah',
    status: 'Sukses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
    createdBy: 'Muhammad Ismail',
    createdDate: '20-11-2024',
  },
  {
    id: '3',
    jenis: 'Pembangunan',
    uraian: 'Renovasi dan Perluasan Balai Kota',
    lokasi: 'Jl. Wastukencana No. 2, Bandung Wetan',
    klasifikasi: 'Rumah Negara Tipe A',
    satuan: 'm2',
    verificationStatus: {
      adpem: 'Disetujui',
      bappeda: 'Ditolak',
      bpkad: 'Belum',
    },
    nilaiBkf: 'Belum',
    status: 'Tolak',
    suratPermohonan: '/easb-document.pdf',
    createdBy: 'Anggito Anju',
    createdDate: '10-11-2024',
  },
  {
    id: '4',
    jenis: 'Pemeliharaan',
    uraian: 'Rehabilitasi Gedung DPRD 2 Lantai',
    lokasi: 'Jl. Diponegoro No. 10, Bandung',
    klasifikasi: 'Gedung Negara Sederhana',
    satuan: 'm2',
    verificationStatus: {
      adpem: 'Menunggu',
      bappeda: 'Belum',
      bpkad: 'Belum',
    },
    nilaiBkf: 'Sedang',
    status: 'Proses',
    suratPermohonan: '/easb-document.pdf',
    createdBy: 'Samarta Admin',
    createdDate: '25-11-2024',
  },
];

// Chart data - from API in production
const barChartData = [
  { name: 'Pembangunan', value: 8, color: '#ef4444' },
  { name: 'Pemeliharaan', value: 12, color: '#f59e0b' },
];

const donutChartData1 = [
  { name: 'Pembangunan', value: 25, color: '#ef4444' },
  { name: 'Pemeliharaan', value: 20, color: '#f59e0b' },
];

const donutChartData2 = [
  { name: 'Sukses', value: 40, color: '#3b82f6' },
  { name: 'Proses', value: 30, color: '#22c55e' },
  { name: 'Tolak', value: 30, color: '#84cc16' },
];

export default function UsulanBangunanGedungPage() {
  const router = useRouter();
  const [data, setData] = useState<UsulanBangunanGedung[]>(mockData);
  const [filteredData, setFilteredData] = useState<UsulanBangunanGedung[]>(mockData);

  // Load submitted usulan from localStorage on mount
  useEffect(() => {
    const loadSubmittedUsulan = () => {
      const submittedData = localStorage.getItem('submitted_usulan_list');
      if (submittedData) {
        try {
          const submissions = JSON.parse(submittedData);
          // Merge submitted data with mock data
          const combinedData = [...mockData, ...submissions];
          setData(combinedData);
          setFilteredData(combinedData);
        } catch (e) {
          console.error('Failed to load submitted usulan', e);
        }
      }
    };

    loadSubmittedUsulan();
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
              <DonutChart
                data={donutChartData1}
                height={260}
                showLegend={true}
                showLabels={false}
              />
            </div>
            <div className="relative">
              <DonutChart
                data={donutChartData2}
                height={260}
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