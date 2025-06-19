import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export function AuthWarning() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Alert className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to view your profile.
        </AlertDescription>
      </Alert>
      <Button 
        className="mt-4 bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90"
        onClick={() => navigate("/login")}
      >
        Go to Login
      </Button>
    </div>
  );
}
