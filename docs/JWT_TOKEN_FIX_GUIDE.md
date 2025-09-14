# JWT Token 过期修复指南

## 问题描述

出现错误：`JWT token获取失败: Error: Token expired and refresh failed. Please re-authorize.`

## 问题原因

1. **OAuth JWT 令牌已过期**
2. **刷新令牌也失效**
3. **需要重新进行 OAuth 授权**

## 快速解决方案

### 方法 1：通过测试页面重新授权

1. 访问 `http://localhost:8082/coze-test`
2. 在 "OAuth JWT 授权" 部分点击 "重新授权" 或 "刷新令牌"
3. 完成 OAuth 授权流程
4. 返回深度咨询页面测试

### 方法 2：清除本地存储重新授权

1. 打开浏览器开发者工具 (F12)
2. 切换到 Application/存储 标签
3. 找到 Local Storage 中的 `coze_oauth_tokens`
4. 删除该条目
5. 刷新页面重新授权

### 方法 3：使用浏览器控制台

```javascript
// 在浏览器控制台中执行
localStorage.removeItem('coze_oauth_tokens');
location.reload();
```

## 自动修复功能

系统已添加自动检测和提示功能：

### 1. 自动检测令牌状态
- 页面加载时自动检查令牌是否过期
- 显示重新授权提示卡片

### 2. 智能错误处理
- 区分不同类型的认证错误
- 提供针对性的解决方案

### 3. 一键重新授权
- 点击重新授权按钮直接跳转到 OAuth 页面
- 授权完成后自动返回并刷新状态

## 预防措施

### 1. 定期检查令牌状态

```javascript
// 检查令牌状态
const authStatus = jwtAuthService.getAuthStatus();
console.log('认证状态:', authStatus);
```

### 2. 设置令牌过期提醒

```javascript
// 检查令牌是否即将过期
if (jwtAuthService.isTokenExpiringSoon(10)) {
  console.warn('令牌将在10分钟内过期，建议重新授权');
}
```

### 3. 自动刷新机制

系统会自动尝试刷新令牌，如果失败会提示重新授权。

## 调试步骤

### 1. 检查令牌状态

```javascript
// 在浏览器控制台中执行
const authStatus = jwtAuthService.getAuthStatus();
console.log('认证状态:', authStatus);
```

### 2. 检查本地存储

```javascript
// 检查存储的令牌信息
const tokens = localStorage.getItem('coze_oauth_tokens');
console.log('存储的令牌:', tokens ? JSON.parse(tokens) : '无');
```

### 3. 清除并重新授权

```javascript
// 清除所有令牌
jwtAuthService.clearTokens();
// 开始重新授权
jwtAuthService.startOAuthFlow();
```

## 常见问题

### 问题 1：重新授权后仍然失败

**可能原因**：
- OAuth 客户端配置错误
- 回调 URL 不匹配
- 网络连接问题

**解决方案**：
1. 检查 OAuth 客户端配置
2. 确认回调 URL 正确
3. 检查网络连接

### 问题 2：授权页面无法访问

**可能原因**：
- 扣子平台服务问题
- 网络连接问题
- 客户端配置错误

**解决方案**：
1. 检查扣子平台状态
2. 尝试刷新页面
3. 检查网络连接

### 问题 3：授权后无法返回

**可能原因**：
- 回调 URL 配置错误
- 路由配置问题

**解决方案**：
1. 检查回调 URL 配置
2. 确认路由设置正确
3. 手动访问测试页面

## 配置检查

### 1. 环境变量

确保以下环境变量正确配置：

```bash
VITE_COZE_USE_JWT=true
VITE_COZE_CLIENT_ID=08461612714393126791235695948705.app.coze
VITE_COZE_CLIENT_SECRET=6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA
VITE_COZE_REDIRECT_URI=http://localhost:8082/oauth/callback
```

### 2. 回调 URL 配置

在扣子平台中确保回调 URL 设置为：
```
http://localhost:8082/oauth/callback
```

### 3. 权限设置

确保 OAuth 应用有以下权限：
- chat:read
- chat:write
- bot:read

## 联系支持

如果问题仍然存在，请提供：

1. 浏览器控制台完整错误信息
2. 令牌状态信息
3. 网络请求日志
4. 复现步骤

---

**注意**：本指南基于 OAuth JWT 认证方式。如果使用传统个人访问令牌，请参考相应的配置文档。
