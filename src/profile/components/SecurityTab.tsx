import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Shield,
  Smartphone,
  Copy,
  Download,
  RotateCcw,
  ShieldOff,
  Monitor
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { themedToast } from "../../lib/toast";
import QRCode from "qrcode";

export function SecurityTab() {  const { 
    state, 
    updatePasswordData, 
    handlePasswordChange,
    loadTwoFactorStatus,
    loadAuthenticatorDetails,
    enableTwoFactor,
    disableTwoFactor,
    resetAuthenticator,
    generateRecoveryCodes,
    forgetBrowser,
    setShowRecoveryCodes,
    setAuthenticatorDetails
  } = useProfile();
  
  const { 
    passwordData, 
    isSaving, 
    passwordChangeSuccess, 
    passwordChangeError,
    twoFactorStatus,
    authenticatorDetails,
    generatedRecoveryCodes,
    showRecoveryCodes,
    twoFactorSuccess,
    twoFactorError
  } = state;
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    message: string;
  }>({ score: 0, message: "" });

  const [verificationCode, setVerificationCode] = useState("");
  const [clientQrCode, setClientQrCode] = useState<string | null>(null);

  // Load 2FA status on component mount
  useEffect(() => {
    loadTwoFactorStatus();
  }, [loadTwoFactorStatus]);

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

  // Get color for password strength indicator
  const getStrengthColor = () => {
    if (passwordStrength.score < 2) return "bg-red-500";
    if (passwordStrength.score < 4) return "bg-yellow-500";
    return "bg-green-500";
  };
  // Helper functions for 2FA
  const handleSetupAuthenticator = async () => {
    await loadAuthenticatorDetails();
  };

  const generateClientQrCode = async (authenticatorUri: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(authenticatorUri, {
        width: 192, // 48 * 4 for better quality
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setClientQrCode(qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setClientQrCode(null);
    }
  };

  // Generate client-side QR code when authenticator details are loaded
  useEffect(() => {
    if (authenticatorDetails?.authenticatorUri) {
      generateClientQrCode(authenticatorDetails.authenticatorUri);
    }
  }, [authenticatorDetails]);

  const handleEnableTwoFactor = async () => {
    if (!verificationCode.trim()) {
      themedToast.error('Please enter the verification code');
      return;
    }
    await enableTwoFactor(verificationCode);
    setVerificationCode("");
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    themedToast.success('Copied to clipboard');
  };

  const handleDownloadRecoveryCodes = () => {
    if (!generatedRecoveryCodes) return;
    
    const content = generatedRecoveryCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password for better security</CardDescription>
        </CardHeader>      
        <CardContent>          {passwordChangeSuccess && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
              <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>Password updated successfully!</AlertDescription>
            </Alert>
          )}

          {passwordChangeError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{passwordChangeError}</AlertDescription>
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
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">Passwords do not match</p>
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

      {/* Two-Factor Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 2FA Success/Error Messages */}          {twoFactorSuccess && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
              <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>Two-factor authentication operation completed successfully!</AlertDescription>
            </Alert>
          )}

          {twoFactorError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{twoFactorError}</AlertDescription>
            </Alert>
          )}

          {/* 2FA Status Display */}
          {twoFactorStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${twoFactorStatus.is2faEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium">
                      Two-Factor Authentication {twoFactorStatus.is2faEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorStatus.is2faEnabled 
                        ? 'Your account is protected with 2FA' 
                        : 'Enable 2FA to secure your account'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant={twoFactorStatus.is2faEnabled ? 'default' : 'secondary'}>
                  {twoFactorStatus.is2faEnabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Recovery Codes Info */}
              {twoFactorStatus.is2faEnabled && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Recovery codes remaining: {twoFactorStatus.recoveryCodesLeft}</span>
                  </div>
                  {twoFactorStatus.recoveryCodesLeft < 3 && (
                    <Badge variant="destructive">Low</Badge>
                  )}
                </div>
              )}

              {/* Machine Remembered Status */}
              {twoFactorStatus.is2faEnabled && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      This browser is {twoFactorStatus.isMachineRemembered ? 'remembered' : 'not remembered'}
                    </span>
                  </div>
                  {twoFactorStatus.isMachineRemembered && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={forgetBrowser}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Forget Browser'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <Separator className="my-6" />

          {/* 2FA Setup/Management */}
          {!twoFactorStatus?.is2faEnabled ? (
            /* Setup 2FA */
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Enable Two-Factor Authentication</h3>
              
              {!authenticatorDetails ? (
                <div className="text-center py-6">
                  <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Set up two-factor authentication using an authenticator app like Google Authenticator or Authy
                  </p>
                  <Button onClick={handleSetupAuthenticator} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Smartphone className="mr-2 h-4 w-4" />
                        Setup Authenticator
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                /* Authenticator Setup Form */
                <div className="space-y-6">                  <div className="text-center">
                    <h4 className="font-medium mb-2">Scan QR Code</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Scan this QR code with your authenticator app                    </p>
                    
                    <div className="bg-white p-4 rounded-lg inline-block border border-border shadow-sm">
                      {/* Try server QR code first */}
                      {authenticatorDetails.qrCodeUri ? (
                        <img 
                          src={authenticatorDetails.qrCodeUri} 
                          alt="QR Code for 2FA setup"
                          className="w-48 h-48"
                          onError={(e) => {
                            console.error('Server QR Code failed to load:', authenticatorDetails.qrCodeUri);
                            e.currentTarget.style.display = 'none';
                            // Show client-generated QR code fallback
                            const clientQr = e.currentTarget.parentElement?.querySelector('.client-qr-code') as HTMLElement;
                            if (clientQr) {
                              clientQr.style.display = 'block';
                            } else {
                              // Show error fallback
                              const fallback = e.currentTarget.parentElement?.querySelector('.qr-error-fallback') as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }
                          }}
                          onLoad={() => console.log('Server QR Code loaded successfully')}
                        />
                      ) : null}
                      
                      {/* Client-generated QR code fallback */}
                      {clientQrCode && (
                        <img 
                          src={clientQrCode}
                          alt="Client-generated QR Code for 2FA setup"
                          className="client-qr-code w-48 h-48"
                          style={{ display: authenticatorDetails.qrCodeUri ? 'none' : 'block' }}
                          onError={() => {
                            console.error('Client QR Code failed to display');
                            const fallback = document.querySelector('.qr-error-fallback') as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                          onLoad={() => console.log('Client QR Code loaded successfully')}
                        />
                      )}
                        {/* Error fallback when both QR codes fail */}
                      <div 
                        className="qr-error-fallback w-48 h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-center p-4"
                        style={{ display: (!authenticatorDetails.qrCodeUri && !clientQrCode) ? 'flex' : 'none' }}
                      >
                        <div>
                          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">
                            QR Code unavailable.<br />
                            Please use the manual entry key below.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSetupAuthenticator}
                            disabled={isSaving}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Manual Entry Key</Label>
                    <div className="flex gap-2">
                      <Input
                        value={authenticatorDetails.sharedKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToClipboard(authenticatorDetails.sharedKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter this key manually if you can't scan the QR code
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="Enter 6-digit code from your app"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="text-center font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleEnableTwoFactor}
                      disabled={isSaving || !verificationCode.trim()}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enabling...
                        </>
                      ) : (
                        'Enable 2FA'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAuthenticatorDetails(null)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manage 2FA */
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Manage Two-Factor Authentication</h3>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={generateRecoveryCodes}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Generate Recovery Codes
                </Button>

                <Button
                  variant="outline"
                  onClick={resetAuthenticator}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Authenticator
                </Button>
              </div>

              {/* Disable 2FA */}
              <div className="pt-4 border-t">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldOff className="h-5 w-5 text-destructive" />
                    <h4 className="font-medium text-destructive">Disable Two-Factor Authentication</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Disabling 2FA will make your account less secure. Only do this if you no longer have access to your authenticator device.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={disableTwoFactor}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      'Disable 2FA'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}          {/* Recovery Codes Display Modal */}
          {showRecoveryCodes && generatedRecoveryCodes && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Your Recovery Codes</h4>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>
              
              <div className="bg-background border border-border p-3 rounded font-mono text-sm mb-4 text-foreground">
                {generatedRecoveryCodes.map((code, index) => (
                  <div key={index} className="py-1">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleDownloadRecoveryCodes}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyToClipboard(generatedRecoveryCodes.join('\n'))}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRecoveryCodes(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
