// Type definitions for Superadmin module management

export type ModuleType = 
  | 'fungsiRuang' 
  | 'jenis' 
  | 'klasifikasi'
  | 'komponenBangunanNonStandard'
  | 'komponenBangunanNonStandardPros'
  | 'komponenBangunanStandardPros'
  | 'komponenBangunanStandard'
  | 'lantai'
  | 'status'
  | 'tipeBangunan'
  | 'jenisStandar'
  | 'kabupatenKota'
  | 'opd'
  | 'provinsi'
  | 'rekening'
  | 'satuan'
  | 'shst';

export interface FungsiRuangData {
  id: number;
  nama_fungsi_ruang: string;
  koef: number;
  isActive: boolean;
}

export interface JenisData {
  id: number;
  jenis: string;
  asb: string;
}

export interface KlasifikasiData {
  id: number;
  idTipeBangunan: number;
  klasifikasi: string;
}

export interface KomponenBangunanNonStandardData {
  id: number;
  komponen: string;
  files: string;
  idJenis: number;
  idTipeBangunan: number;
}

export interface KomponenBangunanNonStandardProsData {
  id: number;
  idKomponenBangunanNonStandard: number;
  min: number;
  max: number;
  avgMin: number;
  avg: number;
  avgMax: number;
}

export interface KomponenBangunanStandardProsData {
  id: number;
  idKomponenBangunanStandard: number;
  min: number;
  max: number;
  avgMin: number;
  avg: number;
  avgMax: number;
}

export interface KomponenBangunanStandardData {
  id: number;
  komponen: string;
  idJenis: number;
  idTipeBangunan: number;
}

export interface LantaiData {
  id: number;
  lantai: string;
  tipe: string;
  koefisien: number;
  idSatuan: number;
}

export interface StatusData {
  id: number;
  status: string;
}

export interface TipeBangunanData {
  id: number;
  tipeBangunan: string;
}

export interface JenisStandarData {
  id: number;
  jenis: string;
}

export interface KabupatenKotaData {
  id: number;
  kode: string;
  namaKota: string;
  idProvinsi: number;
  aktif: boolean;
}

export interface OPDData {
  id: number;
  opd: string;
  alias: string;
  idUser: number;
}

export interface ProvinsiData {
  id: number;
  kode: string;
  namaProvinsi: string;
  aktif: boolean;
}

export interface RekeningData {
  id: number;
  rekeningKode: string;
  rekeningUraian: string;
}

export interface SatuanData {
  id: number;
  satuan: string;
  aktif: boolean;
}

export interface SHSTData {
  id: number;
  tahun: string;
  idTipeBangunan: number;
  idKlasifikasi: number;
  idKabupatenKota: number;
  nominal: number;
  dokumen: string;
}

export interface ModuleOption {
  value: ModuleType;
  label: string;
}
