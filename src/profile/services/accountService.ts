import type { User } from "../../auth/store/authStore";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5070/api/v1";

export type ProfileUpdateData = object

export interface NotificationPreferences {
  inAppNotification: boolean;
  emailNotification: boolean;
  pushNotification: boolean;
  newEvents?: boolean;
  newMessages?: boolean;
  marketingEmails?: boolean;
}

export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailChangeData {
  newEmail: string;
}

interface DeleteAccountRequest {
  password: string;
}

export interface SecurityInfo {
  hasPassword: boolean;
  twoFactorEnabled?: boolean;
  emailConfirmed?: boolean;
}

export class AccountService {
  /**
   * Update a user's profile information
   */
  static async updateUserProfile(userId: string, data: ProfileUpdateData): Promise<unknown> {
    const response = await axios.put(`${API_URL}/Users/${userId}`, data, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  /**
   * Get a user's profile information
   */
  static async getUserProfile(userId: string): Promise<User> {
    const response = await axios.get(`${API_URL}/Users/${userId}`, { withCredentials: true });
    return response.data;
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(preferences: NotificationPreferences): Promise<unknown> {
    const response = await axios.patch(`${API_URL}/Account/me/notifications`, preferences, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  /**
   * Change user password
   */
  static async changePassword(passwordData: PasswordChangeData): Promise<unknown> {
    const response = await axios.post(`${API_URL}/Account/changepassword`, passwordData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  /**
   * Change user email
   */
  static async changeEmail(emailData: EmailChangeData): Promise<unknown> {
    const response = await axios.post(`${API_URL}/Account/changeemail`, emailData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  /**
   * Request email verification
   */
  static async requestEmailVerification(email: string): Promise<unknown> {
    const response = await axios.post(
      `${API_URL}/Account/resendemailconfirmation`,
      { email },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  /**
   * Deletes the user's account and all associated data
   */
  static async deleteAccount(request: DeleteAccountRequest): Promise<void> {
    const response = await axios.post(
      `${API_URL}/Account/deletepersonaldata`,
      request,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  /**
   * Get the user's security information
   */
  static async getSecurityInfo(): Promise<SecurityInfo> {
    const response = await axios.get(`${API_URL}/Account/security-info`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }
}