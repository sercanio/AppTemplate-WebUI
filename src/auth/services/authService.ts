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
        `${API_URL}/Account/loginwith2fa`,
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
        `${API_URL}/Account/loginwithrecoverycode`,
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
  }
}