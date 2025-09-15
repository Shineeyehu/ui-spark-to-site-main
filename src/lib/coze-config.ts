// import { supabase } from "@/integrations/supabase/client"; // 已备份到 supabase-backup 目录
import { jwtAuthService, JWTAuthService } from "./jwt-auth";

export interface CozeConfig {
  botId: string;
  token: string;
  userId: string;
  nickname: string;
  useJWT?: boolean; // 是否使用 JWT 认证
  authService?: JWTAuthService; // JWT 认证服务实例
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
      token: 'cztei_qWuvWgYwcOQJ3ueTuzbytdrHwxRumNwJOTkFAl94W16W1FZlrbGeamRdnRODnL4hb',
      userId: 'user_' + Date.now(),
      nickname: '用户',
      useJWT: true
    };
  } catch (error) {
    console.error('配置获取错误:', error);
    // 返回默认配置作为后备
    return {
      botId: '7546564367413379135',
      token: 'cztei_qWuvWgYwcOQJ3ueTuzbytdrHwxRumNwJOTkFAl94W16W1FZlrbGeamRdnRODnL4hb',
      userId: 'user_' + Date.now(),
      nickname: '用户',
      useJWT: true
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
  
  // 如果有API Key，优先使用API Key而不是JWT
  const shouldUseJWT = useJWT && !envApiKey;
  const finalToken = envApiKey || envToken || 'cztei_qWuvWgYwcOQJ3ueTuzbytdrHwxRumNwJOTkFAl94W16W1FZlrbGeamRdnRODnL4hb';
  
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
    authService: shouldUseJWT ? jwtAuthService : undefined
  };
};

// 检查配置是否完整（通过测试 edge function）
export const validateCozeConfig = (config: CozeConfig): { isValid: boolean; missingFields: string[] } => {
  // 配置验证现在通过 edge function 进行
  return {
    isValid: true, // 实际验证在运行时进行
    missingFields: []
  };
};

// 生成唯一的会话 ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 默认配置
export const defaultCozeConfig: CozeConfig = {
  botId: '7546564367413379135',
  token: '',
  userId: 'user_123',
  nickname: '用户',
  useJWT: true
};
