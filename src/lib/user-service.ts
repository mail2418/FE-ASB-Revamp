import { AdminUser, CreateUserFormData, UserRole } from '@/types/admin';

// Mock user data - in production, this would come from a database
let mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'Admin User',
    username: 'admin',
    password: 'Admin123!',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Verifikator Satu',
    username: 'verif1',
    password: 'Verif123!',
    role: 'verifikator',
  },
  {
    id: '3',
    name: 'PD User',
    username: 'pd1',
    password: 'PD123!',
    role: 'perangkat_daerah',
  },
];

class UserService {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<AdminUser[]> {
    // In production, this would be an API call to the backend
    // Return users without passwords for security
    return mockUsers.map(({ password, ...user }) => ({
      ...user,
      password: '********', // Never return actual passwords
    }));
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(userData: CreateUserFormData): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate username doesn't already exist
      const existingUser = mockUsers.find(u => u.username === userData.username);
      if (existingUser) {
        return {
          success: false,
          error: 'Username already exists',
        };
      }

      // Create new user
      const newUser: AdminUser = {
        id: String(mockUsers.length + 1),
        name: userData.name,
        username: userData.username,
        password: userData.password, // In production, hash this password
        role: userData.role,
      };

      mockUsers.push(newUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create user',
      };
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<AdminUser | null> {
    const user = mockUsers.find(u => u.username === username);
    if (!user) return null;

    // Return without password
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      password: '********',
    };
  }
}

// Export singleton instance
export const userService = new UserService();
