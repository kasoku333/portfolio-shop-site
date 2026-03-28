// Google OAuth 2.0 types

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
  refresh_token?: string;
}

export interface GoogleUserInfo {
  sub: string;        // Google のユーザー ID
  name: string;
  email: string;
  email_verified: boolean;
  picture?: string;
}
