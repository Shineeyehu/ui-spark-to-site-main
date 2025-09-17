// import { supabase } from "@/integrations/supabase/client"; // 已备份到 supabase-backup 目录
import { jwtAuthService, JWTAuthService } from "./jwt-auth";

export interface CozeConfig {
  botId: string;
  token: string;
  userId: string;
  nickname: string;
  useJWT?: boolean; // 是否使用 JWT 认证
  authService?: JWTAuthService; // JWT 认证服务实例
  apiVersion?: 'v3'; // API版本，固定为v3
  baseUrl?: string; // API基础URL
  streamEnabled?: boolean; // 是否启用流式响应
  timeout?: number; // 请求超时时间（毫秒）
  maxRetries?: number; // 最大重试次数
  pollInterval?: number; // 轮询间隔（毫秒）
}

// 安全获取配置（使用 edge function）- 原 Supabase 实现已注释，代码已备份到 supabase-backup 目录
export const getCozeConfigSecure = async (): Promise<CozeConfig> => {
  try {
    // 原 Supabase Edge Function 调用已注释
    // const { data, error } = await supabase.functions.invoke('get-coze-config');
    // if (error) {
    //   console.error('获取扣子配置失败:', error);
    //   throw new Error('无法获取扣子配置');
    // }
    // return {
    //   botId: data.botId || '7546564367413379135',
    //   token: data.token || 'cztei_qWuvWgYwcOQJ3ueTuzbytdrHwxRumNwJOTkFAl94W16W1FZlrbGeamRdnRODnL4hb',
    //   userId: 'user_' + Date.now(),
    //   nickname: '用户',
    //   useJWT: true
    // };
    
    // 直接返回默认配置，不再依赖 Supabase
    return {
      botId: '7546564367413379135',
      token: 'cztei_h3PIX7eNoYtT3QARXJCRj81PrddERv11OOiU7PkiqIhTdiHHBkrUcEhAhies5osJ0',
      userId: 'user_' + Date.now(),
      nickname: '用户',
      useJWT: false, // 暂时禁用JWT认证，使用静态token
      apiVersion: 'v3',
      baseUrl: 'https://api.coze.cn',
      streamEnabled: true,
      timeout: 300000, // 5分钟超时
      maxRetries: 30,
      pollInterval: 2000
    };
  } catch (error) {
    console.error('配置获取错误:', error);
    // 返回默认配置作为后备
    return {
      botId: '7546564367413379135',
      token: 'cztei_h3PIX7eNoYtT3QARXJCRj81PrddERv11OOiU7PkiqIhTdiHHBkrUcEhAhies5osJ0',
      userId: 'user_' + Date.now(),
      nickname: '用户',
      useJWT: false, // 暂时禁用JWT认证，使用静态token
      apiVersion: 'v3',
      baseUrl: 'https://api.coze.cn',
      streamEnabled: true,
      timeout: 300000, // 5分钟超时
      maxRetries: 30,
      pollInterval: 2000
    };
  }
};

// 保持原有同步接口用于向后兼容
export const getCozeConfig = (): CozeConfig => {
  // 优先从环境变量获取配置
  const envToken = import.meta.env.VITE_COZE_API_TOKEN;
  const envBotId = import.meta.env.VITE_COZE_BOT_ID;
  const envApiKey = import.meta.env.VITE_COZE_API_KEY; // 新增API Key支持
  const useJWT = import.meta.env.VITE_COZE_USE_JWT === 'true';
  const streamEnabled = import.meta.env.VITE_COZE_STREAM_ENABLED !== 'false'; // 默认启用流式
  const baseUrl = import.meta.env.VITE_COZE_BASE_URL || 'https://api.coze.cn';
  
  // 如果有API Key，优先使用API Key而不是JWT
  const shouldUseJWT = useJWT && !envApiKey;
  const finalToken = envApiKey || envToken || 'pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS';
  
  // 生产环境已移除调试日志
  // console.log('Coze配置选择:', {
  //   hasApiKey: !!envApiKey,
  //   hasEnvToken: !!envToken,
  //   useJWT: shouldUseJWT,
  //   finalTokenPrefix: finalToken.substring(0, 10) + '...'
  // });
  
  return {
    botId: envBotId || '7546564367413379135',
    token: finalToken,
    userId: 'user_' + Date.now(),
    nickname: '用户',
    useJWT: shouldUseJWT, // 有API Key时不使用JWT
    authService: shouldUseJWT ? jwtAuthService : undefined,
    apiVersion: 'v3', // 固定使用v3版本
    baseUrl,
    streamEnabled,
    timeout: parseInt(import.meta.env.VITE_COZE_TIMEOUT || '300000'), // 默认5分钟
    maxRetries: parseInt(import.meta.env.VITE_COZE_MAX_RETRIES || '30'),
    pollInterval: parseInt(import.meta.env.VITE_COZE_POLL_INTERVAL || '2000')
  };
};

// 检查配置是否完整（通过测试 edge function）
export const validateCozeConfig = (config: CozeConfig): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  if (!config.botId) missingFields.push('botId');
  if (!config.token) missingFields.push('token');
  if (!config.userId) missingFields.push('userId');
  if (!config.apiVersion) missingFields.push('apiVersion');
  if (!config.baseUrl) missingFields.push('baseUrl');
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// 生成唯一的会话 ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 生成唯一的用户 ID
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 获取API端点URL
export const getApiEndpoint = (config: CozeConfig, endpoint: string): string => {
  const baseUrl = config.baseUrl || 'https://api.coze.cn';
  const version = config.apiVersion || 'v3';
  return `${baseUrl}/${version}/${endpoint}`;
};

// 默认配置
export const defaultCozeConfig: CozeConfig = {
  botId: '7546564367413379135',
  token: '',
  userId: 'user_123',
  nickname: '用户',
  useJWT: false, // 暂时禁用JWT认证，使用静态token
  apiVersion: 'v3',
  baseUrl: 'https://api.coze.cn',
  streamEnabled: true,
  timeout: 300000,
  maxRetries: 30,
  pollInterval: 2000
};
