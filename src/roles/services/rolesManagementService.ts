import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5070/api/v1";

export interface Role {
  id: string;
  name: string;
  isDefaultRole?: boolean;
  permissions?: Permission[];
  userCount?: number;
}

export interface Permission {
  id: string;
  name: string;
  feature: string;
  isGranted?: boolean;
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

export interface CreateRoleRequest {
  name: string;
}

export interface UpdateRoleRequest {
  name: string;
}

export interface UpdateRolePermissionRequest {
  permissionId: string;
  operation: "Add" | "Remove";
}

export class RolesManagementService {
  /**
   * Get a paginated list of roles
   */
  static async getRoles(pageIndex: number = 0, pageSize: number = 10): Promise<PaginatedResponse<Role>> {
    try {
      const response = await axios.get<PaginatedResponse<Role>>(`${API_URL}/Roles`, {
        params: {
          pageIndex,
          pageSize
        },
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      throw error;
    }
  }

  /**
   * Get a specific role by ID
   */
  static async getRoleById(roleId: string): Promise<Role> {
    try {
      const response = await axios.get<Role>(`${API_URL}/Roles/${roleId}`, {
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch role with ID ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new role
   */
  static async createRole(data: CreateRoleRequest): Promise<Role> {
    try {
      const response = await axios.post<Role>(
        `${API_URL}/Roles`,
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
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Update a role's name
   */
  static async updateRole(roleId: string, data: UpdateRoleRequest): Promise<Role> {
    try {
      const response = await axios.patch<Role>(
        `${API_URL}/Roles/${roleId}/name`,
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
      console.error(`Failed to update role with ID ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a role
   */
  static async deleteRole(roleId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/Roles/${roleId}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error(`Failed to delete role with ID ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Get permissions for a specific role
   */
  static async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const role = await this.getRoleById(roleId);
      return role.permissions || [];
    } catch (error) {
      console.error(`Failed to fetch permissions for role with ID ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Update a single permission for a role
   */
  static async updateRolePermission(roleId: string, data: UpdateRolePermissionRequest): Promise<void> {
    try {
      await axios.patch(
        `${API_URL}/Roles/${roleId}/permissions`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (error) {
      console.error(`Failed to update permission for role with ID ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Get all available permissions in the system
   */
  static async getAllPermissions(): Promise<PaginatedResponse<Permission>> {
    try {
      const response = await axios.get<PaginatedResponse<Permission>>(`${API_URL}/Permissions`, {
        params: {
          pageIndex: 0,
          pageSize: 1000
        },
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all permissions:', error);
      throw error;
    }
  }
}
