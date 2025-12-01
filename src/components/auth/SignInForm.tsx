'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, User, AlertCircle, Building2 } from 'lucide-react';
import DOMPurify from 'dompurify';

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export default function SignInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  
  // Load remembered username from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedUsername = localStorage.getItem('rememberedUsername');
      if (rememberedUsername) {
        setFormData(prev => ({ ...prev, username: rememberedUsername }));
        setRememberMe(true);
      }
    }
  }, []);

  // Input sanitization function
  const sanitizeInput = (input: string): string => {
    if (typeof window === 'undefined') return input;
    return DOMPurify.sanitize(input.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, dots, underscores, and hyphens';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call - Replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual authentication API call
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();

      // Handle remember me
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', formData.username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      
    } catch (error) {
      setErrors({
        general: 'Invalid username or password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header Section */}
      <div className="bg-linear-to-r from-orange-500 to-orange-600 p-8 text-white">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Building2 className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          ASB Revamp Dashboard
        </h1>
        <p className="text-orange-100 text-center text-sm">
          Building Proposal Management System
        </p>
      </div>

      {/* Form Section */}
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600 mb-6">
          Please sign in to continue to your dashboard
        </p>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                placeholder="Enter your username"
                disabled={isLoading}
                aria-invalid={errors.username ? 'true' : 'false'}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
            </div>
            {errors.username && (
              <p id="username-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.username}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`block w-full pl-10 pr-10 py-3 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                placeholder="Enter your password"
                disabled={isLoading}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                disabled={isLoading}
              />
              <label 
                htmlFor="remember-me" 
                className="ml-2 block text-sm text-gray-700 cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>

            <Link 
              href="/forgot-password"
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              tabIndex={isLoading ? -1 : 0}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg 
                  className="animate-spin h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need help? Contact{' '}
            <Link 
              href="/forgot-password"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}