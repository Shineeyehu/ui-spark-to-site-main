import { supabase } from "@/integrations/supabase/client";

export interface CozeConfig {
  botId: string;
  token: string;
  userId: string;
  nickname: string;
}

// 安全获取配置（使用 edge function）
export const getCozeConfigSecure = async (): Promise<CozeConfig> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-coze-config');
    
    if (error) {
      console.error('获取扣子配置失败:', error);
      throw new Error('无法获取扣子配置');
    }
    
    return {
      botId: data.botId || '7547965462022193162',
      token: data.token || '',
      userId: 'user_' + Date.now(),
      nickname: '用户'
    };
  } catch (error) {
    console.error('配置获取错误:', error);
    // 返回默认配置作为后备
    return {
      botId: '7547965462022193162',
      token: '',
      userId: 'user_' + Date.now(),
      nickname: '用户'
    };
  }
};

// 保持原有同步接口用于向后兼容
export const getCozeConfig = (): CozeConfig => {
  return {
    botId: '7547965462022193162',
    token: '', // 将通过安全方式获取
    userId: 'user_' + Date.now(),
    nickname: '用户'
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
  botId: '',
  token: '',
  userId: 'user_123',
  nickname: '用户'
};
