// Types for Usulan Bangunan Gedung
export interface UsulanBangunanGedung {
  id: string;
  jenis: 'Pembangunan' | 'Pemeliharaan';
  uraian: string;
  lokasi: string;
  klasifikasi: string;
  satuan: string;
  nilaiBkf: number;
  sumberPembiayaan: 'APBD' | 'APBN' | 'Lainnya';
  status: 'Sukses' | 'Tolak' | 'Proses' | 'Draft';
  suratPermohonan?: string;
  suratRekomendasi?: string;
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