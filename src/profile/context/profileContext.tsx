import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { User } from "../../auth/store/authStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { AccountService } from "../services/accountService";
import { ProfilePictureService } from "../services/profilePictureService";

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
  setIsEditing: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setSaveSuccess: (value: boolean) => void;
  setSaveError: (value: string | null) => void;
  updateProfileData: (data: Partial<ProfileState["profileData"]>) => void;
  updatePasswordData: (data: Partial<ProfileState["passwordData"]>) => void;
  updateNotificationSettings: (data: Partial<ProfileState["notificationSettings"]>) => void;
  resetPasswordForm: () => void;
  handlePasswordChange: (e: React.FormEvent) => Promise<void>;
  handleNotificationUpdate: (e: React.FormEvent) => Promise<void>;
  handleProfileDataUpdate: (data: {}) => Promise<void>;
  getInitials: () => string;
  updateProfilePicture: (file: File) => Promise<void>;
  deleteProfilePicture: () => Promise<void>;
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

  // Initialize state with user data
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
    passwordData: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    notificationSettings: {
      emailNotifications: user?.notificationPreferences?.emailNotification ?? true,
      inAppNotifications: user?.notificationPreferences?.inAppNotification ?? true,
      pushNotifications: user?.notificationPreferences?.pushNotification ?? true,
      newEvents: true,
      newMessages: true,
      marketingEmails: false,
    },
  });

  // Update notification settings when user changes
  useEffect(() => {
    if (user?.notificationPreferences) {
      setState((prev) => ({
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          emailNotifications: user.notificationPreferences.emailNotification,
          inAppNotifications: user.notificationPreferences.inAppNotification,
          pushNotifications: user.notificationPreferences.pushNotification,
        },
      }));
    }
  }, [user?.notificationPreferences]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "profile") {
      navigate("/profile");
    } else {
      navigate(`/profile/${tab}`);
    }
  };

  const setIsEditing = (value: boolean) => {
    setState((prev) => ({ ...prev, isEditing: value }));
  };

  const setIsSaving = (value: boolean) => {
    setState((prev) => ({ ...prev, isSaving: value }));
  };

  const setSaveSuccess = (value: boolean) => {
    setState((prev) => ({ ...prev, saveSuccess: value }));
  };

  const setSaveError = (value: string | null) => {
    setState((prev) => ({ ...prev, saveError: value }));
  };

  const updateProfileData = (data: Partial<ProfileState["profileData"]>) => {
    setState((prev) => ({
      ...prev,
      profileData: { ...prev.profileData, ...data },
    }));
  };

  const updatePasswordData = (data: Partial<ProfileState["passwordData"]>) => {
    setState((prev) => ({
      ...prev,
      passwordData: { ...prev.passwordData, ...data },
    }));
  };

  const updateNotificationSettings = (data: Partial<ProfileState["notificationSettings"]>) => {
    setState((prev) => ({
      ...prev,
      notificationSettings: { ...prev.notificationSettings, ...data },
    }));
  };

  const resetPasswordForm = () => {
    setState((prev) => ({
      ...prev,
      passwordData: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    }));
  };

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
    } catch (error: any) {
      setSaveError(error.response?.data?.message || "Failed to update password. Please try again.");
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
      const notificationData = {
        inAppNotification: state.notificationSettings.inAppNotifications,
        emailNotification: state.notificationSettings.emailNotifications,
        pushNotification: state.notificationSettings.pushNotifications,
      };

      await AccountService.updateNotificationPreferences(notificationData);
      setSaveSuccess(true);
    } catch (error: any) {
      setSaveError(error.response?.data?.error || "Failed to update notification settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileDataUpdate = async (data: {}) => {
    if (!user?.id) {
      setSaveError("User ID not found");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await AccountService.updateUserProfile(user.id, data);
      updateProfileData(data);
      setSaveSuccess(true);
    } catch (error: any) {
      setSaveError(error.response?.data?.message || "Failed to update profile data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (!user?.userName) return "U";
    return user.userName.charAt(0).toUpperCase();
  };

  const updateProfilePicture = async (file: File) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const result = await ProfilePictureService.uploadProfilePicture(file);

      setState((prev) => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          profilePictureUrl: result.profilePictureUrl,
        },
      }));

      updateUser({ profilePictureUrl: result.profilePictureUrl });
      setSaveSuccess(true);
    } catch (error: any) {
      setSaveError(error.response?.data?.error || "Failed to update profile picture. Please try again.");
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

      setState((prev) => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          profilePictureUrl: null,
        },
      }));

      updateUser({ profilePictureUrl: null });
      setSaveSuccess(true);
    } catch (error: any) {
      setSaveError(error.response?.data?.error || "Failed to delete profile picture. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setActiveTab(getInitialTabFromPath());
  }, [location.pathname]);

  return (
    <ProfileContext.Provider
      value={{
        state,
        activeTab,
        setActiveTab: handleTabChange,
        setIsEditing,
        setIsSaving,
        setSaveSuccess,
        setSaveError,
        updateProfileData,
        updatePasswordData,
        updateNotificationSettings,
        resetPasswordForm,
        handlePasswordChange,
        handleNotificationUpdate,
        handleProfileDataUpdate,
        getInitials,
        updateProfilePicture,
        deleteProfilePicture,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};