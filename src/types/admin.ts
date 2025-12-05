// Admin-specific types

export type UserRole = 'superadmin' | 'admin' | 'verifikator_opd' | 'verifikator_bappeda' | 'verifikator_bpkad' | 'perangkat_daerah';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password: string; // In production, this would be hashed
  role: UserRole;
  displayName?: string; // Optional display name separate from name
  jobPosition?: string; // User's job position/title
  avatar?: string; // Avatar URL or base64 data URL
}

export interface CreateUserFormData {
  username: string;
  password: string;
  name: string;
  role: UserRole[];
}

export interface CreateUserFormErrors {
  username?: string;
  password?: string;
  name?: string;
  role?: string;
}

// Role display names
export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  verifikator_opd: 'Verifikator OPD',
  verifikator_bappeda: 'Verifikator BAPPEDA',
  verifikator_bpkad: 'Verifikator BPKAD',
  perangkat_daerah: 'Perangkat Daerah',
};

// Role badge colors
export const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: 'bg-red-100 text-red-800 border-red-200',
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  verifikator_opd: 'bg-blue-100 text-blue-800 border-blue-200',
  verifikator_bappeda: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  verifikator_bpkad: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  perangkat_daerah: 'bg-teal-100 text-teal-800 border-teal-200',
};
