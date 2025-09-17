// 配置检查工具
import { defaultCozeConfig } from './coze-api';

export interface ConfigStatus {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

export function checkCozeConfig(): ConfigStatus {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // 检查必需的配置字段
  if (!defaultCozeConfig.botId || defaultCozeConfig.botId === 'your_bot_id') {
    missingFields.push('VITE_COZE_BOT_ID');
  }

  if (!defaultCozeConfig.token || defaultCozeConfig.token === 'your_access_token') {
    missingFields.push('VITE_COZE_ACCESS_TOKEN');
  }

  if (!defaultCozeConfig.userId || defaultCozeConfig.userId === 'user_123') {
    warnings.push('建议设置自定义的 VITE_COZE_USER_ID');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
}

export function getConfigInstructions(): string {
  return `
扣子智能体配置说明：

1. 在项目根目录创建 .env.local 文件
2. 添加以下环境变量：

VITE_COZE_BOT_ID=你的智能体ID
VITE_COZE_USER_ID=用户ID（可选，默认为user_123）
VITE_COZE_ACCESS_TOKEN=你的访问令牌

3. 重启开发服务器以加载新的环境变量

获取配置信息：
- 登录扣子平台 (https://www.coze.cn)
- 创建或选择你的智能体
- 在设置中找到 Bot ID 和 Access Token
  `;
}
