import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useProfile } from "../hooks/useProfile";

export function StatusMessages() {
  const { state } = useProfile();
  const { 
    emailChangeSuccess, 
    emailChangeError,
    passwordChangeSuccess, 
    passwordChangeError,
    notificationUpdateSuccess, 
    notificationUpdateError,
    profileUpdateSuccess, 
    profileUpdateError 
  } = state;

  const hasSuccess = emailChangeSuccess || passwordChangeSuccess || notificationUpdateSuccess || profileUpdateSuccess;
  const hasError = emailChangeError || passwordChangeError || notificationUpdateError || profileUpdateError;

  if (!hasSuccess && !hasError) return null;

  return (
    <>
      {hasSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>Changes saved successfully!</AlertDescription>
        </Alert>
      )}

      {hasError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {emailChangeError || passwordChangeError || notificationUpdateError || profileUpdateError}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
