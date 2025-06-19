import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useProfile } from "../context/profileContext";
import { AccountService } from "../services/accountService";
import { themedToast } from "../../lib/toast";

export function SecurityTab() {
  const { state, updatePasswordData, setSaveSuccess, setSaveError, setIsSaving } = useProfile();
  const { isSaving, passwordData, saveSuccess, saveError } = state;

  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    message: string;
  }>({ score: 0, message: "" });

  // Password validation
  const validatePassword = (password: string) => {
    let score = 0;
    let message = "";

    if (password.length === 0) {
      setPasswordStrength({ score: 0, message: "" });
      return;
    }

    // Length check
    if (password.length >= 8) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Set message based on score
    if (score < 2) message = "Weak password";
    else if (score < 4) message = "Moderate password";
    else message = "Strong password";

    setPasswordStrength({ score, message });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!passwordData.currentPassword) {
      setSaveError("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      setSaveError("New password is required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setSaveError("Password must be at least 8 characters long");
      return;
    }

    if (passwordStrength.score < 3) {
      setSaveError("Password is too weak. Please choose a stronger password.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await AccountService.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      setSaveSuccess(true);
      themedToast.success("Password updated successfully");

      // Reset form
      updatePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Reset password strength
      setPasswordStrength({ score: 0, message: "" });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || "Failed to update password";
      setSaveError(errorMessage);
      themedToast.error("Failed to update password", {
        description: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get color for password strength indicator
  const getStrengthColor = () => {
    if (passwordStrength.score < 2) return "bg-red-500";
    if (passwordStrength.score < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password for better security</CardDescription>
      </CardHeader>
      <CardContent>
        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <AlertDescription>Password updated successfully!</AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => updatePasswordData({ currentPassword: e.target.value })}
                disabled={isSaving}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  updatePasswordData({ newPassword: e.target.value });
                  validatePassword(e.target.value);
                }}
                disabled={isSaving}
                required
              />

              {passwordData.newPassword && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">{passwordStrength.message}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => updatePasswordData({ confirmPassword: e.target.value })}
                disabled={isSaving}
                required
              />

              {passwordData.newPassword &&
                passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
            </div>
          </div>

          <Button
            type="submit"
            className="mt-6 bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90"
            disabled={
              isSaving ||
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword ||
              passwordData.newPassword !== passwordData.confirmPassword
            }
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
