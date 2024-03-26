import { Injectable } from '@nestjs/common/decorators/core';

interface AuthCodeRequest {
  code: string;
  redirect_uri: string;
  grant_type: 'authorization_code' | 'refresh_token';
}

interface RefreshTokenRequest {
  code: string;
  refresh_token: string;
  grant_type: 'authorization_code' | 'refresh_token';
}

interface AuthCodeResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface AuthRefreshedResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

@Injectable()
export class GoogleOAuthService {
  async getAccessToken(req: AuthCodeRequest): Promise<AuthCodeResponse> {
    const reqBody = new FormData();
    reqBody.append('client_id', process.env.GOOGLE_CLIENT_ID ?? '');
    reqBody.append('client_secret', process.env.GOOGLE_CLIENT_SECRET ?? '');
    reqBody.append('redirect_uri', req.redirect_uri);
    reqBody.append('grant_type', req.grant_type);
    reqBody.append('code', req.code);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: reqBody,
    });

    return await response.json();
  }

  async getRefreshedToken(
    req: RefreshTokenRequest,
  ): Promise<AuthRefreshedResponse> {
    const reqBody = new FormData();
    reqBody.append('client_id', process.env.GOOGLE_CLIENT_ID ?? '');
    reqBody.append('client_secret', process.env.GOOGLE_CLIENT_SECRET ?? '');
    reqBody.append('grant_type', req.grant_type);
    reqBody.append('refresh_token', req.refresh_token);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: reqBody,
    });

    return await response.json();
  }

  async getNewAccessToken(refreshToken: string): Promise<string> {
    const reqBody = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: reqBody,
    });

    const data = await response.json();
    return data.access_token;
  }

  async exchangeAuthCodeForTokens(
    authCode: string,
    redirectUri: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const reqBody = new URLSearchParams({
      code: authCode,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: reqBody,
    });

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }
}
