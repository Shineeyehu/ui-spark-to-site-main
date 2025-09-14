/**
 * OAuth 过期问题快速修复工具
 */

import { jwtAuthService } from '@/lib/jwt-auth';

export interface OAuthFixResult {
  success: boolean;
  message: string;
  action?: string;
  details?: any;
}

/**
 * 清除所有 OAuth 相关数据
 */
export const clearOAuthData = (): OAuthFixResult => {
  try {
    // 清除本地存储的令牌
    jwtAuthService.clearTokens();
    
    // 清除其他可能的 OAuth 相关数据
    localStorage.removeItem('coze_oauth_state');
    localStorage.removeItem('coze_auth_data');
    sessionStorage.removeItem('coze_oauth_tokens');
    sessionStorage.removeItem('coze_auth_data');
    
    return {
      success: true,
      message: '已清除所有 OAuth 相关数据',
      action: '请重新进行 OAuth 授权'
    };
  } catch (error) {
    return {
      success: false,
      message: `清除数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: error
    };
  }
};

/**
 * 检查 OAuth 配置
 */
export const checkOAuthConfig = (): OAuthFixResult => {
  try {
    const config = {
      clientId: import.meta.env.VITE_COZE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_COZE_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_COZE_REDIRECT_URI,
      useJWT: import.meta.env.VITE_COZE_USE_JWT
    };
    
    const missing = [];
    if (!config.clientId) missing.push('VITE_COZE_CLIENT_ID');
    if (!config.clientSecret) missing.push('VITE_COZE_CLIENT_SECRET');
    if (!config.redirectUri) missing.push('VITE_COZE_REDIRECT_URI');
    
    if (missing.length > 0) {
      return {
        success: false,
        message: `缺少环境变量: ${missing.join(', ')}`,
        action: '请在 .env.local 文件中设置这些环境变量',
        details: config
      };
    }
    
    return {
      success: true,
      message: 'OAuth 配置完整',
      details: config
    };
  } catch (error) {
    return {
      success: false,
      message: `配置检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: error
    };
  }
};

/**
 * 检查重定向 URI 匹配
 */
export const checkRedirectUri = (): OAuthFixResult => {
  try {
    const currentOrigin = window.location.origin;
    const expectedRedirectUri = `${currentOrigin}/oauth/callback`;
    const configuredRedirectUri = import.meta.env.VITE_COZE_REDIRECT_URI;
    
    if (!configuredRedirectUri) {
      return {
        success: false,
        message: '未配置重定向 URI',
        action: '请设置 VITE_COZE_REDIRECT_URI 环境变量'
      };
    }
    
    if (configuredRedirectUri !== expectedRedirectUri) {
      return {
        success: false,
        message: '重定向 URI 不匹配',
        action: `请将重定向 URI 设置为: ${expectedRedirectUri}`,
        details: {
          current: currentOrigin,
          expected: expectedRedirectUri,
          configured: configuredRedirectUri
        }
      };
    }
    
    return {
      success: true,
      message: '重定向 URI 配置正确',
      details: {
        redirectUri: configuredRedirectUri,
        currentOrigin: currentOrigin
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `重定向 URI 检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: error
    };
  }
};

/**
 * 检查当前认证状态
 */
export const checkAuthStatus = (): OAuthFixResult => {
  try {
    const status = jwtAuthService.getAuthStatus();
    
    if (!status.isAuthenticated) {
      return {
        success: false,
        message: '未进行 OAuth 授权',
        action: '请点击"开始授权"按钮进行 OAuth 授权',
        details: status
      };
    }
    
    if (status.needsReauth) {
      return {
        success: false,
        message: '需要重新授权',
        action: '令牌已过期，请重新进行 OAuth 授权',
        details: status
      };
    }
    
    return {
      success: true,
      message: '认证状态正常',
      details: status
    };
  } catch (error) {
    return {
      success: false,
      message: `认证状态检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: error
    };
  }
};

/**
 * 尝试刷新令牌
 */
export const refreshToken = async (): Promise<OAuthFixResult> => {
  try {
    await jwtAuthService.getValidToken();
    return {
      success: true,
      message: '令牌刷新成功'
    };
  } catch (error) {
    return {
      success: false,
      message: `令牌刷新失败: ${error instanceof Error ? error.message : '未知错误'}`,
      action: '请重新进行 OAuth 授权',
      details: error
    };
  }
};

/**
 * 运行完整的 OAuth 修复检查
 */
export const runOAuthFix = async (): Promise<OAuthFixResult[]> => {
  const results: OAuthFixResult[] = [];
  
  // 1. 检查配置
  results.push(checkOAuthConfig());
  
  // 2. 检查重定向 URI
  results.push(checkRedirectUri());
  
  // 3. 检查认证状态
  results.push(checkAuthStatus());
  
  // 4. 如果认证状态正常，尝试刷新令牌
  if (results[2].success) {
    results.push(await refreshToken());
  }
  
  return results;
};

/**
 * 生成修复建议
 */
export const generateFixSuggestions = (results: OAuthFixResult[]): string[] => {
  const suggestions: string[] = [];
  
  results.forEach((result, index) => {
    if (!result.success) {
      if (result.action) {
        suggestions.push(`${index + 1}. ${result.action}`);
      } else {
        suggestions.push(`${index + 1}. ${result.message}`);
      }
    }
  });
  
  if (suggestions.length === 0) {
    suggestions.push('所有检查都通过了，OAuth 配置正常');
  }
  
  return suggestions;
};

/**
 * 一键修复 OAuth 问题
 */
export const quickFixOAuth = async (): Promise<OAuthFixResult> => {
  try {
    // 1. 清除现有数据
    const clearResult = clearOAuthData();
    if (!clearResult.success) {
      return clearResult;
    }
    
    // 2. 检查配置
    const configResult = checkOAuthConfig();
    if (!configResult.success) {
      return {
        success: false,
        message: '配置检查失败，无法自动修复',
        action: configResult.action,
        details: configResult.details
      };
    }
    
    // 3. 检查重定向 URI
    const redirectResult = checkRedirectUri();
    if (!redirectResult.success) {
      return {
        success: false,
        message: '重定向 URI 不匹配，无法自动修复',
        action: redirectResult.action,
        details: redirectResult.details
      };
    }
    
    return {
      success: true,
      message: 'OAuth 数据已清除，请重新进行授权',
      action: '点击"开始授权"按钮完成 OAuth 授权流程'
    };
  } catch (error) {
    return {
      success: false,
      message: `一键修复失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: error
    };
  }
};
