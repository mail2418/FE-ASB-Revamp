'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CreateUserFormData, CreateUserFormErrors } from '@/types/admin';
import { userService } from '@/lib/user-service';
import { Eye, EyeOff, Save, X } from 'lucide-react';

interface AddAdminFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddAdminForm({ onSuccess, onCancel }: AddAdminFormProps) {
  const router = useRouter();
  const [formData, setFormData] = React.useState<CreateUserFormData>({
    username: '',
    password: '',
    name: '',
    role: 'admin', // Always admin for this form
  });
  const [errors, setErrors] = React.useState<CreateUserFormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: CreateUserFormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      newErrors.username = 'Username hanya boleh mengandung huruf, angka, dan karakter ._-';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password harus mengandung huruf besar, huruf kecil, dan angka';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof CreateUserFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setSubmitError('Tidak ada token autentikasi. Silakan login kembali.');
        setIsSubmitting(false);
        return;
      }

      // Call the API endpoint
      const response = await fetch('/api/superadmin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          roles: formData.role, // Send role as "roles" to match API expectation
        }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        // Success - redirect or call onSuccess
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/superadmin');
        }
      } else {
        // Handle error from API
        setSubmitError(data.error || data.message || 'Gagal membuat admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setSubmitError('Terjadi kesalahan saat membuat admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/superadmin');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-700">
          <strong>Info:</strong> Anda sedang membuat akun administrator. Admin memiliki akses untuk mengelola semua pengguna kecuali super admin.
        </p>
      </div>

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.username
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
          }`}
          placeholder="Masukkan username"
          disabled={isSubmitting}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-12 ${
              errors.password
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
            }`}
            placeholder="Masukkan password"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
        </p>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nama <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.name
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
          }`}
          placeholder="Masukkan nama lengkap"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Role Field (Fixed as admin) */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
          <div className="flex items-center justify-between">
            <span>Administrator</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Admin
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Role tetap sebagai Administrator
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
          Batal
        </button>
      </div>
    </form>
  );
}
