import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5070/api/v1';

export interface TwoFactorStatusResponse {
  hasAuthenticator: boolean;
  is2faEnabled: boolean;
  isMachineRemembered: boolean;
  recoveryCodesLeft: number;
}

export interface AuthenticatorDetailsResponse {
  sharedKey: string;
  authenticatorUri: string;
  qrCodeUri: string;
}

export interface EnableAuthenticatorRequest {
  code: string;
}

export interface GenerateRecoveryCodesResponse {
  recoveryCodes: string[];
}

export class TwoFactorService {
  /**
   * Get 2FA status for the current user
   */
  static async getTwoFactorStatus(): Promise<TwoFactorStatusResponse> {
    const response = await axios.get<TwoFactorStatusResponse>(
      `${API_URL}/Account/2fa/status`,
      { withCredentials: true }
    );
    return response.data;
  }

  /**
   * Get authenticator setup details (QR code, shared key)
   */
  static async getAuthenticatorDetails(): Promise<AuthenticatorDetailsResponse> {
    const response = await axios.get<AuthenticatorDetailsResponse>(
      `${API_URL}/Account/2fa/authenticator`,
      { withCredentials: true }
    );
    return response.data;
  }  /**
   * Enable 2FA authenticator with verification code
   */
  static async enableAuthenticator(code: string): Promise<void> {
    await axios.post(
      `${API_URL}/Account/2fa/authenticator`,
      { code },
      {
        withCredentials: true,
        headers: { 
          'Content-Type': 'application/json'
        }
      }
    );
  }  /**
   * Disable 2FA for the current user
   */
  static async disableTwoFactor(): Promise<void> {
    await axios.post(
      `${API_URL}/Account/2fa/disable`,
      {},
      { 
        withCredentials: true
      }
    );
  }  /**
   * Reset authenticator (generate new shared key)
   */
  static async resetAuthenticator(): Promise<void> {
    await axios.post(
      `${API_URL}/Account/2fa/authenticator/reset`,
      {},
      { 
        withCredentials: true
      }
    );
  }  /**
   * Generate new recovery codes
   */
  static async generateRecoveryCodes(): Promise<GenerateRecoveryCodesResponse> {
    const response = await axios.post<GenerateRecoveryCodesResponse>(
      `${API_URL}/Account/2fa/recovery-codes/generate`,
      {},
      { 
        withCredentials: true
      }
    );
    return response.data;
  }  /**
   * Forget current browser (require 2FA on next login)
   */
  static async forgetBrowser(): Promise<void> {
    await axios.post(
      `${API_URL}/Account/2fa/forget-browser`,
      {},
      { 
        withCredentials: true
      }
    );
  }
}