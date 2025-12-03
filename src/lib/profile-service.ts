import { AdminUser } from '@/types/admin';
import { apiClient } from './api-client';

// Profile update data type
export interface ProfileUpdateData {
  name?: string;
  displayName?: string;
  jobPosition?: string;
  avatar?: string;
}

class ProfileService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<AdminUser | null> {
    try {
      const response = await apiClient.get<AdminUser>(`/api/profile/${userId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      console.error('Failed to fetch user profile:', response.error);
      return null;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: ProfileUpdateData
  ): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    try {
      const response = await apiClient.put<{ user: AdminUser }>(
        `/api/profile/${userId}`,
        updates
      );

      if (response.success && response.data) {
        return {
          success: true,
          user: response.data.user,
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to update profile',
      };
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return {
        success: false,
        error: 'Failed to update profile',
      };
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
