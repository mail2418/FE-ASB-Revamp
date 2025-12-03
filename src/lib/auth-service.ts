import { apiClient } from './api-client';
import { ApiResponse } from '@/types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignInResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
    name: string;
    role: string;
  };
  error?: string;
  attemptsRemaining?: number;
  retryAfter?: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

class AuthService {
  /**
   * Sign in user with external API
   */
  async signin(credentials: LoginCredentials): Promise<SignInResponse> {
    try {
      // Call external auth API
      const response = await apiClient.post<SignInResponse>(
        '/auth/login',
        credentials
      );

      if (response.success && response.data) {
        return response.data;
      }

      return {
        success: false,
        error: response.error || 'Authentication failed',
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  /**
   * Sign out user
   */
  async signout(): Promise<ApiResponse<any>> {
    try {
      // Call external logout API
      const response = await apiClient.delete('/api/auth/signin');
      
      // Clear any client-side storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rememberedUsername');
      }

      return response;
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  }

  /**
   * Get current user from cookie
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='));
      
      if (!userDataCookie) {
        return null;
      }

      const userData = JSON.parse(
        decodeURIComponent(userDataCookie.split('=')[1])
      );

      return userData;
    } catch (error) {
      console.error('Error reading user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    // Check for authToken cookie
    const hasAuthToken = document.cookie
      .split('; ')
      .some(row => row.startsWith('authToken='));

    return hasAuthToken;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return roles.includes(user.role);
  }

  /**
   * Validate credentials format (client-side validation)
   */
  validateCredentials(credentials: LoginCredentials): { 
    valid: boolean; 
    errors: { username?: string; password?: string } 
  } {
    const errors: { username?: string; password?: string } = {};

    // Username validation
    if (!credentials.username) {
      errors.username = 'Username is required';
    } else if (credentials.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(credentials.username)) {
      errors.username = 'Username can only contain letters, numbers, dots, underscores, and hyphens';
    }

    // Password validation
    if (!credentials.password) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();