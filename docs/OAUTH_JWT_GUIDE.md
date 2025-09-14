# OAuth JWT 授权配置指南

## 概述

本指南介绍如何配置 OAuth JWT 授权方式来解决扣子 API 鉴权过期问题。OAuth JWT 授权比个人访问令牌更安全，适合生产环境使用。

## 配置方式

### 方式一：OAuth JWT 授权（推荐）

#### 1. 环境变量配置

在项目根目录创建 `.env.local` 文件：

```bash
# 扣子智能体配置
VITE_COZE_BOT_ID=7546564367413379135

# OAuth JWT 配置
VITE_COZE_USE_JWT=true
VITE_COZE_CLIENT_ID=08461612714393126791235695948705.app.coze
VITE_COZE_CLIENT_SECRET=6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA
VITE_COZE_REDIRECT_URI=http://localhost:5173/oauth/callback

# 用户配置
VITE_COZE_USER_ID=user_123
VITE_COZE_NICKNAME=用户
```

#### 2. OAuth 客户端信息

已为您配置好 OAuth 客户端信息：

- **Client ID**: `08461612714393126791235695948705.app.coze`
- **Client Secret**: `6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA`
- **Bot ID**: `7546564367413379135`
- **应用地址**: [https://www.coze.cn/space/7546567644070428710/bot/7546564367413379135](https://www.coze.cn/space/7546567644070428710/bot/7546564367413379135)

回调 URL 已设置为：`http://localhost:5173/oauth/callback`

#### 3. 使用流程

1. 访问 `/coze-test` 页面
2. 点击"开始 OAuth 授权"按钮
3. 在扣子平台完成授权
4. 系统自动获取并管理 JWT 令牌
5. 令牌会自动刷新，无需手动管理

### 方式二：传统个人访问令牌（备选）

#### 1. 环境变量配置

```bash
# 扣子智能体配置
VITE_COZE_BOT_ID=your_bot_id_here
VITE_COZE_API_TOKEN=your_access_token_here
VITE_COZE_USE_JWT=false

# 用户配置
VITE_COZE_USER_ID=user_123
VITE_COZE_NICKNAME=用户
```

#### 2. 获取个人访问令牌

1. 登录 [扣子平台](https://www.coze.cn)
2. 进入开发者设置
3. 创建个人访问令牌
4. 复制令牌并配置到环境变量

## 功能特性

### OAuth JWT 授权优势

- ✅ **安全性高**：使用 OAuth 标准流程，避免令牌泄露
- ✅ **自动刷新**：令牌过期前自动刷新，无需手动管理
- ✅ **生产就绪**：适合生产环境使用
- ✅ **用户友好**：一次授权，长期有效

### 个人访问令牌限制

- ❌ **安全风险**：令牌可能泄露，存在安全风险
- ❌ **手动管理**：需要手动更新过期令牌
- ❌ **不适合生产**：仅适合测试环境使用

## 技术实现

### JWT 令牌管理

系统使用 `JWTAuthService` 类管理 JWT 令牌：

```typescript
// 获取有效令牌
const token = await jwtAuthService.getValidToken();

// 检查令牌状态
const info = jwtAuthService.getTokenInfo();

// 清除令牌
jwtAuthService.clearTokens();
```

### 自动刷新机制

- 令牌过期前 1 分钟自动刷新
- 刷新失败时提示重新授权
- 本地存储令牌信息

### 错误处理

- 令牌过期自动刷新
- 刷新失败提示重新授权
- 网络错误重试机制

## 部署配置

### 开发环境

```bash
VITE_COZE_REDIRECT_URI=http://localhost:5173/oauth/callback
```

### 生产环境

```bash
VITE_COZE_REDIRECT_URI=https://yourdomain.com/oauth/callback
```

## 故障排除

### 常见问题

1. **授权失败**
   - 检查 OAuth 客户端配置
   - 确认回调 URL 正确
   - 检查网络连接

2. **令牌刷新失败**
   - 检查客户端密钥
   - 确认权限范围正确
   - 重新进行授权

3. **API 调用失败**
   - 检查 Bot ID 配置
   - 确认令牌有效
   - 查看控制台错误信息

### 调试方法

1. 打开浏览器开发者工具
2. 查看控制台错误信息
3. 检查网络请求状态
4. 查看本地存储的令牌信息

## 安全建议

1. **环境变量保护**：不要将敏感信息提交到代码仓库
2. **HTTPS 部署**：生产环境必须使用 HTTPS
3. **定期轮换**：定期更新 OAuth 客户端密钥
4. **权限最小化**：只申请必要的 API 权限

## 更新日志

- **v1.0.0**：初始版本，支持 OAuth JWT 授权
- **v1.1.0**：添加自动刷新机制
- **v1.2.0**：优化错误处理和用户体验
