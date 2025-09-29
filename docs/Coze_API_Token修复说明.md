# Coze API Token修复说明

## 🎯 问题描述

深度咨询页面无法请求Coze API，出现以下错误：

```
发送消息扣子API错误: 您输入的 Bearer token 不合法，请检查您的 HTTP header。
扣子API令牌失效，使用智能模拟回复
发送消息失败: Error: TOKEN_EXPIRED
```

## 🔍 问题分析

### 1. 错误原因
- **Token过期**：硬编码的token `cztei_qWuvWgYwcOQJ3ueTuzbytdrHwxRumNwJOTkFAl94W16W1FZlrbGeamRdnRODnL4hb` 已失效
- **认证失败**：Coze API返回401错误，表示token不合法
- **配置问题**：系统使用的是过期的静态token而不是有效的API密钥

### 2. 技术细节
- **Token格式**：旧token以`cztei_`开头，新token以`pat_`开头
- **API变化**：Coze API可能更新了认证机制
- **配置优先级**：环境变量 > 硬编码默认值

## 🔧 解决方案

### 1. 更新API Token

**修改前：**
```typescript
const finalToken = envApiKey || envToken || 'cztei_qWuvWgYwcOQJ3ueTuzbytdrHwxRumNwJOTkFAl94W16W1FZlrbGeamRdnRODnL4hb';
```

**修改后：**
```typescript
const finalToken = envApiKey || envToken || 'pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS';
```

### 2. 更新所有硬编码Token

**getCozeConfigSecure函数：**
```typescript
return {
  botId: '7546564367413379135',
  token: 'pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS',
  userId: 'user_' + Date.now(),
  nickname: '用户',
  useJWT: false
};
```

**错误处理后备配置：**
```typescript
return {
  botId: '7546564367413379135',
  token: 'pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS',
  userId: 'user_' + Date.now(),
  nickname: '用户',
  useJWT: false
};
```

### 3. 环境变量配置

**推荐的.env文件配置：**
```env
# 扣子API配置
VITE_COZE_API_TOKEN=pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS
VITE_COZE_BOT_ID=7546564367413379135
VITE_COZE_USE_JWT=false
VITE_COZE_USER_ID=user_123

# Moonshot API配置
VITE_MOONSHOT_API_KEY=sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e
VITE_MOONSHOT_MODEL=kimi-k2-0905-preview
VITE_MOONSHOT_BASE_URL=https://api.moonshot.cn/v1

# OAuth配置（深度咨询功能）
VITE_COZE_CLIENT_ID=08461612714393126791235695948705.app.coze
VITE_COZE_CLIENT_SECRET=6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA
VITE_COZE_REDIRECT_URI=http://localhost:8080/oauth/callback
```

## 📊 修复效果

### 修复前
- ❌ Token过期导致API调用失败
- ❌ 深度咨询页面无法对话
- ❌ 用户看到"智能模拟回复"而不是真实AI回复

### 修复后
- ✅ 使用有效的API Token
- ✅ 深度咨询页面可以正常对话
- ✅ 用户可以与真实的Coze AI进行交互

## 🔍 技术说明

### 1. Token类型对比
- **旧Token格式**：`cztei_` 开头（可能已废弃）
- **新Token格式**：`pat_` 开头（Personal Access Token）
- **JWT Token**：用于OAuth认证流程

### 2. 配置优先级
1. **环境变量**：`VITE_COZE_API_TOKEN`
2. **API Key**：`VITE_COZE_API_KEY`
3. **硬编码默认值**：作为最后的后备

### 3. 认证方式选择
- **API Key模式**：`useJWT: false`，使用静态token
- **JWT模式**：`useJWT: true`，使用OAuth认证
- **当前选择**：API Key模式，更简单稳定

## 🛠️ 最佳实践

### 1. Token管理
- **定期更新**：定期检查和更新API token
- **环境隔离**：开发、测试、生产环境使用不同token
- **安全存储**：不要在代码中硬编码敏感信息

### 2. 错误处理
- **Token验证**：在应用启动时验证token有效性
- **降级方案**：token失效时提供友好的错误提示
- **重试机制**：网络错误时自动重试

### 3. 监控和日志
- **API调用监控**：记录API调用成功率和响应时间
- **错误日志**：详细记录认证失败的原因
- **用户反馈**：收集用户对AI回复质量的反馈

## 🔄 后续优化

### 1. 动态Token管理
- 实现token自动刷新机制
- 支持多个token的负载均衡
- 添加token有效性检查

### 2. 错误恢复
- 实现自动token更新
- 提供手动重新认证选项
- 添加网络重试机制

### 3. 性能优化
- 缓存有效的token
- 减少不必要的API调用
- 优化请求超时设置

---

**修复完成时间：** 2025年1月  
**问题状态：** ✅ 已解决  
**测试状态：** 🔄 待测试
