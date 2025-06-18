import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5070/api/v1";

export interface User {
  id: string;
  userName?: string;
  email?: string;
  mailConfirmed: boolean;
  profilePictureUrl?: string;
  roles: Role[];  // Changed from string[] to Role[]
  biography?: string;
  lastLoginAt?: string;
  joinDate: string;
  socialMediaLinks?: SocialMediaLink[];
}

export interface Role {
  id: string;
  name: string;
}

export interface SocialMediaLink {
  id?: string;
  url?: string;
  platformId?: string;
  platformName?: string;
  platformIcon?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DynamicQuery {
  sort?: Sort[];
  filter?: Filter;
}

export interface Filter {
  field?: string;
  operator?: string;
  value?: unknown;
  isCaseSensitive?: boolean;
  logic?: string;
  filters?: Filter[];
}

export interface Sort {
  field: string;
  dir: "asc" | "desc";
}

export interface UpdateUserRequest {
  biography?: string;
  socialMediaLinks?: SocialMediaLink[];
}

export interface UpdateUserRolesRequest {
  operation: "Add" | "Remove";
  roleId: string;
}

export class UserManagementService {
  /**
   * Get a paginated list of users
   */
  static async getUsers(pageIndex: number = 0, pageSize: number = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await axios.get<PaginatedResponse<User>>(`${API_URL}/Users`, {
        params: {
          pageIndex,
          pageSize
        },
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  /**
   * Get users using dynamic filtering and sorting
   */
  static async getUsersWithQuery(
    dynamicQuery: DynamicQuery, 
    pageIndex: number = 0, 
    pageSize: number = 10
  ): Promise<PaginatedResponse<User>> {
    try {
      const response = await axios.post<PaginatedResponse<User>>(
        `${API_URL}/Users/dynamic`,
        dynamicQuery,
        {
          params: {
            pageIndex,
            pageSize
          },
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users with query:', error);
      throw error;
    }
  }

  /**
   * Get a specific user by ID
   */
  static async getUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get<User>(`${API_URL}/Users/${userId}`, {
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch user with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update a user's profile information
   */
  static async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${API_URL}/Users/${userId}`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Failed to update user with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get users with a specific role
   */
  static async getUsersByRole(
    roleId: string, 
    pageIndex: number = 0, 
    pageSize: number = 10
  ): Promise<PaginatedResponse<User>> {
    try {
      const response = await axios.get<PaginatedResponse<User>>(
        `${API_URL}/Users/roles/${roleId}`,
        {
          params: {
            PageIndex: pageIndex,
            PageSize: pageSize
          },
          withCredentials: true,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch users with role ID ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Update a user's roles (add or remove a single role)
   */
  static async updateUserRoles(userId: string, data: UpdateUserRolesRequest): Promise<User> {
    try {
      const response = await axios.patch<User>(
        `${API_URL}/Users/${userId}/roles`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Failed to update roles for user with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get a user's public profile by username
   */
  static async getPublicUserProfile(userName: string): Promise<User> {
    try {
      const response = await axios.get<User>(`${API_URL}/Users/Public/${userName}`, {
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch public profile for user ${userName}:`, error);
      throw error;
    }
  }

  /**
   * Upload a profile picture for the current user
   */
  static async uploadProfilePicture(profilePicture: File): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);
      
      const response = await axios.post<User>(
        `${API_URL}/Users/profile-picture`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  }

  /**
   * Delete the current user's profile picture
   */
  static async deleteProfilePicture(): Promise<void> {
    try {
      await axios.delete(`${API_URL}/Users/profile-picture`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Failed to delete profile picture:', error);
      throw error;
    }
  }
}
