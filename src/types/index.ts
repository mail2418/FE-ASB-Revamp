// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Dashboard types
export interface DashboardData {
  usulan: UsulanData[];
  statistics: Statistics;
  chartData: ChartData[];
  statusData: StatusData;
}

export interface UsulanData {
  id: string;
  jenis: string;
  namaAsb?: string;
  status: string;
  idAsbStatus?: number;
  idVerifikatorAdpem?: number | null;
  idVerifikatorBappeda?: number | null;
  idVerifikatorBpkad?: number | null;
  suratPermohonan?: string;
  suratRekomendasi?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Statistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  inProgress: number;
}

export interface ChartData {
  name: string;
  value: number;
  label?: string;
}

export interface StatusData {
  item1: StatusItem;
  item2: StatusItem;
  item3: StatusItem;
}

export interface StatusItem {
  value: number;
  percentage: number;
  label: string;
  color: string;
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  children?: NavItem[];
}

// Filter types
export interface FilterOptions {
  search?: string;
  status?: string;
  jenis?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'date' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Table column type
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
}

// Pagination types
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}