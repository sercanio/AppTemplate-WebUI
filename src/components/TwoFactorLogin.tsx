import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, AlertCircle, Key } from 'lucide-react';
import { useAuthStore } from '../auth/store/authStore';

interface TwoFactorLoginProps {
  onBack: () => void;
}

export function TwoFactorLogin({ onBack }: TwoFactorLoginProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWith2fa, loginWithRecoveryCode, isLoading, error } = useAuthStore();
  
  const [mode, setMode] = useState<'authenticator' | 'recovery'>('authenticator');
  const [code, setCode] = useState('');
  const [rememberMachine, setRememberMachine] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'authenticator') {
        await loginWith2fa(code, rememberMachine);
      } else {
        await loginWithRecoveryCode(code);
      }
      
      // Redirect after successful 2FA
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const formatAuthenticatorCode = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    // Limit to 6 digits and add space after 3rd digit
    const formatted = digits.slice(0, 6);
    if (formatted.length > 3) {
      return formatted.slice(0, 3) + ' ' + formatted.slice(3);
    }
    return formatted;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (mode === 'authenticator') {
      setCode(formatAuthenticatorCode(value));
    } else {
      setCode(value);
    }
  };

  return (
    <Card className="border shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-yellow-green to-steel-blue rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold">
          {mode === 'authenticator' ? 'Two-Factor Authentication' : 'Recovery Code'}
        </CardTitle>
        <CardDescription>
          {mode === 'authenticator' 
            ? 'Enter the 6-digit code from your authenticator app'
            : 'Enter one of your recovery codes'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              {mode === 'authenticator' ? 'Authenticator Code' : 'Recovery Code'}
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="code"
                type="text"
                placeholder={mode === 'authenticator' ? '000 000' : 'Enter recovery code'}
                value={code}
                onChange={handleCodeChange}
                disabled={isLoading}
                required
                className="pl-10 text-center font-mono tracking-wider"
                maxLength={mode === 'authenticator' ? 7 : undefined}
              />
            </div>
          </div>
          
          {mode === 'authenticator' && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-machine" 
                checked={rememberMachine}
                onCheckedChange={(checked) => setRememberMachine(checked as boolean)}
                disabled={isLoading}
              />
              <Label 
                htmlFor="remember-machine" 
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Remember this machine
              </Label>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90 text-white"
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>

        <div className="space-y-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setMode(mode === 'authenticator' ? 'recovery' : 'authenticator')}
            disabled={isLoading}
          >
            {mode === 'authenticator' 
              ? 'Use recovery code instead' 
              : 'Use authenticator app instead'
            }
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isLoading}
          >
            Back to login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
