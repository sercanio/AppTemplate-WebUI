import React, { useState, useEffect, useCallback } from "react";
import type { User } from "../../auth/store/authStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { AccountService } from "../services/accountService";
import { ProfilePictureService } from "../services/profilePictureService";
import { TwoFactorService } from "../../auth/services/twoFactorService";
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
    
    // 2FA states
    twoFactorSuccess: false,
    twoFactorError: null,
    twoFactorStatus: null,
    authenticatorDetails: null,
    generatedRecoveryCodes: null,
    showRecoveryCodes: false,

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

  // 2FA state setters
  const setTwoFactorSuccess = (value: boolean) => setState(prev => ({ ...prev, twoFactorSuccess: value }));
  const setTwoFactorError = (error: string | null) => setState(prev => ({ ...prev, twoFactorError: error }));
  const setTwoFactorStatus = (status: ProfileState['twoFactorStatus']) => setState(prev => ({ ...prev, twoFactorStatus: status }));
  const setAuthenticatorDetails = (details: ProfileState['authenticatorDetails']) => setState(prev => ({ ...prev, authenticatorDetails: details }));
  const setGeneratedRecoveryCodes = (codes: string[] | null) => setState(prev => ({ ...prev, generatedRecoveryCodes: codes }));
  const setShowRecoveryCodes = (show: boolean) => setState(prev => ({ ...prev, showRecoveryCodes: show }));

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
  // 2FA Handlers
  const loadTwoFactorStatus = useCallback(async () => {
    setIsSaving(true);
    setTwoFactorError(null);

    try {
      const status = await TwoFactorService.getTwoFactorStatus();
      setTwoFactorStatus(status);
    } catch (error: unknown) {
      const errorMessage = parseError(error);
      setTwoFactorError(errorMessage);
      themedToast.error('Failed to load 2FA status');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);
  const loadAuthenticatorDetails = useCallback(async () => {
    setIsSaving(true);
    setTwoFactorError(null);

    try {
      const details = await TwoFactorService.getAuthenticatorDetails();
      setAuthenticatorDetails(details);
    } catch (error: unknown) {
      const errorMessage = parseError(error);
      setTwoFactorError(errorMessage);
      themedToast.error('Failed to load authenticator details');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const enableTwoFactor = useCallback(async (code: string) => {
    setIsSaving(true);
    setTwoFactorSuccess(false);
    setTwoFactorError(null);

    try {
      await TwoFactorService.enableAuthenticator(code);
      setTwoFactorSuccess(true);
      themedToast.success('Two-factor authentication enabled successfully');
      
      // Reload status after enabling
      await loadTwoFactorStatus();
    } catch (error: unknown) {
      const errorMessage = parseError(error);
      setTwoFactorError(errorMessage);
      themedToast.error('Failed to enable two-factor authentication');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [loadTwoFactorStatus]);
  const disableTwoFactor = useCallback(async () => {
    setIsSaving(true);
    setTwoFactorSuccess(false);
    setTwoFactorError(null);

    try {
      await TwoFactorService.disableTwoFactor();
      setTwoFactorSuccess(true);
      themedToast.success('Two-factor authentication disabled successfully');
      
      // Clear related state
      setTwoFactorStatus(null);
      setAuthenticatorDetails(null);
      setGeneratedRecoveryCodes(null);
      setShowRecoveryCodes(false);
    } catch (error: unknown) {
      const errorMessage = parseError(error);
      setTwoFactorError(errorMessage);
      themedToast.error('Failed to disable two-factor authentication');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const resetAuthenticator = useCallback(async () => {
    setIsSaving(true);
    setTwoFactorSuccess(false);
    setTwoFactorError(null);

    try {
      await TwoFactorService.resetAuthenticator();
      setTwoFactorSuccess(true);
      themedToast.success('Authenticator reset successfully');
      
      // Clear authenticator details so they can be reloaded
      setAuthenticatorDetails(null);
    } catch (error: unknown) {
      const errorMessage = parseError(error);
      setTwoFactorError(errorMessage);
      themedToast.error('Failed to reset authenticator');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);
  const generateRecoveryCodes = useCallback(async () => {
    setIsSaving(true);
    setTwoFactorSuccess(false);
    setTwoFactorError(null);

    try {
      const response = await TwoFactorService.generateRecoveryCodes();
      setGeneratedRecoveryCodes(response.recoveryCodes);
      setShowRecoveryCodes(true);
      setTwoFactorSuccess(true);
      themedToast.success('Recovery codes generated successfully');
      
      // Reload status to update recovery codes count
      await loadTwoFactorStatus();
    } catch (error: unknown) {
      const errorMessage = parseError(error);
      setTwoFactorError(errorMessage);
      themedToast.error('Failed to generate recovery codes');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [loadTwoFactorStatus]);

  const forgetBrowser = useCallback(async () => {
    setIsSaving(true);
    setTwoFactorSuccess(false);
    setTwoFactorError(null);

    try {
      await TwoFactorService.forgetBrowser();
      setTwoFactorSuccess(true);
      themedToast.success('Browser forgotten successfully. You will need to verify with 2FA on your next login.');
      
      // Reload status to update machine remembered status
      await loadTwoFactorStatus();
    } catch (error: unknown) {
      const errorMessage = parseError(error);
      setTwoFactorError(errorMessage);
      themedToast.error('Failed to forget browser');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [loadTwoFactorStatus]);

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
          // 2FA methods
        loadTwoFactorStatus,
        loadAuthenticatorDetails,
        enableTwoFactor,
        disableTwoFactor,
        resetAuthenticator,
        generateRecoveryCodes,
        forgetBrowser,
        setShowRecoveryCodes,
        setAuthenticatorDetails,
        getInitials,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
