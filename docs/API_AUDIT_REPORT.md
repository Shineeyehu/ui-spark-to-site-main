# API 全面审计报告

## 概述

本报告对项目中的所有 API 进行了全面检查，发现了多个关键问题需要修复。

## 发现的问题

### 1. Coze API 版本不一致问题 ⚠️ 严重

**问题描述**：
- `coze-api.ts` 中使用的是 `v3` API 版本
- `supabase/functions/coze-chat/index.ts` 中使用的是 `v2` API 版本
- 两个版本的 API 接口和参数格式完全不同

**影响**：
- 导致 API 调用失败
- 功能无法正常工作
- 用户体验差

**位置**：
```typescript
// coze-api.ts (v3)
const response = await fetch('https://api.coze.cn/v3/chat', {
  // v3 API 参数格式
});

// supabase/functions/coze-chat/index.ts (v2)
const cozeResponse = await fetch('https://api.coze.cn/open_api/v2/chat', {
  // v2 API 参数格式
});
```

### 2. JWT 认证配置问题 ⚠️ 严重

**问题描述**：
- `coze-api.ts` 中的 `getValidToken()` 方法没有正确处理 JWT 认证
- 缺少对 `cztei_` 前缀的检查
- 配置接口不统一

**影响**：
- JWT 认证失败
- 令牌验证错误
- 认证流程中断

### 3. Supabase Edge Functions 环境变量问题 ⚠️ 中等

**问题描述**：
- Edge Functions 中硬编码了环境变量名称
- 缺少环境变量验证
- 错误处理不完善

**影响**：
- 配置获取失败
- 错误信息不明确
- 调试困难

### 4. Moonshot API 配置问题 ⚠️ 中等

**问题描述**：
- API Key 硬编码在代码中
- 缺少环境变量配置
- 没有错误重试机制

**影响**：
- 安全性问题
- 配置不灵活
- 错误处理不完善

### 5. API 调用错误处理不统一 ⚠️ 中等

**问题描述**：
- 不同组件的错误处理方式不一致
- 缺少统一的错误码处理
- 用户友好的错误信息不足

**影响**：
- 调试困难
- 用户体验差
- 维护成本高

## 详细问题分析

### Coze API 版本问题

#### 问题 1：API 版本不一致

**当前状态**：
```typescript
// coze-api.ts - 使用 v3 API
const response = await fetch('https://api.coze.cn/v3/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    bot_id: this.config.botId,
    user_id: this.config.userId,
    stream: true,
    additional_messages: [...],
    // v3 参数格式
  })
});

// supabase/functions/coze-chat/index.ts - 使用 v2 API
const cozeResponse = await fetch('https://api.coze.cn/open_api/v2/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${cozeToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    conversation_id: conversationId,
    bot_id: cozeBotId,
    user: 'user_' + Date.now(),
    query: finalMessage,
    stream: false
    // v2 参数格式
  })
});
```

**修复方案**：
1. 统一使用 v3 API 版本
2. 更新 Supabase Edge Function
3. 确保参数格式一致

#### 问题 2：JWT 认证处理

**当前状态**：
```typescript
// coze-api.ts 中的问题
private async getValidToken(): Promise<string> {
  if (this.config.useJWT && this.config.authService) {
    try {
      return await this.config.authService.getValidToken();
    } catch (error) {
      console.error('JWT token获取失败:', error);
      throw new Error('JWT token获取失败，请重新授权');
    }
  }
  return this.config.accessToken; // 缺少 cztei_ 前缀检查
}
```

**修复方案**：
1. 添加 `cztei_` 前缀检查
2. 统一认证处理逻辑
3. 改进错误处理

### Supabase Edge Functions 问题

#### 问题 1：环境变量配置

**当前状态**：
```typescript
// supabase/functions/coze-chat/index.ts
const cozeBotId = Deno.env.get('COZE_BOT_ID');
const cozeToken = Deno.env.get('COZE_API_TOKEN');
```

**问题**：
- 环境变量名称不一致
- 缺少默认值处理
- 错误信息不明确

#### 问题 2：API 调用逻辑

**当前状态**：
- 使用 v2 API 但参数格式不正确
- 缺少流式处理支持
- 错误处理不完善

### Moonshot API 问题

#### 问题 1：配置管理

**当前状态**：
```typescript
// moonshot-api.ts
export const defaultMoonshotConfig: MoonshotConfig = {
  apiKey: 'sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e', // 硬编码
  model: 'kimi-k2-0905-preview',
  baseUrl: 'https://api.moonshot.cn/v1'
};
```

**问题**：
- API Key 硬编码
- 缺少环境变量支持
- 安全性问题

## 修复优先级

### 高优先级 (立即修复)

1. **统一 Coze API 版本**
   - 将所有 API 调用统一到 v3 版本
   - 更新 Supabase Edge Functions
   - 确保参数格式一致

2. **修复 JWT 认证问题**
   - 添加 `cztei_` 前缀检查
   - 统一认证处理逻辑
   - 改进错误处理

### 中优先级 (近期修复)

3. **改进 Supabase Edge Functions**
   - 统一环境变量配置
   - 改进错误处理
   - 添加日志记录

4. **优化 Moonshot API 配置**
   - 使用环境变量
   - 添加配置验证
   - 改进错误处理

### 低优先级 (长期优化)

5. **统一错误处理**
   - 创建统一的错误处理机制
   - 添加错误码映射
   - 改进用户友好的错误信息

6. **添加 API 监控**
   - 添加 API 调用监控
   - 实现重试机制
   - 添加性能监控

## 修复方案

### 1. 统一 Coze API 版本

```typescript
// 修复后的 coze-api.ts
class CozeAPI {
  // 统一使用 v3 API
  async sendMessage(message: string, conversationId?: string): Promise<CozeResponse> {
    const token = await this.getValidToken();
    const response = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: this.config.botId,
        user_id: this.config.userId,
        stream: false,
        additional_messages: [{
          content: message,
          content_type: 'text',
          role: 'user',
          type: 'question'
        }],
        parameters: {},
        enable_card: false,
        publish_status: 'published_online',
        auto_save_history: true
      })
    });
    // ... 处理响应
  }
}
```

### 2. 修复 JWT 认证

```typescript
// 修复后的 getValidToken 方法
private async getValidToken(): Promise<string> {
  if (this.config.useJWT && this.config.authService) {
    try {
      return await this.config.authService.getValidToken();
    } catch (error) {
      console.error('JWT token获取失败:', error);
      throw new Error('JWT token获取失败，请重新授权');
    }
  }
  
  // 检查传统 token 格式
  if (this.config.accessToken && !this.config.accessToken.startsWith('cztei_')) {
    throw new Error('Token格式不正确，应以cztei_开头');
  }
  
  return this.config.accessToken;
}
```

### 3. 更新 Supabase Edge Functions

```typescript
// 修复后的 supabase/functions/coze-chat/index.ts
serve(async (req) => {
  try {
    const { message, birthInfo, conversationId } = await req.json();
    
    // 获取配置
    const cozeBotId = Deno.env.get('COZE_BOT_ID') || '7546564367413379135';
    const cozeToken = Deno.env.get('COZE_API_TOKEN');
    
    if (!cozeToken) {
      throw new Error('COZE_API_TOKEN 未配置');
    }

    // 使用 v3 API
    const cozeResponse = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: cozeBotId,
        user_id: 'user_' + Date.now(),
        stream: false,
        additional_messages: [{
          content: message,
          content_type: 'text',
          role: 'user',
          type: 'question'
        }],
        parameters: {},
        enable_card: false,
        publish_status: 'published_online',
        auto_save_history: true
      })
    });
    // ... 处理响应
  } catch (error) {
    // ... 错误处理
  }
});
```

## 测试建议

### 1. API 版本测试

```bash
# 测试 v3 API 调用
curl -X POST https://api.coze.cn/v3/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bot_id": "7546564367413379135",
    "user_id": "test_user",
    "stream": false,
    "additional_messages": [{
      "content": "测试消息",
      "content_type": "text",
      "role": "user",
      "type": "question"
    }]
  }'
```

### 2. JWT 认证测试

```javascript
// 测试 JWT 认证
const authService = new JWTAuthService(config);
try {
  const token = await authService.getValidToken();
  console.log('JWT 认证成功:', token);
} catch (error) {
  console.error('JWT 认证失败:', error);
}
```

### 3. Supabase Edge Functions 测试

```bash
# 测试 Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/coze-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "测试消息"}'
```

## 总结

项目中的 API 存在多个严重问题，主要集中在：

1. **API 版本不一致** - 需要立即修复
2. **JWT 认证问题** - 需要立即修复
3. **配置管理问题** - 需要改进
4. **错误处理不统一** - 需要优化

建议按照优先级逐步修复这些问题，确保系统的稳定性和可靠性。

---

**注意**：修复这些问题需要仔细测试，建议在开发环境中先进行测试，确认无误后再部署到生产环境。
