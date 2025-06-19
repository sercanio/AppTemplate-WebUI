import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../../auth/store/authStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { AccountService } from "../services/accountService";
import { ProfilePictureService } from "../services/profilePictureService";
import { themedToast } from "../../lib/toast";
import { parseError } from "../../lib/utils";

// --- State Types ---
type ProfileState = {
  isEditing: boolean;
  isSaving: boolean;
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

type ProfileContextType = {
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
  getInitials: () => string;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const getInitialTabFromPath = () => {
    if (location.pathname.includes("/profile/security")) return "security";
    if (location.pathname.includes("/profile/notifications")) return "notifications";
    if (location.pathname.includes("/profile/settings")) return "settings";
    return "profile";
  };

  const [activeTab, setActiveTab] = useState(getInitialTabFromPath());
  const [state, setState] = useState<ProfileState>({
    isEditing: false,
    isSaving: false,
    saveSuccess: false,
    saveError: null,
    profileData: {
      userName: user?.userName || "",
      email: user?.email || "",
      location: user?.location || "",
      profilePictureUrl: user?.profilePictureUrl || null,
    },
    passwordData: { currentPassword: "", newPassword: "", confirmPassword: "" },
    notificationSettings: {
      emailNotifications: user?.notificationPreferences?.emailNotification ?? true,
      inAppNotifications: user?.notificationPreferences?.inAppNotification ?? true,
      pushNotifications: user?.notificationPreferences?.pushNotification ?? true,
      newEvents: true,
      newMessages: true,
      marketingEmails: false,
    },
  });

  useEffect(() => {
    setActiveTab(getInitialTabFromPath());
  }, [location.pathname]);

  // State updaters
  const setIsSaving = (value: boolean) => setState(prev => ({ ...prev, isSaving: value }));
  const setSaveSuccess = (value: boolean) => setState(prev => ({ ...prev, saveSuccess: value }));
  const setSaveError = (error: string | null) => setState(prev => ({ ...prev, saveError: error }));
  const updateProfileData = (data: Partial<ProfileState['profileData']>) =>
    setState(prev => ({ ...prev, profileData: { ...prev.profileData, ...data } }));
  const updatePasswordData = (data: Partial<ProfileState['passwordData']>) =>
    setState(prev => ({ ...prev, passwordData: { ...prev.passwordData, ...data } }));
  const updateNotificationSettings = (
    data: Partial<ProfileState['notificationSettings']>
  ) => setState(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, ...data } }));
  const resetPasswordForm = () =>
    setState(prev => ({ ...prev, passwordData: { currentPassword: "", newPassword: "", confirmPassword: "" } }));

  // Handlers
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    if (state.passwordData.newPassword !== state.passwordData.confirmPassword) {
      setSaveError("New passwords do not match");
      setIsSaving(false);
      return;
    }

    try {
      await AccountService.changePassword({
        oldPassword: state.passwordData.currentPassword,
        newPassword: state.passwordData.newPassword,
        confirmPassword: state.passwordData.confirmPassword,
      });
      setSaveSuccess(true);
      resetPasswordForm();
      themedToast.success("Password updated successfully");
    } catch (error: unknown) {
      const msg = parseError(error);
      setSaveError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await AccountService.updateNotificationPreferences({
        emailNotification: state.notificationSettings.emailNotifications,
        inAppNotification: state.notificationSettings.inAppNotifications,
        pushNotification: state.notificationSettings.pushNotifications,
      });
      setSaveSuccess(true);
      themedToast.success("Notification preferences updated");
    } catch (error: unknown) {
      const msg = parseError(error);
      setSaveError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileDataUpdate = async (data: Partial<ProfileState['profileData']>) => {
    if (!user?.id) {
      const msg = "User ID not found";
      setSaveError(msg);
      themedToast.error(msg);
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await AccountService.updateUserProfile(user.id, data);
      updateProfileData(data);
      setSaveSuccess(true);
      themedToast.success("Profile updated successfully");
    } catch (error: unknown) {
      const msg = parseError(error);
      setSaveError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfilePicture = async (file: File) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const result = await ProfilePictureService.uploadProfilePicture(file);
      updateProfileData({ profilePictureUrl: result.profilePictureUrl });
      updateUser({ profilePictureUrl: result.profilePictureUrl });
      setSaveSuccess(true);
      themedToast.success("Profile picture updated");
    } catch (error: unknown) {
      const msg = parseError(error);
      setSaveError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProfilePicture = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await ProfilePictureService.deleteProfilePicture();
      updateProfileData({ profilePictureUrl: null });
      updateUser({ profilePictureUrl: null });
      setSaveSuccess(true);
      themedToast.success("Profile picture deleted");
    } catch (error: unknown) {
      const msg = parseError(error);
      setSaveError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (!user?.userName) return "U";
    return user.userName.charAt(0).toUpperCase();
  };

  return (
    <ProfileContext.Provider
      value={{
        state,
        activeTab,
        setActiveTab: tab => {
          setActiveTab(tab);
          navigate(tab === "profile" ? "/profile" : `/profile/${tab}`);
        },
        updateProfileData,
        updatePasswordData,
        updateNotificationSettings,
        resetPasswordForm,
        handlePasswordChange,
        handleNotificationUpdate,
        handleProfileDataUpdate,
        updateProfilePicture,
        deleteProfilePicture,
        getInitials,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within a ProfileProvider");
  return context;
};
