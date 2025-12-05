'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Shield, Plus, Database } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import Superadmin components
import type { ModuleType, FungsiRuangData, JenisData, KlasifikasiData, KomponenBangunanNonStandardData, KomponenBangunanNonStandardProsData, KomponenBangunanStandardProsData, KomponenBangunanStandardData, LantaiData, StatusData, TipeBangunanData, JenisStandarData, KabupatenKotaData, OPDData, ProvinsiData, RekeningData, SatuanData, SHSTData, ModuleOption } from '@/components/SuperAdmin/types';
import ModuleSelector from '@/components/SuperAdmin/ModuleSelector';
import FungsiRuangTable from '@/components/SuperAdmin/tables/FungsiRuangTable';
import GenericModuleTable from '@/components/SuperAdmin/tables/GenericModuleTable';

const AdminUsersTable = dynamic(() => import('@/components/Admin/AdminUsersTable'), {
  ssr: false,
});

export default function SuperAdminPage() {
  const router = useRouter();
  
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data states
  const [fungsiRuangData, setFungsiRuangData] = useState<FungsiRuangData[]>([
    { id: 1, nama_fungsi_ruang: 'Ruang Kelas', koef: 1.2, isActive: true },
  ]);

  const [jenisData, setJenisData] = useState<JenisData[]>([
    { id: 1, jenis: 'Permanen', asb: 'ASB-001' },
  ]);

  const [klasifikasiData, setKlasifikasiData] = useState<KlasifikasiData[]>([
    { id: 1, idTipeBangunan: 1, klasifikasi: 'Gedung Pendidikan' },
  ]);

  const [komponenBangunanNonStandardData, setKomponenBangunanNonStandardData] = useState<KomponenBangunanNonStandardData[]>([
    { id: 1, komponen: 'Atap Baja Ringan', files: 'atap_001.pdf', idJenis: 1, idTipeBangunan: 1 },
  ]);

  const [komponenBangunanNonStandardProsData, setKomponenBangunanNonStandardProsData] = useState<KomponenBangunanNonStandardProsData[]>([
    { id: 1, idKomponenBangunanNonStandard: 1, min: 100, max: 500, avgMin: 200, avg: 300, avgMax: 400 },
  ]);

  const [komponenBangunanStandardProsData, setKomponenBangunanStandardProsData] = useState<KomponenBangunanStandardProsData[]>([
    { id: 1, idKomponenBangunanStandard: 1, min: 150, max: 600, avgMin: 250, avg: 400, avgMax: 500 },
  ]);

  const [komponenBangunanStandardData, setKomponenBangunanStandardData] = useState<KomponenBangunanStandardData[]>([
    { id: 1, komponen: 'Pondasi Beton', idJenis: 1, idTipeBangunan: 1 },
  ]);

  const [lantaiData, setLantaiData] = useState<LantaiData[]>([
    { id: 1, lantai: 'Lantai 1', tipe: 'Keramik', koefisien: 1.0, idSatuan: 1 },
  ]);

  const [statusData, setStatusData] = useState<StatusData[]>([
    { id: 1, status: 'Active' },
    { id: 2, status: 'Inactive' },
  ]);

  const [tipeBangunanData, setTipeBangunanData] = useState<TipeBangunanData[]>([
    { id: 1, tipeBangunan: 'Sekolah' },
    { id: 2, tipeBangunan: 'Kantor' },
  ]);

  const [jenisStandarData, setJenisStandarData] = useState<JenisStandarData[]>([
    { id: 1, jenis: 'Standar A' },
  ]);

  const [kabupatenKotaData, setKabupatenKotaData] = useState<KabupatenKotaData[]>([
    { id: 1, kode: '3201', namaKota: 'Kota Bogor', idProvinsi: 32, aktif: true },
  ]);

  const [opdData, setOpdData] = useState<OPDData[]>([
    { id: 1, opd: 'Dinas Pendidikan', alias: 'Diknas', idUser: 1 },
  ]);

  const [provinsiData, setProvinsiData] = useState<ProvinsiData[]>([
    { id: 1, kode: '32', namaProvinsi: 'Jawa Barat', aktif: true },
  ]);

  const [rekeningData, setRekeningData] = useState<RekeningData[]>([
    { id: 1, rekeningKode: '5.1.1.01', rekeningUraian: 'Belanja Pegawai' },
  ]);

  const [satuanData, setSatuanData] = useState<SatuanData[]>([
    { id: 1, satuan: 'm²', aktif: true },
    { id: 2, satuan: 'm³', aktif: true },
  ]);

  const [shstData, setSHSTData] = useState<SHSTData[]>([
    { id: 1, tahun: '2024', idTipeBangunan: 1, idKlasifikasi: 1, idKabupatenKota: 1, nominal: 1000000, dokumen: 'shst_2024.pdf' },
  ]);

  // Fetch Fungsi Ruang data - memoized to prevent unnecessary re-renders
  const fetchFungsiRuangData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/superadmin/fungsi-ruang', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        method: 'GET',
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        // Assuming API returns data in format { data: [...] } or similar
        setFungsiRuangData(data.data.data || data);
      } else {
        console.error('Failed to fetch fungsi ruang data');
      }
    } catch (error) {
      console.error('Error fetching fungsi ruang:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it only uses setters

  // Fetch Fungsi Ruang data on component mount or when module changes
  useEffect(() => {
    if (selectedModule === 'fungsiRuang') {
      fetchFungsiRuangData();
    }
  }, [selectedModule, fetchFungsiRuangData]);

  // Memoized update function for Fungsi Ruang editing
  const updateFungsiRuangItem = useCallback((id: number, field: keyof FungsiRuangData, value: any) => {
    setFungsiRuangData(prevData => 
      prevData.map(item => item.id === id ? { ...item, [field]: value } : item)
    );
  }, []);

  // New row templates
  const [newFungsiRuang, setNewFungsiRuang] = useState<FungsiRuangData>({ id: 0, nama_fungsi_ruang: '', koef: 0, isActive: true });
  const [newJenis, setNewJenis] = useState<JenisData>({ id: 0, jenis: '', asb: '' });
  const [newKlasifikasi, setNewKlasifikasi] = useState<KlasifikasiData>({ id: 0, idTipeBangunan: 0, klasifikasi: '' });
  const [newKomponenBangunanNonStandard, setNewKomponenBangunanNonStandard] = useState<KomponenBangunanNonStandardData>({ id: 0, komponen: '', files: '', idJenis: 0, idTipeBangunan: 0 });
  const [newKomponenBangunanNonStandardPros, setNewKomponenBangunanNonStandardPros] = useState<KomponenBangunanNonStandardProsData>({ id: 0, idKomponenBangunanNonStandard: 0, min: 0, max: 0, avgMin: 0, avg: 0, avgMax: 0 });
  const [newKomponenBangunanStandardPros, setNewKomponenBangunanStandardPros] = useState<KomponenBangunanStandardProsData>({ id: 0, idKomponenBangunanStandard: 0, min: 0, max: 0, avgMin: 0, avg: 0, avgMax: 0 });
  const [newKomponenBangunanStandard, setNewKomponenBangunanStandard] = useState<KomponenBangunanStandardData>({ id: 0, komponen: '', idJenis: 0, idTipeBangunan: 0 });
  const [newLantai, setNewLantai] = useState<LantaiData>({ id: 0, lantai: '', tipe: '', koefisien: 0, idSatuan: 0 });
  const [newStatus, setNewStatus] = useState<StatusData>({ id: 0, status: '' });
  const [newTipeBangunan, setNewTipeBangunan] = useState<TipeBangunanData>({ id: 0, tipeBangunan: '' });
  const [newJenisStandar, setNewJenisStandar] = useState<JenisStandarData>({ id: 0, jenis: '' });
  const [newKabupatenKota, setNewKabupatenKota] = useState<KabupatenKotaData>({ id: 0, kode: '', namaKota: '', idProvinsi: 0, aktif: true });
  const [newOPD, setNewOPD] = useState<OPDData>({ id: 0, opd: '', alias: '', idUser: 0 });
  const [newProvinsi, setNewProvinsi] = useState<ProvinsiData>({ id: 0, kode: '', namaProvinsi: '', aktif: true });
  const [newRekening, setNewRekening] = useState<RekeningData>({ id: 0, rekeningKode: '', rekeningUraian: '' });
  const [newSatuan, setNewSatuan] = useState<SatuanData>({ id: 0, satuan: '', aktif: true });
  const [newSHST, setNewSHST] = useState<SHSTData>({ id: 0, tahun: '', idTipeBangunan: 0, idKlasifikasi: 0, idKabupatenKota: 0, nominal: 0, dokumen: '' });

  const modules: ModuleOption[] = [
    { value: 'fungsiRuang' as ModuleType, label: 'Fungsi Ruang Module' },
    { value: 'jenis' as ModuleType, label: 'Jenis Module' },
    { value: 'klasifikasi' as ModuleType, label: 'Klasifikasi Module' },
    { value: 'komponenBangunanNonStandard' as ModuleType, label: 'Komponen Bangunan Non Standard Module' },
    { value: 'komponenBangunanNonStandardPros' as ModuleType, label: 'Komponen Bangunan Non Standard Pros Module' },
    { value: 'komponenBangunanStandardPros' as ModuleType, label: 'Komponen Bangunan Standard Pros Module' },
    { value: 'komponenBangunanStandard' as ModuleType, label: 'Komponen Bangunan Standard Module' },
    { value: 'lantai' as ModuleType, label: 'Lantai Module' },
    { value: 'status' as ModuleType, label: 'Status Module' },
    { value: 'tipeBangunan' as ModuleType, label: 'Tipe Bangunan Module' },
    { value: 'jenisStandar' as ModuleType, label: 'Jenis Standar Module' },
    { value: 'kabupatenKota' as ModuleType, label: 'Kabupaten dan Kota Module' },
    { value: 'opd' as ModuleType, label: 'OPD Module' },
    { value: 'provinsi' as ModuleType, label: 'Province Module' },
    { value: 'rekening' as ModuleType, label: 'Rekening Module' },
    { value: 'satuan' as ModuleType, label: 'Satuan Module' },
    { value: 'shst' as ModuleType, label: 'SHST Module' },
  ];

  const handleModuleSelect = (module: ModuleType) => {
    setSelectedModule(module);
    setIsDropdownOpen(false);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => setIsAdding(true);
  const handleCancelAdd = () => setIsAdding(false);
  const handleEdit = (id: number) => {
    setEditingId(id);
    setIsAdding(false);
  };
  const handleCancelEdit = () => setEditingId(null);
  
  const handleSaveEdit = async (id: number) => {
    if (selectedModule === 'fungsiRuang') {
      setLoading(true);
      try {
        const itemToUpdate = fungsiRuangData.find(item => item.id === id);
        if (!itemToUpdate) return;

        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/superadmin/fungsi-ruang', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: itemToUpdate.id,
            nama_fungsi_ruang: itemToUpdate.nama_fungsi_ruang,
            koef: itemToUpdate.koef,
            isActive: itemToUpdate.isActive,
          }),
        });
        
        if (response.ok) {
          await fetchFungsiRuangData(); // Refresh data
          setEditingId(null);
        } else {
          console.error('Failed to update fungsi ruang');
        }
      } catch (error) {
        console.error('Error updating fungsi ruang:', error);
      } finally {
        setLoading(false);
      }
      return;
    }
    setEditingId(null);
  };

  const handleSaveNew = async () => {
    const getNextId = (data: any[]) => Math.max(...data.map(d => d.id), 0) + 1;
    
    if (selectedModule === 'fungsiRuang') {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/superadmin/fungsi-ruang', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            nama_fungsi_ruang: newFungsiRuang.nama_fungsi_ruang,
            koef: newFungsiRuang.koef,
            isActive: newFungsiRuang.isActive,
          }),
        });
        
        if (response.ok) {
          await fetchFungsiRuangData(); // Refresh data
          setNewFungsiRuang({ id: 0, nama_fungsi_ruang: '', koef: 0, isActive: true });
          setIsAdding(false);
        } else {
          console.error('Failed to create fungsi ruang');
        }
      } catch (error) {
        console.error('Error creating fungsi ruang:', error);
      } finally {
        setLoading(false);
      }
      return;

      
    } else if (selectedModule === 'jenis') {
      setJenisData([...jenisData, { ...newJenis, id: getNextId(jenisData) }]);
      setNewJenis({ id: 0, jenis: '', asb: '' });
    } else if (selectedModule === 'klasifikasi') {
      setKlasifikasiData([...klasifikasiData, { ...newKlasifikasi, id: getNextId(klasifikasiData) }]);
      setNewKlasifikasi({ id: 0, idTipeBangunan: 0, klasifikasi: '' });
    } else if (selectedModule === 'komponenBangunanNonStandard') {
      setKomponenBangunanNonStandardData([...komponenBangunanNonStandardData, { ...newKomponenBangunanNonStandard, id: getNextId(komponenBangunanNonStandardData) }]);
      setNewKomponenBangunanNonStandard({ id: 0, komponen: '', files: '', idJenis: 0, idTipeBangunan: 0 });
    } else if (selectedModule === 'komponenBangunanNonStandardPros') {
      setKomponenBangunanNonStandardProsData([...komponenBangunanNonStandardProsData, { ...newKomponenBangunanNonStandardPros, id: getNextId(komponenBangunanNonStandardProsData) }]);
      setNewKomponenBangunanNonStandardPros({ id: 0, idKomponenBangunanNonStandard: 0, min: 0, max: 0, avgMin: 0, avg: 0, avgMax: 0 });
    } else if (selectedModule === 'komponenBangunanStandardPros') {
      setKomponenBangunanStandardProsData([...komponenBangunanStandardProsData, { ...newKomponenBangunanStandardPros, id: getNextId(komponenBangunanStandardProsData) }]);
      setNewKomponenBangunanStandardPros({ id: 0, idKomponenBangunanStandard: 0, min: 0, max: 0, avgMin: 0, avg: 0, avgMax: 0 });
    } else if (selectedModule === 'komponenBangunanStandard') {
      setKomponenBangunanStandardData([...komponenBangunanStandardData, { ...newKomponenBangunanStandard, id: getNextId(komponenBangunanStandardData) }]);
      setNewKomponenBangunanStandard({ id: 0, komponen: '', idJenis: 0, idTipeBangunan: 0 });
    } else if (selectedModule === 'lantai') {
      setLantaiData([...lantaiData, { ...newLantai, id: getNextId(lantaiData) }]);
      setNewLantai({ id: 0, lantai: '', tipe: '', koefisien: 0, idSatuan: 0 });
    } else if (selectedModule === 'status') {
      setStatusData([...statusData, { ...newStatus, id: getNextId(statusData) }]);
      setNewStatus({ id: 0, status: '' });
    } else if (selectedModule === 'tipeBangunan') {
      setTipeBangunanData([...tipeBangunanData, { ...newTipeBangunan, id: getNextId(tipeBangunanData) }]);
      setNewTipeBangunan({ id: 0, tipeBangunan: '' });
    } else if (selectedModule === 'jenisStandar') {
      setJenisStandarData([...jenisStandarData, { ...newJenisStandar, id: getNextId(jenisStandarData) }]);
      setNewJenisStandar({ id: 0, jenis: '' });
    } else if (selectedModule === 'kabupatenKota') {
      setKabupatenKotaData([...kabupatenKotaData, { ...newKabupatenKota, id: getNextId(kabupatenKotaData) }]);
      setNewKabupatenKota({ id: 0, kode: '', namaKota: '', idProvinsi: 0, aktif: true });
    } else if (selectedModule === 'opd') {
      setOpdData([...opdData, { ...newOPD, id: getNextId(opdData) }]);
      setNewOPD({ id: 0, opd: '', alias: '', idUser: 0 });
    } else if (selectedModule === 'provinsi') {
      setProvinsiData([...provinsiData, { ...newProvinsi, id: getNextId(provinsiData) }]);
      setNewProvinsi({ id: 0, kode: '', namaProvinsi: '', aktif: true });
    } else if (selectedModule === 'rekening') {
      setRekeningData([...rekeningData, { ...newRekening, id: getNextId(rekeningData) }]);
      setNewRekening({ id: 0, rekeningKode: '', rekeningUraian: '' });
    } else if (selectedModule === 'satuan') {
      setSatuanData([...satuanData, { ...newSatuan, id: getNextId(satuanData) }]);
      setNewSatuan({ id: 0, satuan: '', aktif: true });
    } else if (selectedModule === 'shst') {
      setSHSTData([...shstData, { ...newSHST, id: getNextId(shstData) }]);
      setNewSHST({ id: 0, tahun: '', idTipeBangunan: 0, idKlasifikasi: 0, idKabupatenKota: 0, nominal: 0, dokumen: '' });
    }
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    if (selectedModule === 'fungsiRuang') {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/superadmin/fungsi-ruang?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          await fetchFungsiRuangData(); // Refresh data
        } else {
          console.error('Failed to delete fungsi ruang');
        }
      } catch (error) {
        console.error('Error deleting fungsi ruang:', error);
      } finally {
        setLoading(false);
      }
      return;
    }
    else if (selectedModule === 'jenis') setJenisData(jenisData.filter(d => d.id !== id));
    else if (selectedModule === 'klasifikasi') setKlasifikasiData(klasifikasiData.filter(d => d.id !== id));
    else if (selectedModule === 'komponenBangunanNonStandard') setKomponenBangunanNonStandardData(komponenBangunanNonStandardData.filter(d => d.id !== id));
    else if (selectedModule === 'komponenBangunanNonStandardPros') setKomponenBangunanNonStandardProsData(komponenBangunanNonStandardProsData.filter(d => d.id !== id));
    else if (selectedModule === 'komponenBangunanStandardPros') setKomponenBangunanStandardProsData(komponenBangunanStandardProsData.filter(d => d.id !== id));
    else if (selectedModule === 'komponenBangunanStandard') setKomponenBangunanStandardData(komponenBangunanStandardData.filter(d => d.id !== id));
    else if (selectedModule === 'lantai') setLantaiData(lantaiData.filter(d => d.id !== id));
    else if (selectedModule === 'status') setStatusData(statusData.filter(d => d.id !== id));
    else if (selectedModule === 'tipeBangunan') setTipeBangunanData(tipeBangunanData.filter(d => d.id !== id));
    else if (selectedModule === 'jenisStandar') setJenisStandarData(jenisStandarData.filter(d => d.id !== id));
    else if (selectedModule === 'kabupatenKota') setKabupatenKotaData(kabupatenKotaData.filter(d => d.id !== id));
    else if (selectedModule === 'opd') setOpdData(opdData.filter(d => d.id !== id));
    else if (selectedModule === 'provinsi') setProvinsiData(provinsiData.filter(d => d.id !== id));
    else if (selectedModule === 'rekening') setRekeningData(rekeningData.filter(d => d.id !== id));
    else if (selectedModule === 'satuan') setSatuanData(satuanData.filter(d => d.id !== id));
    else if (selectedModule === 'shst') setSHSTData(shstData.filter(d => d.id !== id));
  };

  // Render functions for each module type
  const renderFungsiRuangTable = () => {
    return (
      <FungsiRuangTable
        data={fungsiRuangData}
        editingId={editingId}
        onUpdate={updateFungsiRuangItem}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        isAdding={isAdding}
        newRow={newFungsiRuang}
        onNewRowChange={(field, value) => setNewFungsiRuang({...newFungsiRuang, [field]: value})}
        onSaveNew={handleSaveNew}
        onCancelAdd={handleCancelAdd}
      />
    );
  };



  // Due to length constraints, I'll create a helper to render the remaining 13 modules
  const renderModuleTable = () => {
    switch(selectedModule) {
      case 'fungsiRuang': return renderFungsiRuangTable();
      case 'jenis': 
        return (
          <GenericModuleTable
            data={jenisData}
            setData={setJenisData}
            headers={['Jenis', 'ASB']}
            fields={['jenis', 'asb']}
            types={['text', 'text']}
            newItem={newJenis}
            setNewItem={setNewJenis}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );
      case 'klasifikasi': 
        return (
          <GenericModuleTable
            data={klasifikasiData}
            setData={setKlasifikasiData}
            headers={['ID Tipe Bangunan', 'Klasifikasi']}
            fields={['idTipeBangunan', 'klasifikasi']}
            types={['number', 'text']}
            newItem={newKlasifikasi}
            setNewItem={setNewKlasifikasi}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );
      
      case 'komponenBangunanNonStandard':
        return (
          <GenericModuleTable
            data={komponenBangunanNonStandardData}
            setData={setKomponenBangunanNonStandardData}
            headers={['Komponen', 'Files', 'ID Jenis', 'ID Tipe Bangunan']}
            fields={['komponen', 'files', 'idJenis', 'idTipeBangunan']}
            types={['text', 'text', 'number', 'number']}
            newItem={newKomponenBangunanNonStandard}
            setNewItem={setNewKomponenBangunanNonStandard}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'komponenBangunanNonStandardPros':
        return (
          <GenericModuleTable
            data={komponenBangunanNonStandardProsData}
            setData={setKomponenBangunanNonStandardProsData}
            headers={['ID Komponen Non Standard', 'Min', 'Max', 'Avg Min', 'Avg', 'Avg Max']}
            fields={['idKomponenBangunanNonStandard', 'min', 'max', 'avgMin', 'avg', 'avgMax']}
            types={['number', 'number', 'number', 'number', 'number', 'number']}
            newItem={newKomponenBangunanNonStandardPros}
            setNewItem={setNewKomponenBangunanNonStandardPros}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'komponenBangunanStandardPros':
        return (
          <GenericModuleTable
            data={komponenBangunanStandardProsData}
            setData={setKomponenBangunanStandardProsData}
            headers={['ID Komponen Standard', 'Min', 'Max', 'Avg Min', 'Avg', 'Avg Max']}
            fields={['idKomponenBangunanStandard', 'min', 'max', 'avgMin', 'avg', 'avgMax']}
            types={['number', 'number', 'number', 'number', 'number', 'number']}
            newItem={newKomponenBangunanStandardPros}
            setNewItem={setNewKomponenBangunanStandardPros}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'komponenBangunanStandard':
        return (
          <GenericModuleTable
            data={komponenBangunanStandardData}
            setData={setKomponenBangunanStandardData}
            headers={['Komponen', 'ID Jenis', 'ID Tipe Bangunan']}
            fields={['komponen', 'idJenis', 'idTipeBangunan']}
            types={['text', 'number', 'number']}
            newItem={newKomponenBangunanStandard}
            setNewItem={setNewKomponenBangunanStandard}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'lantai':
        return (
          <GenericModuleTable
            data={lantaiData}
            setData={setLantaiData}
            headers={['Lantai', 'Tipe', 'Koefisien', 'ID Satuan']}
            fields={['lantai', 'tipe', 'koefisien', 'idSatuan']}
            types={['text', 'text', 'number', 'number']}
            newItem={newLantai}
            setNewItem={setNewLantai}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'status':
        return (
          <GenericModuleTable
            data={statusData}
            setData={setStatusData}
            headers={['Status']}
            fields={['status']}
            types={['text']}
            newItem={newStatus}
            setNewItem={setNewStatus}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'tipeBangunan':
        return (
          <GenericModuleTable
            data={tipeBangunanData}
            setData={setTipeBangunanData}
            headers={['Tipe Bangunan']}
            fields={['tipeBangunan']}
            types={['text']}
            newItem={newTipeBangunan}
            setNewItem={setNewTipeBangunan}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'jenisStandar':
        return (
          <GenericModuleTable
            data={jenisStandarData}
            setData={setJenisStandarData}
            headers={['Jenis']}
            fields={['jenis']}
            types={['text']}
            newItem={newJenisStandar}
            setNewItem={setNewJenisStandar}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'kabupatenKota':
        return (
          <GenericModuleTable
            data={kabupatenKotaData}
            setData={setKabupatenKotaData}
            headers={['Kode', 'Nama Kota', 'ID Provinsi', 'Aktif']}
            fields={['kode', 'namaKota', 'idProvinsi', 'aktif']}
            types={['text', 'text', 'number', 'boolean']}
            newItem={newKabupatenKota}
            setNewItem={setNewKabupatenKota}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'opd':
        return (
          <GenericModuleTable
            data={opdData}
            setData={setOpdData}
            headers={['OPD', 'Alias', 'ID User']}
            fields={['opd', 'alias', 'idUser']}
            types={['text', 'text', 'number']}
            newItem={newOPD}
            setNewItem={setNewOPD}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'provinsi':
        return (
          <GenericModuleTable
            data={provinsiData}
            setData={setProvinsiData}
            headers={['Kode', 'Nama Provinsi', 'Aktif']}
            fields={['kode', 'namaProvinsi', 'aktif']}
            types={['text', 'text', 'boolean']}
            newItem={newProvinsi}
            setNewItem={setNewProvinsi}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'rekening':
        return (
          <GenericModuleTable
            data={rekeningData}
            setData={setRekeningData}
            headers={['Kode Rekening', 'Uraian Rekening']}
            fields={['rekeningKode', 'rekeningUraian']}
            types={['text', 'text']}
            newItem={newRekening}
            setNewItem={setNewRekening}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'satuan':
        return (
          <GenericModuleTable
            data={satuanData}
            setData={setSatuanData}
            headers={['Satuan', 'Aktif']}
            fields={['satuan', 'aktif']}
            types={['text', 'boolean']}
            newItem={newSatuan}
            setNewItem={setNewSatuan}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      case 'shst':
        return (
          <GenericModuleTable
            data={shstData}
            setData={setSHSTData}
            headers={['Tahun', 'ID Tipe Bangunan', 'ID Klasifikasi', 'ID Kabupaten Kota', 'Nominal', 'Dokumen']}
            fields={['tahun', 'idTipeBangunan', 'idKlasifikasi', 'idKabupatenKota', 'nominal', 'dokumen']}
            types={['text', 'number', 'number', 'number', 'number', 'text']}
            newItem={newSHST}
            setNewItem={setNewSHST}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isAdding={isAdding}
            onSaveNew={handleSaveNew}
            onCancelAdd={handleCancelAdd}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola akun administrator dan module sistem</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/superadmin/tambah')}
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Tambah Admin
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Super Admin Access</h3>
            <p className="text-sm text-red-700 mt-1">Anda memiliki akses penuh untuk mengelola akun administrator. Gunakan dengan bijak.</p>
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Administrator</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola akun administrator sistem</p>
        </div>
        <AdminUsersTable />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 my-8"></div>

      {/* Module Management Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Module Management</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola data module sistem - 17 Modules Available</p>
          </div>
        </div>

        {/* Module Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Pilih Module:</label>
            <div className="flex-1 max-w-md">
              <ModuleSelector
                modules={modules}
                selectedModule={selectedModule}
                isOpen={isDropdownOpen}
                onSelect={handleModuleSelect}
                onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        {selectedModule && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {modules.find(m => m.value === selectedModule)?.label}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola data {modules.find(m => m.value === selectedModule)?.label.toLowerCase()}
                </p>
              </div>
              {!isAdding && !editingId && (
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Data
                </button>
              )}
            </div>
            <div>{renderModuleTable()}</div>
          </div>
        )}

        {/* Empty State */}
        {!selectedModule && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Module</h3>
            <p className="text-sm text-gray-500">
              Pilih module dari dropdown di atas untuk mulai mengelola data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
