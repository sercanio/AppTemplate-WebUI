import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useProfile } from "../context/profileContext";

export function StatusMessages() {
  const { state } = useProfile();
  const { saveSuccess, saveError } = state;

  if (!saveSuccess && !saveError) return null;

  return (
    <>
      {saveSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>Changes saved successfully!</AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
