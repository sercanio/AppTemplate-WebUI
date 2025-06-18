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

type AuthState = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<unknown>;
  register: (userData: any) => Promise<unknown>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isInitialized: false,
  isAuthenticated: false,
  user: null,
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
    } catch (error) {
      set({ isInitialized: true });
    }
  },
  
  login: async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await AuthService.login(email, password, rememberMe);

      if (response.error) {
        throw new Error(response.error);
      }
      
      const currentUser = await AuthService.getCurrentUser();
      
      if (currentUser) {
        set({
          user: currentUser,
          isAuthenticated: true
        });
        return { success: true, user: currentUser };
      }
      
      throw new Error('Login successful but failed to get user data');
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false
      });
      throw error;
    }
  },
  
  register: async (userData: any) => {
    const response = await AuthService.register(userData);
    if (response.user) {
      set({
        user: response.user,
        isAuthenticated: true
      });
    }
    return response;
  },
    logout: async () => {
    await AuthService.logout();
    set({
      user: null,
      isAuthenticated: false
    });
  },
  
  updateUser: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  }
}));