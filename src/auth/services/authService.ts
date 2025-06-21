import axios from 'axios';
import type { User } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5070/api/v1';

export interface LoginResponse {
  message: string;
}

export interface TwoFactorRequiredResponse {
  message: "Two-factor authentication required.";
}

export interface LoginWith2faRequest {
  twoFactorCode: string;
  rememberMe: boolean;
  rememberMachine: boolean;
}

export interface LoginWithRecoveryCodeRequest {
  recoveryCode: string;
}

export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ConfirmEmailChangeResponse {
  message: string;
}

export interface EmailConfirmationParams {
  userId: string;
  code: string;
  email?: string;
}

export interface EmailConfirmationResult {
  success: boolean;
  message: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
}

export interface ResetPasswordParams {
  email: string;
  code: string;
  password: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

export class AuthService {  static async initializeAntiForgeryToken(): Promise<void> {
    try {
      const response = await axios.get(
        `${API_URL}/Security/Antiforgery/token`,
        { withCredentials: true }
      );
      
      if (response.data && response.data.token) {
        // Set the token in axios default headers for all future requests
        axios.defaults.headers.common['X-XSRF-TOKEN'] = response.data.token;
        console.log('Anti-forgery token initialized and set in headers');
      } else {
        console.warn('No anti-forgery token received from server');
      }
    } catch (error) {
      console.error('Failed to initialize anti-forgery token:', error);
      throw error;
    }
  }
  
  static async login(
    loginIdentifier: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/Account/login`,
        {
          loginIdentifier,
          password,
          rememberMe,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  static async loginWith2fa(
    twoFactorCode: string,
    rememberMe: boolean = false,
    rememberMachine: boolean = false
  ): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/Account/2fa/login`,
        {
          twoFactorCode,
          rememberMe,
          rememberMachine,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("2FA login failed:", error);
      throw error;
    }
  }

  static async loginWithRecoveryCode(
    recoveryCode: string
  ): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/Account/2fa/login-recovery`,
        {
          recoveryCode,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Recovery code login failed:", error);
      throw error;
    }
  }
  
  static async register(userData: RegisterUserData): Promise<RegisterResponse> {
    try {
      const response = await axios.post<RegisterResponse>(
        `${API_URL}/Account/register`, 
        userData, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      throw error;
    }
  }
  
  static async logout(): Promise<void> {
    await axios.post(
      `${API_URL}/account/logout`, 
      {}, 
      { withCredentials: true }
    );
  }
  
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axios.get(
        `${API_URL}/account/me`, 
        { withCredentials: true }
      );
      return response.data;
    } catch {
      return null;
    }
  }  /**
   * Confirm email (handles both new user confirmation and email change)
   */
  static async confirmEmail(params: EmailConfirmationParams): Promise<EmailConfirmationResult> {
    console.log('AuthService.confirmEmail called with params:', params);
    
    try {
      let url: string;
      
      // Determine which endpoint to use based on presence of email parameter
      if (params.email) {
        // Email change confirmation
        url = `${API_URL}/Account/confirmemailchange?userId=${encodeURIComponent(params.userId)}&code=${encodeURIComponent(params.code)}&email=${encodeURIComponent(params.email)}`;
      } else {
        // New user email confirmation
        url = `${API_URL}/Account/confirmemail?userId=${encodeURIComponent(params.userId)}&code=${encodeURIComponent(params.code)}`;
      }

      console.log('Making request to:', url);

      const response = await axios.get(url, {
        withCredentials: true,
        timeout: 5000,
      });

      console.log('Response received:', response.data);

      // Customize success message based on confirmation type
      const successMessage = params.email 
        ? "Your email has been successfully changed and confirmed."
        : "Your email has been successfully confirmed.";

      return {
        success: true,
        message: response.data?.message || successMessage,
      };
    } catch (error: unknown) {
      console.error("Email confirmation failed:", error);
      
      // Extract error message from response if available
      let errorMessage = "Failed to confirm email. Please try again or contact support.";
      
      const err = error as { response?: { data?: { message?: string; title?: string }; status?: number }; request?: unknown };
      
      if (err.response) {
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.title) {
          errorMessage = err.response.data.title;
        } else if (err.response.status === 400) {
          errorMessage = "Invalid or expired confirmation link. Please request a new email confirmation link.";
        } else if (err.response.status === 404) {
          errorMessage = "User not found. Please ensure you're logged in with the correct account.";
        } else if (err.response.status === 401) {
          errorMessage = "You need to be logged in to confirm your email.";
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = "No response received from the server. Please check your connection and try again.";
      } else {
        // Something happened in setting up the request
        errorMessage = "Error setting up the request. Please try again later.";
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * @deprecated Use confirmEmail instead
   */
  static async confirmEmailChange(
    userId: string,
    email: string,
    code: string
  ): Promise<ConfirmEmailChangeResponse> {
    const result = await this.confirmEmail({ userId, email, code });
    if (result.success) {
      return { message: result.message };
    } else {
      throw new Error(result.message);
    }
  }

  /**
   * Send a forgot password email to the user
   */
  static async forgotPassword(params: ForgotPasswordParams): Promise<ForgotPasswordResult> {
    console.log('AuthService.forgotPassword called with email:', params.email);

    try {      const url = `${API_URL}/Account/forgotpassword`;
      
      await axios.post(url, {
        email: params.email
      }, {
        withCredentials: true,
        timeout: 8000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Forgot password request successful');

      return {
        success: true,
        message: "If an account with that email exists, we've sent you a password reset link.",
      };
    } catch (error: unknown) {
      console.error('Forgot password error:', error);

      // For security reasons, we don't want to reveal if the email exists or not
      // So we'll show a success message even if the email doesn't exist in the system
      return {
        success: true,
        message: "If an account with that email exists, we've sent you a password reset link.",
      };
    }
  }

  /**
   * Reset user password using the reset code
   */
  static async resetPassword(params: ResetPasswordParams): Promise<ResetPasswordResult> {
    console.log('AuthService.resetPassword called with email:', params.email);

    try {      const url = `${API_URL}/Account/resetpassword`;
      
      await axios.post(url, {
        email: params.email,
        code: params.code,
        password: params.password
      }, {
        withCredentials: true,
        timeout: 8000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Password reset successful');

      return {
        success: true,
        message: "Your password has been successfully reset. You can now log in with your new password.",
      };    } catch (error: unknown) {
      console.error('Reset password error:', error);

      let errorMessage = "Failed to reset your password. Please try again or contact support.";

      const err = error as { response?: { data?: { error?: string; message?: string; title?: string; errors?: Record<string, unknown> }; status?: number }; request?: unknown };

      if (err.response) {
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.title) {
          errorMessage = err.response.data.title;        } else if (err.response.data?.errors?.Email) {
          // Handle email validation errors
          const emailErrors = err.response.data.errors.Email;
          errorMessage = Array.isArray(emailErrors) 
            ? emailErrors.join('. ')
            : String(emailErrors);
        } else if (err.response.data?.errors?.Password) {
          // Handle password validation errors
          const passwordErrors = err.response.data.errors.Password;
          errorMessage = Array.isArray(passwordErrors) 
            ? passwordErrors.join('. ')
            : String(passwordErrors);
        } else if (err.response.status === 400) {
          errorMessage = "Invalid or expired password reset link. Please request a new password reset link.";
        } else if (err.response.status === 404) {
          errorMessage = "User not found. Please ensure you're using the correct reset link.";
        }
      } else if (err.request) {
        errorMessage = "No response received from the server. Please check your connection and try again.";
      } else {
        errorMessage = "Error setting up the request. Please try again later.";
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}