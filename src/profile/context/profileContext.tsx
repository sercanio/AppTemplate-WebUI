import React, { useState, useEffect, useCallback } from "react";
import type { User } from "../../auth/store/authStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { AccountService } from "../services/accountService";
import { ProfilePictureService } from "../services/profilePictureService";
import { compressImage, validateImageFile } from "../utils/imageUtils";
import { themedToast } from "../../lib/toast";
import { parseError } from "../../lib/utils";
import { ProfileContext, type ProfileState } from "./profileTypes";

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
  const getInitialTabFromPath = useCallback(() => {
    if (location.pathname.includes("/profile/security")) return "security";
    if (location.pathname.includes("/profile/notifications")) return "notifications";
    if (location.pathname.includes("/profile/settings")) return "settings";
    return "profile";
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getInitialTabFromPath());
  const [state, setState] = useState<ProfileState>({
    isEditing: false,
    isSaving: false,
    // Operation-specific states
    emailChangeSuccess: false,
    emailChangeError: null,
    passwordChangeSuccess: false,
    passwordChangeError: null,
    notificationUpdateSuccess: false,
    notificationUpdateError: null,    profileUpdateSuccess: false,
    profileUpdateError: null,
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
  }, [getInitialTabFromPath]);  // State updaters
  const setIsSaving = (value: boolean) => setState(prev => ({ ...prev, isSaving: value }));
  
  // Operation-specific setters
  const setEmailChangeSuccess = (value: boolean) => setState(prev => ({ ...prev, emailChangeSuccess: value }));
  const setEmailChangeError = (error: string | null) => setState(prev => ({ ...prev, emailChangeError: error }));
  const setPasswordChangeSuccess = (value: boolean) => setState(prev => ({ ...prev, passwordChangeSuccess: value }));
  const setPasswordChangeError = (error: string | null) => setState(prev => ({ ...prev, passwordChangeError: error }));
  const setNotificationUpdateSuccess = (value: boolean) => setState(prev => ({ ...prev, notificationUpdateSuccess: value }));
  const setNotificationUpdateError = (error: string | null) => setState(prev => ({ ...prev, notificationUpdateError: error }));
  const setProfileUpdateSuccess = (value: boolean) => setState(prev => ({ ...prev, profileUpdateSuccess: value }));
  const setProfileUpdateError = (error: string | null) => setState(prev => ({ ...prev, profileUpdateError: error }));

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
  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotificationUpdateSuccess(false);
    setNotificationUpdateError(null);

    try {
      await AccountService.updateNotificationPreferences({
        emailNotification: state.notificationSettings.emailNotifications,
        inAppNotification: state.notificationSettings.inAppNotifications,
        pushNotification: state.notificationSettings.pushNotifications,
      });
      setNotificationUpdateSuccess(true);
      themedToast.success("Notification preferences updated");
    } catch (error: unknown) {
      const msg = parseError(error);
      setNotificationUpdateError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setPasswordChangeSuccess(false);
    setPasswordChangeError(null);

    if (state.passwordData.newPassword !== state.passwordData.confirmPassword) {
      setPasswordChangeError("New passwords do not match");
      setIsSaving(false);
      return;
    }

    try {
      await AccountService.changePassword({
        oldPassword: state.passwordData.currentPassword,
        newPassword: state.passwordData.newPassword,
        confirmPassword: state.passwordData.confirmPassword,
      });
      setPasswordChangeSuccess(true);
      resetPasswordForm();
      themedToast.success("Password updated successfully");
    } catch (error: unknown) {
      const msg = parseError(error);
      setPasswordChangeError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileDataUpdate = async (data: Partial<ProfileState['profileData']>) => {
    if (!user?.id) {
      const msg = "User ID not found";
      setProfileUpdateError(msg);
      themedToast.error(msg);
      return;
    }

    setIsSaving(true);
    setProfileUpdateSuccess(false);
    setProfileUpdateError(null);

    try {
      await AccountService.updateUserProfile(user.id, data);
      updateProfileData(data);
      setProfileUpdateSuccess(true);
      themedToast.success("Profile updated successfully");
    } catch (error: unknown) {
      const msg = parseError(error);
      setProfileUpdateError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };
  const updateProfilePicture = async (file: File) => {
    setIsSaving(true);
    setProfileUpdateSuccess(false);
    setProfileUpdateError(null);

    try {
      const result = await ProfilePictureService.uploadProfilePicture(file);
      updateProfileData({ profilePictureUrl: result.profilePictureUrl });
      updateUser({ profilePictureUrl: result.profilePictureUrl });
      setProfileUpdateSuccess(true);
      themedToast.success("Profile picture updated");
    } catch (error: unknown) {
      const msg = parseError(error);
      setProfileUpdateError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProfilePicture = async () => {
    setIsSaving(true);
    setProfileUpdateSuccess(false);
    setProfileUpdateError(null);

    try {
      await ProfilePictureService.deleteProfilePicture();
      updateProfileData({ profilePictureUrl: null });
      updateUser({ profilePictureUrl: null });
      setProfileUpdateSuccess(true);
      themedToast.success("Profile picture deleted");
    } catch (error: unknown) {
      const msg = parseError(error);
      setProfileUpdateError(msg);
      themedToast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };
  const getInitials = () => {
    if (!user?.userName) return "U";
    return user.userName.charAt(0).toUpperCase();
  };
  const requestEmailVerification = async (email: string) => {
    setIsSaving(true);
    setEmailChangeError(null);
    
    try {
      await AccountService.requestEmailVerification(email);
      themedToast.success("Verification email sent");
    } catch (error: unknown) {
      const msg = parseError(error);
      setEmailChangeError(msg);
      themedToast.error("Failed to send verification email");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  const changeEmail = async (newEmail: string) => {
    setIsSaving(true);
    setEmailChangeError(null);
    setEmailChangeSuccess(false);
    
    try {
      await AccountService.changeEmail({ newEmail });
      setEmailChangeSuccess(true);
      themedToast.success("Email change request sent");
    } catch (error: unknown) {
      const msg = parseError(error);
      setEmailChangeError(msg);
      themedToast.error("Failed to change email");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  const deleteAccount = async (password: string) => {
    setIsSaving(true);
    setProfileUpdateError(null);

    try {
      await AccountService.deleteAccount({ password });
      themedToast.success("Account deleted successfully");
      // Let the component handle logout and navigation
    } catch (error: unknown) {
      const msg = parseError(error);
      setProfileUpdateError(msg);
      themedToast.error("Failed to delete account");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  const validateAndUploadImage = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setProfileUpdateError(validation.errorMessage);
      themedToast.error(validation.errorMessage);
      return;
    }

    setIsSaving(true);
    setProfileUpdateSuccess(false);
    setProfileUpdateError(null);

    try {
      // Compress image
      const compressedFile = await compressImage(file, 3);
      
      // Upload to server
      const result = await ProfilePictureService.uploadProfilePicture(compressedFile);
      updateProfileData({ profilePictureUrl: result.profilePictureUrl });
      updateUser({ profilePictureUrl: result.profilePictureUrl });
      setProfileUpdateSuccess(true);
      themedToast.success("Profile picture updated successfully");
    } catch (error: unknown) {
      const msg = parseError(error);
      setProfileUpdateError(msg);
      themedToast.error("Failed to upload profile picture");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        state,
        activeTab,        setActiveTab: (tab: string) => {
          setActiveTab(tab);
          navigate(tab === "profile" ? "/profile" : `/profile/${tab}`);
        },
        updateProfileData,
        updatePasswordData,
        updateNotificationSettings,
        resetPasswordForm,
        handlePasswordChange,
        handleNotificationUpdate,        handleProfileDataUpdate,
        updateProfilePicture,
        deleteProfilePicture,
        requestEmailVerification,
        changeEmail,
        deleteAccount,
        validateAndUploadImage,
        getInitials,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
