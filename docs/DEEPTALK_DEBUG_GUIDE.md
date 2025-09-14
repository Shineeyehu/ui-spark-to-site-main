# 深度咨询对话功能调试指南

## 问题描述

通过报告页面进入深度咨询页面后，原先的对话咨询功能可能无法正常工作。

## 可能原因

### 1. OAuth JWT 认证问题
- JWT 令牌未正确获取或已过期
- OAuth 授权流程未完成
- 认证服务配置错误

### 2. 配置传递问题
- 深度咨询页面未正确传递 JWT 认证信息
- CozeV3Chat 组件未接收认证参数

### 3. API 调用问题
- 扣子 API 调用失败
- 令牌格式不正确
- 网络连接问题

## 解决方案

### 步骤 1：检查 OAuth 授权状态

1. 访问测试页面：`http://localhost:8082/coze-test`
2. 查看 "OAuth JWT 授权" 部分的状态
3. 确保显示"已连接扣子平台"和"有效"状态

### 步骤 2：测试深度咨询功能

1. 访问深度咨询测试页面：`http://localhost:8082/deeptalk-test`
2. 配置测试数据并点击"生成测试数据"
3. 在聊天界面发送测试消息
4. 查看控制台错误信息

### 步骤 3：检查配置传递

确保深度咨询页面正确传递认证信息：

```typescript
<CozeV3Chat
  botId={cozeConfig.botId}
  token={cozeConfig.token}
  userId={cozeConfig.userId}
  useJWT={cozeConfig.useJWT}
  authService={cozeConfig.authService}
  // ... 其他属性
/>
```

### 步骤 4：验证 API 调用

检查浏览器开发者工具中的网络请求：

1. 打开开发者工具 (F12)
2. 切换到 Network 标签
3. 发送一条测试消息
4. 查看 API 请求状态和响应

## 调试方法

### 1. 控制台日志

查看浏览器控制台中的日志信息：

```javascript
// 查找以下关键日志
console.log('CozeV3Chat 接收到的上下文数据:', ...);
console.log('第一步：发送扣子API消息请求:', ...);
console.log('JWT token获取失败:', ...);
```

### 2. 网络请求检查

检查以下 API 请求：

- `https://api.coze.cn/v3/chat` - 发送消息
- `https://api.coze.cn/v3/chat/retrieve` - 轮询状态
- `https://api.coze.cn/v3/chat/message/list` - 获取回复

### 3. 令牌验证

检查令牌格式和有效性：

```javascript
// JWT 令牌应该以 'eyJ' 开头
// 个人访问令牌应该以 'cztei_' 开头
console.log('Token format:', token.substring(0, 10));
```

## 常见错误及解决方案

### 错误 1：认证失败

**症状**：显示"认证失败：请重新进行OAuth授权"

**解决方案**：
1. 重新进行 OAuth 授权
2. 检查 OAuth 客户端配置
3. 确认回调 URL 正确

### 错误 2：Token 格式不正确

**症状**：显示"配置错误：Token格式不正确"

**解决方案**：
1. 检查是否启用了 JWT 认证
2. 确认 OAuth 授权已完成
3. 检查环境变量配置

### 错误 3：API 调用失败

**症状**：HTTP 错误状态码

**解决方案**：
1. 检查网络连接
2. 验证 Bot ID 配置
3. 确认 API 权限设置

### 错误 4：消息处理超时

**症状**：显示"消息处理超时"

**解决方案**：
1. 检查扣子平台服务状态
2. 减少消息长度
3. 重试发送消息

## 测试流程

### 1. 基础功能测试

1. 访问 `http://localhost:8082/coze-test`
2. 完成 OAuth 授权
3. 访问 `http://localhost:8082/deeptalk-test`
4. 发送测试消息

### 2. 完整流程测试

1. 访问 `http://localhost:8082/birthday`
2. 填写出生信息并生成报告
3. 点击"深度咨询"按钮
4. 测试对话功能

### 3. 错误处理测试

1. 故意使用无效配置
2. 测试网络断开情况
3. 验证错误提示信息

## 预防措施

### 1. 配置检查

在页面加载时检查配置：

```typescript
useEffect(() => {
  const config = getCozeConfig();
  console.log('配置状态:', config);
  
  if (!config.botId || (!config.token && !config.useJWT)) {
    setError('配置不完整，请检查设置');
  }
}, []);
```

### 2. 错误边界

添加错误边界组件：

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <CozeV3Chat {...props} />
</ErrorBoundary>
```

### 3. 用户反馈

提供清晰的错误信息和解决建议：

```typescript
if (error) {
  return (
    <div className="error-message">
      <p>对话功能暂时不可用</p>
      <p>错误原因：{error}</p>
      <Button onClick={retry}>重试</Button>
    </div>
  );
}
```

## 联系支持

如果问题仍然存在，请：

1. 收集控制台错误日志
2. 记录复现步骤
3. 提供配置信息（隐藏敏感信息）
4. 联系技术支持团队

---

**注意**：本指南基于 OAuth JWT 认证方式编写。如果使用传统个人访问令牌，请参考相应的配置文档。