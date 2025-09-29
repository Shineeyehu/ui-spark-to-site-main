# Vercel 部署超时问题修复指南

## 问题描述

在 Vercel 部署的版本中遇到以下问题：
1. **30秒超时错误**：`fetchError: Request timeout after 30000ms`
2. **HTML渲染问题**：本地能正常渲染HTML卡片，线上只显示文字
3. **生成速度慢**：本地生成需要3-5分钟，线上经常超时

## 根本原因分析

### 1. Vercel 默认超时限制
- Vercel 免费版默认函数超时为 10 秒
- Pro 版默认为 60 秒，最大可设置 300 秒
- 我们的 AI 生成任务需要更长时间

### 2. API 超时配置不足
- 原始配置：普通请求 60 秒，流式请求 120 秒
- 网络延迟和 AI 处理时间导致经常超时

### 3. 缺乏重试机制
- 网络不稳定时没有自动重试
- 临时性错误导致整个流程失败

## 修复措施

### 1. 更新 Vercel 配置 (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 300
    },
    "**/*.js": {
      "maxDuration": 300
    }
  },
  "routes": [
    // ... 路由配置保持不变
  ]
}
```

**关键改动**：
- 添加 `functions` 配置
- 设置 `maxDuration: 300`（5分钟超时）

### 2. 优化 API 超时设置 (`src/lib/moonshot-api.ts`)

**修改前**：
```typescript
setTimeout(() => controller.abort(), 60000);  // 60秒
setTimeout(() => controller.abort(), 120000); // 120秒
```

**修改后**：
```typescript
setTimeout(() => controller.abort(), 180000); // 180秒 (3分钟)
setTimeout(() => controller.abort(), 300000); // 300秒 (5分钟)
```

### 3. 添加重试机制

新增 `retryRequest` 方法：
```typescript
private async retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 网络错误或超时错误时重试
      if (error instanceof Error && 
          (error.message.includes('timeout') || 
           error.message.includes('network') ||
           error.message.includes('fetch'))) {
        console.warn(`请求失败，${delay}ms后进行第${attempt + 1}次重试:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        continue;
      }
      
      throw error;
    }
  }
}
```

## 部署步骤

### 1. 确认 Vercel 计划
确保使用 **Pro 计划** 或更高版本，因为：
- 免费版最大超时 10 秒
- Pro 版可设置最大 300 秒

### 2. 环境变量配置
在 Vercel Dashboard 中设置以下环境变量：
```
VITE_COZE_API_KEY=your_api_key
VITE_COZE_API_TOKEN=your_api_token
VITE_COZE_BOT_ID=your_bot_id
// ... 其他必要的环境变量
```

### 3. 重新部署
```bash
# 提交代码更改
git add .
git commit -m "fix: 修复 Vercel 超时问题和 API 重试机制"
git push

# 或者在 Vercel Dashboard 手动触发重新部署
```

### 4. 验证修复
部署完成后测试：
1. 访问报告生成页面
2. 尝试生成解读报告卡
3. 观察是否还有 30 秒超时错误
4. 确认 HTML 内容正常渲染

## 预期效果

### 修复前
- ❌ 30 秒后超时失败
- ❌ 只显示文字，无 HTML 渲染
- ❌ 网络波动导致失败

### 修复后
- ✅ 最长 5 分钟超时时间
- ✅ 正常 HTML 卡片渲染
- ✅ 自动重试机制提高成功率
- ✅ 更好的错误处理和用户反馈

## 监控和优化建议

### 1. 性能监控
- 在 Vercel Dashboard 查看函数执行时间
- 监控超时和错误率

### 2. 进一步优化
如果仍有性能问题，可考虑：
- 使用 Vercel Edge Functions（更快的冷启动）
- 实现请求队列和批处理
- 优化 AI 提示词以减少生成时间
- 添加缓存机制

### 3. 用户体验改进
- 添加进度指示器
- 显示预估等待时间
- 提供取消操作选项

## 故障排除

### 如果仍然超时
1. 检查 Vercel 计划是否支持 300 秒超时
2. 确认 `vercel.json` 配置已正确部署
3. 查看 Vercel 函数日志

### 如果 HTML 渲染异常
1. 检查 `processHTMLContent` 函数
2. 确认 CSS 样式文件正确加载
3. 查看浏览器控制台错误

### 如果重试机制不工作
1. 检查错误类型是否匹配重试条件
2. 查看控制台重试日志
3. 调整重试次数和延迟时间

---

**注意**：此修复需要 Vercel Pro 计划或更高版本。如果使用免费版，建议升级或考虑其他部署方案。