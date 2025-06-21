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

  // 2FA states
  twoFactorSuccess: boolean;
  twoFactorError: string | null;
  twoFactorStatus: {
    hasAuthenticator: boolean;
    is2faEnabled: boolean;
    isMachineRemembered: boolean;
    recoveryCodesLeft: number;
  } | null;
  authenticatorDetails: {
    sharedKey: string;
    authenticatorUri: string;
    qrCodeUri: string;
  } | null;
  generatedRecoveryCodes: string[] | null;
  showRecoveryCodes: boolean;

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
    // 2FA methods
  loadTwoFactorStatus: () => Promise<void>;
  loadAuthenticatorDetails: () => Promise<void>;
  enableTwoFactor: (code: string) => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  resetAuthenticator: () => Promise<void>;
  generateRecoveryCodes: () => Promise<void>;
  forgetBrowser: () => Promise<void>;
  setShowRecoveryCodes: (show: boolean) => void;
  setAuthenticatorDetails: (details: ProfileState['authenticatorDetails']) => void;
  getInitials: () => string;
};

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);
