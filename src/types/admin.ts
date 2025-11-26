// Admin-specific types

export type UserRole = 'admin' | 'verifikator' | 'perangkat_daerah';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password: string; // In production, this would be hashed
  role: UserRole;
}

export interface CreateUserFormData {
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface CreateUserFormErrors {
  username?: string;
  password?: string;
  name?: string;
  role?: string;
}

// Role display names
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  verifikator: 'Verifikator',
  perangkat_daerah: 'Perangkat Daerah',
};

// Role badge colors
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  verifikator: 'bg-blue-100 text-blue-800 border-blue-200',
  perangkat_daerah: 'bg-teal-100 text-teal-800 border-teal-200',
};
