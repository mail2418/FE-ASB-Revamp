import { apiClient } from './api-client';
import { ApiResponse } from '@/types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface User {
  userId: string;
  username: string;
  roles: string[];
}

class AuthService {
  private accessToken: string | null = null;

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        credentials
      );

      if (response.success && response.data) {
        // Store access token in memory
        this.accessToken = response.data.accessToken;
        
        // Store in sessionStorage as backup (will be cleared on browser close)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('accessToken', response.data.accessToken);
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to clear httpOnly cookie
      await apiClient.post('/auth/logout');
      
      // Clear access token from memory and storage
      this.accessToken = null;
      
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('rememberedUsername');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local tokens even if API call fails
      this.accessToken = null;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
      }
    }
  }

  /**
   * Refresh access token using refresh token (httpOnly cookie)
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh');

      if (response.success && response.data) {
        this.accessToken = response.data.accessToken;
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('accessToken', response.data.accessToken);
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }

    // Try to get from sessionStorage
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('accessToken');
    }

    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Decode JWT token to get user info
   */
  getCurrentUser(): User | null {
    const token = this.getAccessToken();
    
    if (!token) {
      return null;
    }

    try {
      // Decode JWT payload (without verification - server handles that)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      
      return {
        userId: payload.sub,
        username: payload.username,
        roles: payload.roles || [],
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return roles.some(role => user.roles.includes(role));
  }
}

// Export singleton instance
export const authService = new AuthService();