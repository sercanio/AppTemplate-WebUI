import React, { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Loader2, AlertCircle, Upload, Trash2, Camera } from "lucide-react";
import { useProfile } from "../hooks/useProfile";

export function ProfilePicture() {
  const { state, validateAndUploadImage, deleteProfilePicture, getInitials } =
    useProfile();
  const { isSaving, profileUpdateError, profileData } = state;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);    try {
      await validateAndUploadImage(file);
    } catch {
      // Error handling is done in the context
    } finally {
      // Clean up preview URL
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    }
  };

  const handleDeleteClick = async () => {
    if (
      window.confirm("Are you sure you want to delete your profile picture?")
    ) {
      await deleteProfilePicture();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>Upload or change your profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar with current profile picture or preview */}
          <div className="relative group">
            <Avatar className="h-32 w-32 border-2 border-border">
              <AvatarImage
                src={previewUrl || profileData.profilePictureUrl || undefined}
                alt={profileData.userName}
              />
              <AvatarFallback className="text-3xl bg-gradient-to-r from-steel-blue to-yellow-green text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Overlay with edit button */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={triggerFileInput}
            >
              <Upload className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={triggerFileInput}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload
            </Button>

            {profileData.profilePictureUrl && (
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
                onClick={handleDeleteClick}
                disabled={isSaving}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>          {/* Error message */}
          {profileUpdateError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{profileUpdateError}</AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Recommended: Square image, at least 400x400px
            <br />
            Max file size: 3MB. Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
