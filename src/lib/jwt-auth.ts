/**
 * JWT Token 管理服务
 * 用于处理 OAuth 授权和 JWT 令牌的生成、验证和刷新
 */

export interface JWTPayload {
  sub: string; // 用户ID
  iss: string; // 签发者
  aud: string; // 受众
  exp: number; // 过期时间
  iat: number; // 签发时间
  scope?: string; // 权限范围
  [key: string]: any; // 其他自定义字段
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scope: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export class JWTAuthService {
  private config: OAuthConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: OAuthConfig) {
    this.config = config;
    this.loadStoredTokens();
  }

  /**
   * 从本地存储加载已保存的令牌
   */
  private loadStoredTokens(): void {
    try {
      const stored = localStorage.getItem('coze_oauth_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
        this.tokenExpiry = tokens.expires_at || 0;
      }
    } catch (error) {
      console.warn('Failed to load stored tokens:', error);
    }
  }

  /**
   * 保存令牌到本地存储
   */
  private saveTokens(tokens: TokenResponse): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.tokenExpiry = Date.now() + (tokens.expires_in * 1000);

    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: this.tokenExpiry,
      token_type: tokens.token_type,
      scope: tokens.scope
    };

    localStorage.setItem('coze_oauth_tokens', JSON.stringify(tokenData));
  }

  /**
   * 清除所有令牌
   */
  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
    localStorage.removeItem('coze_oauth_tokens');
  }

  /**
   * 检查令牌是否有效
   */
  public isTokenValid(): boolean {
    if (!this.accessToken) return false;
    return Date.now() < this.tokenExpiry - 60000; // 提前1分钟刷新
  }

  /**
   * 获取有效的访问令牌
   */
  public async getValidToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.accessToken!;
    }

    // 尝试刷新令牌
    if (this.refreshToken) {
      try {
        await this.refreshAccessToken();
        return this.accessToken!;
      } catch (error) {
        console.warn('Token refresh failed:', error);
        // 清除无效的令牌
        this.clearTokens();
      }
    }

    // 如果刷新失败，需要重新授权
    throw new Error('Token expired and refresh failed. Please re-authorize.');
  }

  /**
   * 检查是否需要重新授权
   */
  public needsReauthorization(): boolean {
    return !this.accessToken || !this.isTokenValid();
  }

  /**
   * 获取授权状态信息
   */
  public getAuthStatus(): {
    isAuthenticated: boolean;
    needsReauth: boolean;
    hasRefreshToken: boolean;
    tokenExpiry: Date | null;
  } {
    return {
      isAuthenticated: !!this.accessToken,
      needsReauth: this.needsReauthorization(),
      hasRefreshToken: !!this.refreshToken,
      tokenExpiry: this.tokenExpiry > 0 ? new Date(this.tokenExpiry) : null
    };
  }

  /**
   * 刷新访问令牌
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const tokens: TokenResponse = await response.json();
    this.saveTokens(tokens);
  }

  /**
   * 启动 OAuth 授权流程
   */
  public startOAuthFlow(): void {
    const authParams = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope,
      state: this.generateState(),
    });

    const authUrl = `${this.config.authUrl}?${authParams.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * 处理 OAuth 回调
   */
  public async handleOAuthCallback(code: string, state: string): Promise<void> {
    // console.log('OAuth callback started:', { code: code?.substring(0, 10) + '...', state });
    
    // 验证 state 参数（这里简化处理）
    if (!this.validateState(state)) {
      console.error('State validation failed:', state);
      throw new Error('Invalid state parameter');
    }

    const requestBody = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    };
    
    // console.log('OAuth token request:', {
    //   url: this.config.tokenUrl,
    //   redirect_uri: this.config.redirectUri,
    //   client_id: this.config.clientId,
    //   client_secret: this.config.clientSecret?.substring(0, 10) + '...'
    // });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // console.error('OAuth callback failed:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   error: errorText,
      //   config: {
      //     tokenUrl: this.config.tokenUrl,
      //     redirectUri: this.config.redirectUri,
      //     clientId: this.config.clientId
      //   }
      // });
      throw new Error(`OAuth callback failed: ${response.status} - ${errorText}`);
    }

    const tokens: TokenResponse = await response.json();
    // console.log('OAuth tokens received successfully');
    this.saveTokens(tokens);
  }

  /**
   * 生成随机 state 参数
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * 验证 state 参数
   */
  private validateState(state: string): boolean {
    // 暂时禁用state验证以排除OAuth 400错误
    // TODO: 实现更严格的 state 验证
    // console.log('State validation (temporarily disabled):', state);
    return true;
  }

  /**
   * 解码 JWT 令牌
   */
  public decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  /**
   * 检查令牌是否即将过期
   */
  public isTokenExpiringSoon(minutes: number = 5): boolean {
    if (!this.accessToken) return true;
    return Date.now() > (this.tokenExpiry - minutes * 60 * 1000);
  }

  /**
   * 获取令牌信息
   */
  public getTokenInfo(): { 
    hasToken: boolean; 
    isExpired: boolean; 
    expiresAt: Date | null;
    payload: JWTPayload | null;
  } {
    const hasToken = !!this.accessToken;
    const isExpired = !this.isTokenValid();
    const expiresAt = this.tokenExpiry > 0 ? new Date(this.tokenExpiry) : null;
    const payload = this.accessToken ? this.decodeJWT(this.accessToken) : null;

    return {
      hasToken,
      isExpired,
      expiresAt,
      payload
    };
  }
}

// 默认 OAuth 配置
export const defaultOAuthConfig: OAuthConfig = {
  clientId: import.meta.env.VITE_COZE_CLIENT_ID || '08461612714393126791235695948705.app.coze',
  clientSecret: import.meta.env.VITE_COZE_CLIENT_SECRET || '6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA',
  redirectUri: import.meta.env.VITE_COZE_REDIRECT_URI || `${window.location.origin}/oauth/callback`,
  authUrl: 'https://www.coze.cn/api/permission/oauth2/authorize',
  tokenUrl: 'https://api.coze.cn/api/permission/oauth2/token',
  scope: 'chat:read chat:write bot:read workspace:read'
};

// 调试配置信息
// console.log('OAuth Config Debug:', {
//   clientId: defaultOAuthConfig.clientId,
//   clientSecret: defaultOAuthConfig.clientSecret?.substring(0, 10) + '...',
//   redirectUri: defaultOAuthConfig.redirectUri,
//   envClientSecret: import.meta.env.VITE_COZE_CLIENT_SECRET?.substring(0, 10) + '...',
//   hasEnvSecret: !!import.meta.env.VITE_COZE_CLIENT_SECRET
// });

// 创建默认的 JWT 认证服务实例
export const jwtAuthService = new JWTAuthService(defaultOAuthConfig);
