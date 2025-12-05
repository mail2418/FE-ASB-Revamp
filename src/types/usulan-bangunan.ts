// Types for Usulan Bangunan Gedung

export type VerificationStatus = 'Belum' | 'Disetujui' | 'Ditolak' | 'Menunggu';

export interface VerificationStages {
  opd: VerificationStatus;
  bappeda: VerificationStatus;
  bpkad: VerificationStatus;
}

export interface UsulanBangunanGedung {
  id: string;
  jenis: string;
  uraian: string;
  lokasi: string;
  klasifikasi: string;
  satuan: string;
  verificationStatus: VerificationStages;
  nilaiBkf?: string;
  status: string;
  suratPermohonan?: string;
  suratRekomendasi?: string;
  createdBy?: string;
  createdDate?: string;
  tenggatDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FilterUsulanBangunan {
  search?: string;
  jenis?: 'all' | 'Pembangunan' | 'Pemeliharaan';
  status?: 'all' | 'Sukses' | 'Tolak' | 'Proses' | 'Draft';
  klasifikasi?: string;
  lokasi?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ChartDataBangunan {
  name: string;
  value: number;
  color?: string;
}

export interface StatusSummary {
  total: number;
  sukses: number;
  tolak: number;
  proses: number;
  draft: number;
}