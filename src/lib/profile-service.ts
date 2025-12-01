import { AdminUser } from '@/types/admin';

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
      const response = await fetch(`/api/profile/${userId}`);
      // console.log(response)
      if (!response.ok) {
        return null;
      }
      return await response.json();
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
      const response = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to update profile',
        };
      }

      return {
        success: true,
        user: data.user,
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
