/**
 * 环境变量检查工具
 * 用于诊断Vercel环境变量配置问题
 */

export interface EnvCheckResult {
  variable: string;
  value: string | undefined;
  isSet: boolean;
  isProduction: boolean;
  recommendation: string;
}

export function checkEnvironmentVariables(): EnvCheckResult[] {
  const isProduction = import.meta.env.PROD;
  
  const variables = [
    {
      variable: 'VITE_MOONSHOT_API_KEY',
      value: import.meta.env.VITE_MOONSHOT_API_KEY,
      isSet: !!import.meta.env.VITE_MOONSHOT_API_KEY,
      isProduction,
      recommendation: isProduction 
        ? '生产环境必须设置此变量' 
        : '开发环境可选，但建议设置'
    },
    {
      variable: 'VITE_MOONSHOT_MODEL',
      value: import.meta.env.VITE_MOONSHOT_MODEL,
      isSet: !!import.meta.env.VITE_MOONSHOT_MODEL,
      isProduction,
      recommendation: '可选，有默认值'
    },
    {
      variable: 'VITE_MOONSHOT_BASE_URL',
      value: import.meta.env.VITE_MOONSHOT_BASE_URL,
      isSet: !!import.meta.env.VITE_MOONSHOT_BASE_URL,
      isProduction,
      recommendation: '可选，有默认值'
    },
    {
      variable: 'VITE_COZE_API_TOKEN',
      value: import.meta.env.VITE_COZE_API_TOKEN,
      isSet: !!import.meta.env.VITE_COZE_API_TOKEN,
      isProduction,
      recommendation: isProduction 
        ? '生产环境必须设置此变量' 
        : '开发环境可选，但建议设置'
    },
    {
      variable: 'VITE_COZE_BOT_ID',
      value: import.meta.env.VITE_COZE_BOT_ID,
      isSet: !!import.meta.env.VITE_COZE_BOT_ID,
      isProduction,
      recommendation: '可选，有默认值'
    }
  ];

  return variables;
}

export function logEnvironmentStatus(): void {
  console.log('=== 环境变量检查报告 ===');
  console.log('环境:', import.meta.env.PROD ? '生产环境' : '开发环境');
  console.log('时间:', new Date().toISOString());
  console.log('');
  
  const results = checkEnvironmentVariables();
  
  results.forEach(result => {
    const status = result.isSet ? '✅ 已设置' : '❌ 未设置';
    const value = result.isSet ? result.value?.substring(0, 10) + '...' : 'undefined';
    
    console.log(`${result.variable}: ${status}`);
    console.log(`  值: ${value}`);
    console.log(`  建议: ${result.recommendation}`);
    console.log('');
  });
  
  console.log('=== 检查完成 ===');
}

// 自动检查（仅在开发环境）
if (import.meta.env.DEV) {
  logEnvironmentStatus();
}
