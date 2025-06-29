import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5070/api/v1";

export interface UserCountResponse {
  count: number;
}

export interface UserTrendsResponse {
  totalUsersLastMonth: number;
  totalUsersThisMonth: number;
  growthPercentage: number;
  dailyRegistrations: Record<string, number>;
}

export interface AuthenticationStatistics {
  activeSessions: number;
  successfulLogins: number;
  failedLogins: number;
  twoFactorEnabled: number;
  totalUsersWithAuthenticator: number;
}

export interface RoleStatistics {
  totalRoles: number;
  totalPermissions: number;
  permissionsPerRole: Record<string, number>;
  usersPerRole: Record<string, number>;
  permissionsByFeature: Record<string, number>;
}

export interface DashboardStatistics {
  userCount: number;
  activeSessions?: number;
  growthRate?: number;
  userTrends?: UserTrendsResponse;
  authStats?: AuthenticationStatistics;
  roleStats?: RoleStatistics;
}

export type TrendsPeriod = 'week' | 'month' | '3months' | '6months' | 'year';

export class StatisticsService {
  /**
   * Get total users count
   */
  static async getUsersCount(): Promise<number> {
    try {
      const response = await axios.get<UserCountResponse>(`${API_URL}/Statistics/users/count`, {
        withCredentials: true,
      });
      
      return response.data.count;
    } catch (error) {
      console.error('Failed to fetch users count:', error);
      throw error;
    }
  }

  /**
   * Get user trends and growth statistics
   */
  static async getUserTrends(period: TrendsPeriod = 'month'): Promise<UserTrendsResponse> {
    try {
      const response = await axios.get<UserTrendsResponse>(`${API_URL}/Statistics/users/trends`, {
        params: {
          period: period
        },
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user trends:', error);
      throw error;
    }
  }

  /**
   * Get authentication statistics
   */
  static async getAuthenticationStats(): Promise<AuthenticationStatistics> {
    try {
      const response = await axios.get<AuthenticationStatistics>(`${API_URL}/Statistics/authentication`, {
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch authentication stats:', error);
      throw error;
    }
  }

  /**
   * Get role and permission statistics
   */
  static async getRoleStatistics(): Promise<RoleStatistics> {
    try {
      const response = await axios.get<RoleStatistics>(`${API_URL}/Statistics/roles`, {
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch role statistics:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStatistics(period: TrendsPeriod = 'month'): Promise<DashboardStatistics> {
    try {
      // Fetch all statistics in parallel
      const [userCount, userTrends, authStats, roleStats] = await Promise.all([
        this.getUsersCount(),
        this.getUserTrends(period),
        this.getAuthenticationStats(),
        this.getRoleStatistics(),
      ]);
      
      return {
        userCount,
        activeSessions: authStats.activeSessions,
        growthRate: userTrends.growthPercentage,
        userTrends,
        authStats,
        roleStats,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard statistics:', error);
      // Return fallback data if API fails
      return {
        userCount: 0,
        activeSessions: 0,
        growthRate: 0,
      };
    }
  }
}