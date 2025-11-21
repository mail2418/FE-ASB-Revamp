'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, CheckCircle2, MapPin, Layers } from 'lucide-react';

interface BasicFormData {
  jenisBangunan: string;
  namaBangunan: string;
  alamat: string;
  kodeRekening: string;
  desktipAktivitas: string;
}

interface FloorData {
  id: string;
  name: string;
  area: string;
  function: string;
}

export default function SummaryPage() {
  const router = useRouter();
  const [basicData, setBasicData] = useState<BasicFormData | null>(null);
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [standardComponents, setStandardComponents] = useState<any>({});
  const [nonStandardComponents, setNonStandardComponents] = useState<any>({});

  useEffect(() => {
    // Load all data from localStorage
    const savedBasic = localStorage.getItem('usulan_bangunan_new_entry');
    const savedStandard = localStorage.getItem('usulan_bangunan_standar_components');
    const savedNonStandard = localStorage.getItem('usulan_bangunan_nonstandar_components');

    if (savedBasic) {
      try {
        const parsed = JSON.parse(savedBasic);
        setBasicData(parsed.formData || null);
        setFloors(parsed.floors || []);
      } catch (e) {
        console.error('Failed to parse basic data', e);
      }
    }

    if (savedStandard) {
      try {
        setStandardComponents(JSON.parse(savedStandard));
      } catch (e) {
        console.error('Failed to parse standard components', e);
      }
    }

    if (savedNonStandard) {
      try {
        setNonStandardComponents(JSON.parse(savedNonStandard));
      } catch (e) {
        console.error('Failed to parse non-standard components', e);
      }
    }
  }, []);

  // Calculate totals
  const totalArea = floors.reduce((sum, floor) => sum + (parseFloat(floor.area) || 0), 0);
  const standardPercentageAvg = Object.values(standardComponents).reduce((sum: number, comp: any) => 
    sum + (comp?.percentage || 0), 0) / (Object.keys(standardComponents).length || 1);
  const nonStandardPercentageAvg = Object.values(nonStandardComponents).reduce((sum: number, comp: any) => 
    sum + (comp?.percentage || 0), 0) / (Object.keys(nonStandardComponents).length || 1);

  const handleVerify = () => {
    // Navigate back to usulan list or trigger verification
    router.push('/usulan/bangunan-gedung');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Summary Executive</h1>
          <p className="text-gray-600">Ringkasan lengkap usulan bangunan gedung</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Classification Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Klasifikasi</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-medium">
                  {basicData?.jenisBangunan || 'Gedung Negara Tidak Sederhana'}
                </div>
              </div>
            </div>

            {/* Financial Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Nilai ASB</label>
                  <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    Rp 5.600.000 / m²
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">KLB</label>
                    <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                      1.12
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">KFB</label>
                    <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                      1.12
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Luas Total</label>
                  <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {totalArea.toFixed(0)} m²
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Bobot Rata-rata</label>
                  <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {standardPercentageAvg.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Code & Budget Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Kode Rekening</label>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-mono mt-1">
                    {basicData?.kodeRekening || '1.01.012.15.0001'}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Pagu Perencanaan</label>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    Rp x.xxx.xxx.xxx
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Pagu Pengawasan</label>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    Rp x.xxx.xxx.xxx
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Building Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Informasi Bangunan</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Nama Bangunan</label>
                  <p className="text-gray-900 font-medium mt-1">{basicData?.namaBangunan || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Alamat</label>
                  <p className="text-gray-900 font-medium mt-1">{basicData?.alamat || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Deskripsi Aktivitas</label>
                  <p className="text-gray-900 font-medium mt-1">{basicData?.desktipAktivitas || '-'}</p>
                </div>
              </div>
            </div>

            {/* Floors Table */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-6 h-6 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Detail Lantai</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lantai</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Luas</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fungsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {floors.map((floor, index) => (
                      <tr key={floor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{floor.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{floor.area} m²</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{floor.function}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Components Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Components */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Komponen Standar</h3>
                <div className="space-y-2">
                  {Object.entries(standardComponents).slice(0, 5).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 capitalize">{key.replace('row_', '').replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-teal-600">{value?.percentage || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Standard Components */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Komponen Non-Standar</h3>
                <div className="space-y-2">
                  {Object.entries(nonStandardComponents).slice(0, 5).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 capitalize">{key.replace('row_', '').replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-orange-600">{value?.percentage || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verify Button */}
            <div className="flex justify-end">
              <button
                onClick={handleVerify}
                className="flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all shadow-lg hover:shadow-xl font-semibold text-lg cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                Verifikasi Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
