import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Mail, Link2, Copy, ExternalLink, User } from "lucide-react";
import { useProfile } from "../context/profileContext";
import { SocialMediaLinks } from "./SocialMediaLinks";
import { ProfilePicture } from "./ProfilePicture";
import { AccountService } from "../services/accountService";
import { themedToast } from "../../lib/toast";

export function ProfileTab() {
  const { state, setIsEditing, updateProfileData, handleProfileDataUpdate } = useProfile();
  const { isEditing, isSaving, profileData } = state;

  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail) {
      setEmailChangeError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailChangeError("Please enter a valid email address");
      return;
    }

    setIsChangingEmail(true);
    setEmailChangeSuccess(false);
    setEmailChangeError(null);

    try {
      await AccountService.changeEmail({ newEmail });
      setEmailChangeSuccess(true);
      setNewEmail("");
      themedToast.success("Email change request sent", {
        description: "Please check your new email to confirm the change"
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || "Failed to change email";
      setEmailChangeError(errorMessage);
      themedToast.error("Failed to change email", {
        description: errorMessage
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Function to copy public profile URL to clipboard
  const copyProfileUrl = () => {
    const url = `${window.location.origin}/user/${profileData.userName}`;
    navigator.clipboard.writeText(url);
    setShowCopySuccess(true);
    themedToast.success("URL copied to clipboard");
    setTimeout(() => setShowCopySuccess(false), 3000);
  };

  // Handle profile update using context method
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing) return;

    try {
      await handleProfileDataUpdate({
        biography: profileData.biography,
        socialMediaLinks: profileData.socialMediaLinks || [],
      });

      setIsEditing(false);
      themedToast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      themedToast.error("Failed to update profile", {
        description: "Please try again"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <ProfilePicture />

      {/* Email Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email
          </CardTitle>
          <CardDescription>Update your email address</CardDescription>
        </CardHeader>
        <CardContent>
          {emailChangeSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Email change request sent! Please check your new email to confirm the change.
              </AlertDescription>
            </Alert>
          )}

          {emailChangeError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{emailChangeError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentEmail">Current Email</Label>
              <Input
                id="currentEmail"
                value={profileData.email}
                disabled={true}
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="Enter your new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={isChangingEmail}
                required
              />
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90"
              disabled={isChangingEmail || !newEmail}
            >
              {isChangingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Change Email"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t px-6 py-3">
          <p className="text-xs text-muted-foreground">
            You will need to confirm your new email address before the change takes effect.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}