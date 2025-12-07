// Types for Usulan Bangunan Gedung

export type VerificationStatus = 'Belum' | 'Disetujui' | 'Ditolak' | 'Menunggu';

export interface VerificationStages {
  adpem: VerificationStatus;
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
  status?: string;
  statusInfo?: string; // Detailed status from STATUS_ID_MAP
  idAsbStatus?: number; // Raw status ID for conditional logic
  idVerifikatorAdpem?: number | null;
  idVerifikatorBappeda?: number | null;
  idVerifikatorBpkad?: number | null;
  rejectReason?: string | null; // Rejection reason when status is 7
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