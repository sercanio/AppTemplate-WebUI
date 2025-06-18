import { create } from 'zustand';
import { AuthService } from '../services/authService';

export type User = {
  id: string;
  email: string;
  userName?: string;
  biography?: string;
  location?: string;
  profilePictureUrl: string | null;
  socialMediaLinks?: any[];
  isEmailConfirmed?: boolean;
  notificationPreferences: any;
};

interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  requiresTwoFactor: boolean;
  twoFactorRememberMe: boolean;
  isLoading?: boolean;
  error?: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<unknown>;
  loginWith2fa: (twoFactorCode: string, rememberMachine?: boolean) => Promise<void>;
  loginWithRecoveryCode: (recoveryCode: string) => Promise<void>;
  register: (userData: any) => Promise<unknown>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    isInitialized: false,
    isAuthenticated: false,
    user: null,
    requiresTwoFactor: false,
    twoFactorRememberMe: false,

    initialize: async () => {
      const state = useAuthStore.getState();
      if (state.isInitialized) {
        return;
      }

      await AuthService.initializeAntiForgeryToken();
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          set({ 
            user: currentUser,
            isAuthenticated: true,
            isInitialized: true
          });
        } else {
          set({ isInitialized: true });
        }
      } catch {
        set({ isInitialized: true });
      }
    },

    register: async (userData: any) => {
      try {
        set({ isLoading: true, error: null });
        const response = await AuthService.register(userData);
        set({ isLoading: false });
        return response;
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string; message?: string } } };
        set({
          error: err.response?.data?.error || err.response?.data?.message || "Registration failed",
          isLoading: false,
        });
        throw error;
      }
    },
    
    login: async (
      loginIdentifier: string,
      password: string,
      rememberMe: boolean = false
    ) => {
      try {
        set({ isLoading: true, error: null });
        
        const response = await AuthService.login(loginIdentifier, password, rememberMe);
        
        // Check if 2FA is required based on the exact message
        if (response.message === "Two-factor authentication required.") {
          set({ 
            requiresTwoFactor: true, 
            twoFactorRememberMe: rememberMe,
            isLoading: false 
          });
          return;
        }

        // Regular login success - get user data
        const userResponse = await AuthService.getCurrentUser();
        set({
          user: userResponse,
          isAuthenticated: true,
          isLoading: false,
          requiresTwoFactor: false,
          twoFactorRememberMe: false,
        });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string; message?: string } } };
        set({
          error: err.response?.data?.error || err.response?.data?.message || "Login failed",
          isLoading: false,
          requiresTwoFactor: false,
        });
        throw error;
      }
    },

    loginWith2fa: async (
      twoFactorCode: string,
      rememberMachine: boolean = false
    ) => {
      try {
        set({ isLoading: true, error: null });
        
        const { twoFactorRememberMe } = get();
        await AuthService.loginWith2fa(twoFactorCode, twoFactorRememberMe, rememberMachine);
        
        const userResponse = await AuthService.getCurrentUser();
        set({
          user: userResponse,
          isAuthenticated: true,
          isLoading: false,
          requiresTwoFactor: false,
          twoFactorRememberMe: false,
        });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string; message?: string } } };
        set({
          error: err.response?.data?.error || err.response?.data?.message || "2FA verification failed",
          isLoading: false,
        });
        throw error;
      }
    },

    loginWithRecoveryCode: async (recoveryCode: string) => {
      try {
        set({ isLoading: true, error: null });
        
        await AuthService.loginWithRecoveryCode(recoveryCode);
        
        const userResponse = await AuthService.getCurrentUser();
        set({
          user: userResponse,
          isAuthenticated: true,
          isLoading: false,
          requiresTwoFactor: false,
          twoFactorRememberMe: false,
        });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string; message?: string } } };
        set({
          error: err.response?.data?.error || err.response?.data?.message || "Recovery code verification failed",
          isLoading: false,
        });
        throw error;
      }
    },

    logout: async () => {
      try {
        await AuthService.logout();
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          requiresTwoFactor: false,
          twoFactorRememberMe: false,
        });
      }
    },

    updateUser: (userData: Partial<User>) => {
      set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      }));
    }
  })
);