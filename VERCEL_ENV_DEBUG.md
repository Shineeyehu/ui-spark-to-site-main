# Vercel 环境变量调试指南

## 🚨 当前错误
```
Error: Moonshot API Key 未配置。请在环境变量中设置 VITE_MOONSHOT_API_KEY，或联系管理员配置API密钥。
```

## 🔍 问题分析

### 错误来源
错误来自 `src/lib/moonshot-api.ts` 第68-71行：
```typescript
private validateConfig(): void {
  if (!this.config.apiKey || this.config.apiKey.trim() === '') {
    console.error('Moonshot API Key 未配置或为空');
    throw new Error('Moonshot API Key 未配置。请在环境变量中设置 VITE_MOONSHOT_API_KEY，或联系管理员配置API密钥。');
  }
}
```

### 可能的原因
1. **环境变量未设置**：Vercel中没有设置 `VITE_MOONSHOT_API_KEY`
2. **环境变量名称错误**：变量名不匹配
3. **环境变量值错误**：值为空或格式不正确
4. **部署未生效**：环境变量设置后未重新部署

## 🛠️ 解决方案

### 方案1：检查Vercel环境变量设置

1. **登录Vercel控制台**
   - 访问：https://vercel.com/dashboard
   - 找到项目：`ui-spark-to-site-main`

2. **检查环境变量**
   - 进入：Settings → Environment Variables
   - 确认以下变量已设置：
     ```
     VITE_MOONSHOT_API_KEY=sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e
     VITE_MOONSHOT_MODEL=kimi-k2-0905-preview
     VITE_MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
     ```

3. **重新部署**
   - 进入：Deployments
   - 点击最新部署的 "..." 菜单
   - 选择：Redeploy

### 方案2：添加环境变量调试信息

在代码中添加调试信息，帮助诊断问题：

```typescript
// 在 src/lib/moonshot-api.ts 中添加调试信息
private validateConfig(): void {
  console.log('=== Moonshot API 配置调试 ===');
  console.log('VITE_MOONSHOT_API_KEY:', import.meta.env.VITE_MOONSHOT_API_KEY);
  console.log('VITE_MOONSHOT_MODEL:', import.meta.env.VITE_MOONSHOT_MODEL);
  console.log('VITE_MOONSHOT_BASE_URL:', import.meta.env.VITE_MOONSHOT_BASE_URL);
  console.log('this.config.apiKey:', this.config.apiKey);
  console.log('this.config.model:', this.config.model);
  console.log('this.config.baseUrl:', this.config.baseUrl);
  console.log('=== 调试结束 ===');
  
  if (!this.config.apiKey || this.config.apiKey.trim() === '') {
    console.error('Moonshot API Key 未配置或为空');
    throw new Error('Moonshot API Key 未配置。请在环境变量中设置 VITE_MOONSHOT_API_KEY，或联系管理员配置API密钥。');
  }
  // ... 其他验证
}
```

### 方案3：添加降级处理

如果API密钥未配置，提供降级处理：

```typescript
// 在 src/lib/moonshot-api.ts 中修改构造函数
constructor(config: MoonshotConfig) {
  this.config = { ...defaultMoonshotConfig, ...config };
  
  // 只在生产环境验证配置
  if (import.meta.env.PROD) {
    this.validateConfig();
  } else {
    console.warn('开发环境：跳过Moonshot API配置验证');
  }
}
```

## 🧪 测试步骤

1. **检查浏览器控制台**
   - 打开开发者工具
   - 查看Console中的调试信息
   - 确认环境变量是否正确加载

2. **检查网络请求**
   - 查看Network标签
   - 确认API请求是否正常发送

3. **验证环境变量**
   - 在浏览器控制台运行：
   ```javascript
   console.log('VITE_MOONSHOT_API_KEY:', import.meta.env.VITE_MOONSHOT_API_KEY);
   ```

## 📋 检查清单

- [ ] Vercel环境变量已设置
- [ ] 环境变量名称正确（区分大小写）
- [ ] 环境变量值正确（无多余空格）
- [ ] 已重新部署项目
- [ ] 浏览器控制台无其他错误
- [ ] API密钥格式正确（sk-开头）

## 🚀 快速修复

如果急需修复，可以临时在代码中硬编码API密钥：

```typescript
// 在 src/lib/moonshot-api.ts 中
export const defaultMoonshotConfig: MoonshotConfig = {
  apiKey: import.meta.env.VITE_MOONSHOT_API_KEY || 'sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e',
  model: import.meta.env.VITE_MOONSHOT_MODEL || 'kimi-k2-0905-preview',
  baseUrl: import.meta.env.VITE_MOONSHOT_BASE_URL || 'https://api.moonshot.cn/v1'
};
```

**⚠️ 注意：这只是临时解决方案，生产环境应该使用环境变量！**
