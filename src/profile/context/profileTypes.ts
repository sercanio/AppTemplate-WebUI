import { createContext } from "react";

// --- State Types ---
export type ProfileState = {
  isEditing: boolean;
  isSaving: boolean;
  // Operation-specific states
  emailChangeSuccess: boolean;
  emailChangeError: string | null;
  passwordChangeSuccess: boolean;
  passwordChangeError: string | null;
  notificationUpdateSuccess: boolean;
  notificationUpdateError: string | null;
  profileUpdateSuccess: boolean;
  profileUpdateError: string | null;
  // Legacy states for backward compatibility
  saveSuccess: boolean;
  saveError: string | null;
  profileData: {
    userName: string;
    email: string;
    location: string;
    profilePictureUrl: string | null;
  };
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    pushNotifications: boolean;
    newEvents: boolean;
    newMessages: boolean;
    marketingEmails: boolean;
  };
};

export type ProfileContextType = {
  state: ProfileState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  updateProfileData: (data: Partial<ProfileState["profileData"]>) => void;
  updatePasswordData: (data: Partial<ProfileState["passwordData"]>) => void;
  updateNotificationSettings: (
    data: Partial<ProfileState["notificationSettings"]>
  ) => void;
  resetPasswordForm: () => void;
  handlePasswordChange: (e: React.FormEvent) => Promise<void>;
  handleNotificationUpdate: (e: React.FormEvent) => Promise<void>;
  handleProfileDataUpdate: (data: Partial<ProfileState["profileData"]>) => Promise<void>;
  updateProfilePicture: (file: File) => Promise<void>;
  deleteProfilePicture: () => Promise<void>;
  requestEmailVerification: (email: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  validateAndUploadImage: (file: File) => Promise<void>;
  getInitials: () => string;
};

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);
