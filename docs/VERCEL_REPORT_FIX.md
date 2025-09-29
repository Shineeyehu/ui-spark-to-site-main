# Vercel 解读报告卡渲染问题修复指南

## 问题描述

部署到Vercel后，解读报告卡只显示文字，没有进行HTML渲染。这是因为缺少Moonshot API的环境变量配置。

## 问题原因

1. **缺少环境变量**：Vercel环境中没有配置Moonshot API相关的环境变量
2. **API调用失败**：没有有效的API Key，导致无法生成HTML格式的报告内容
3. **降级显示**：系统回退到显示纯文本内容

## 解决方案

### 步骤1：登录Vercel Dashboard

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 选择项目 `ui-spark-to-site-main`
3. 点击 **Settings** 标签
4. 选择 **Environment Variables**

### 步骤2：添加Moonshot API环境变量

在Environment Variables页面添加以下变量（Environment选择 `Production` 和 `Preview`）：

```bash
# Moonshot API 配置（用于生成解读报告卡）
VITE_MOONSHOT_API_KEY=sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e
VITE_MOONSHOT_MODEL=kimi-k2-0905-preview
VITE_MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
```

### 步骤3：验证现有环境变量

确保以下环境变量也已正确配置：

```bash
# 扣子 OAuth 配置
VITE_COZE_USE_JWT=false
VITE_COZE_CLIENT_ID=08461612714393126791235695948705.app.coze
VITE_COZE_CLIENT_SECRET=6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA
VITE_COZE_REDIRECT_URI=https://ui-spark-to-site-main.vercel.app/oauth/callback
VITE_COZE_BOT_ID=7546564367413379135
VITE_COZE_USER_ID=user_123
VITE_COZE_NICKNAME=用户

# 扣子 API Token 配置
VITE_COZE_API_KEY=pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS
VITE_COZE_API_TOKEN=pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS
```

### 步骤4：重新部署

配置完环境变量后，需要触发重新部署：

1. **方法1**：推送代码更改到main分支
2. **方法2**：在Vercel Dashboard中点击 **Redeploy** 按钮

### 步骤5：测试验证

部署完成后，测试报告卡功能：

1. 访问生日页面：`https://your-domain.vercel.app/birthday`
2. 填写信息并提交
3. 查看解读报告卡是否正常渲染HTML内容
4. 确认不再只显示纯文字

## 技术说明

### 代码逻辑

```typescript
// moonshot-api.ts 中的配置
export const defaultMoonshotConfig: MoonshotConfig = {
  apiKey: import.meta.env.VITE_MOONSHOT_API_KEY || 'sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e',
  model: import.meta.env.VITE_MOONSHOT_MODEL || 'kimi-k2-0905-preview',
  baseUrl: import.meta.env.VITE_MOONSHOT_BASE_URL || 'https://api.moonshot.cn/v1'
};
```

### 渲染逻辑

```typescript
// ReportPage.tsx 中的渲染逻辑
{!moonshotState.isStreaming && moonshotState.generatedHTML && (
  <div className="mb-6">
    <div 
      className="knowledge-card-content"
      dangerouslySetInnerHTML={{ __html: moonshotState.generatedHTML }}
    />
  </div>
)}
```

### 降级机制

如果API调用失败，系统会显示默认图片：

```typescript
{!moonshotState.isGenerating && !moonshotState.isStreaming && !moonshotState.generatedHTML && !moonshotState.error && (
  <div className="flex flex-col items-center justify-center">
    <img 
      src="/lovable-uploads/f705bd19-34cd-4afa-894e-12b414403c8e.png" 
      alt="命理分析报告"
      className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
    />
  </div>
)}
```

## 故障排除

### 如果问题仍然存在：

1. **检查环境变量**：
   - 确认变量名称完全匹配（区分大小写）
   - 确认已添加到Production和Preview环境
   - 确认API Key有效且未过期

2. **检查部署日志**：
   - 在Vercel Dashboard的Functions标签查看部署日志
   - 查找API调用相关的错误信息

3. **检查网络请求**：
   - 打开浏览器开发者工具
   - 查看Network标签中的API请求
   - 确认请求状态和响应内容

4. **本地测试**：
   - 在本地环境创建.env.local文件
   - 添加相同的环境变量
   - 测试本地是否正常工作

### 常见错误信息：

- `Moonshot API Key 未配置`：环境变量VITE_MOONSHOT_API_KEY未设置
- `HTTP error! status: 401`：API Key无效或已过期
- `HTTP error! status: 429`：API调用频率超限
- `Failed to load prompt`：无法加载prompt.txt文件

## 预期结果

修复完成后，解读报告卡应该：

1. ✅ 显示完整的HTML格式内容
2. ✅ 包含样式和布局
3. ✅ 支持流式生成显示
4. ✅ 提供重新生成和清空功能
5. ✅ 正确处理错误状态

---

**注意**：配置完环境变量后，必须重新部署才能生效。如果问题仍然存在，请检查API Key的有效性和网络连接。