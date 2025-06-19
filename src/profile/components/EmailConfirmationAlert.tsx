import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Mail, X, RefreshCw, Clock } from "lucide-react";
import { themedToast } from "../../lib/toast";
import { useAuthStore } from "../../auth/store/authStore";
import { parseError } from "../../lib/utils";
import type { User } from "../../auth/store/authStore";

interface EmailConfirmationAlertProps {
  user: User;
}

export function EmailConfirmationAlert({ user }: EmailConfirmationAlertProps) {
  const [showNotification, setShowNotification] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const { requestEmailVerification } = useAuthStore();

  if (!user || user.emailConfirmed || !showNotification) {
    return null;
  }

  const canResend = !lastResendTime || Date.now() - lastResendTime > 60000; // 1 minute cooldown

  const handleResendEmail = async () => {
  if (!user.email || isResending || !canResend) return;

  setIsResending(true);
  try {
    await requestEmailVerification(user.email);
    setLastResendTime(Date.now());
    themedToast.success("Verification email sent", {
      description: "Please check your email inbox",
    });
  } catch (error: unknown) {
    const message = parseError(error);
    themedToast.error("Failed to send verification email", {
      description: message,
    });
  } finally {
    setIsResending(false);
  }
};

  return (
    <Alert className="relative mb-6 bg-sunglow/10 border-sunglow">
      <Mail className="h-4 w-4 text-sunglow" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotification(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground h-6 w-6"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <AlertTitle className="text-sunglow font-medium pr-8">
        Email Verification Required
      </AlertTitle>
      <AlertDescription className="text-muted-foreground space-y-3">
        <p>Please verify your email address to access all features.</p>

        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={handleResendEmail}
            disabled={isResending || !canResend}
            size="sm"
            variant="outline"
            className="border-sunglow text-sunglow hover:bg-sunglow/10"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Sending...
              </>
            ) : !canResend ? (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Wait 1 minute
              </>
            ) : (
              <>
                <Mail className="h-3 w-3 mr-1" />
                Resend Email
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
