import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { ProfilePicture } from "./ProfilePicture";

export function ProfileTab() {
  const { state, changeEmail } = useProfile();
  const { profileData, isSaving, emailChangeSuccess, emailChangeError } = state;

  const [newEmail, setNewEmail] = useState("");

  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return;
    }

    await changeEmail(newEmail);
    setNewEmail("");
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
        </CardHeader>        <CardContent>
          {emailChangeSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Email change request sent! Please check your new email to
                confirm the change.
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
                disabled={isSaving}
                required
              />
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90"
              disabled={isSaving || !newEmail}
            >
              {isSaving ? (
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
            You will need to confirm your new email address before the change
            takes effect.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
