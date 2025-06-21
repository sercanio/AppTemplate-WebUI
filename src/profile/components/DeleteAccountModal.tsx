import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAuthStore } from "../../auth/store/authStore";
import { useProfile } from "../hooks/useProfile";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { deleteAccount, state } = useProfile();
  const { isSaving, profileUpdateError } = state;

  const confirmationText = "DELETE MY ACCOUNT";

  const handleDelete = async () => {
    if (confirmText !== confirmationText) {
      return;
    }    try {
      await deleteAccount(password);
      
      // Log the user out
      await logout();
      
      // Redirect to home page
      navigate("/", { replace: true });
    } catch {
      // Error already handled by context
    }
  };
  const handleClose = () => {
    if (!isSaving) {
      setPassword("");
      setConfirmText("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>        {profileUpdateError && (
          <Alert variant="destructive">
            <AlertDescription>{profileUpdateError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">
              Confirm your password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm">
              Type <strong>{confirmationText}</strong> to confirm
            </Label>
            <Input
              id="confirm"
              placeholder={confirmationText}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== confirmationText || !password || isSaving}
          >
            {isSaving ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
