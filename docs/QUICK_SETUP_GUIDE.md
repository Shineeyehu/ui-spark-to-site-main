# 快速配置指南

## 已配置信息

✅ **OAuth 客户端信息已配置完成**

- **Client ID**: `08461612714393126791235695948705.app.coze`
- **Client Secret**: `6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA`
- **Bot ID**: `7546564367413379135`
- **应用地址**: [https://www.coze.cn/space/7546567644070428710/bot/7546564367413379135](https://www.coze.cn/space/7546567644070428710/bot/7546564367413379135)

## 快速开始

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# 扣子智能体配置
VITE_COZE_BOT_ID=7546564367413379135

# OAuth JWT 配置（推荐）
VITE_COZE_USE_JWT=true
VITE_COZE_CLIENT_ID=08461612714393126791235695948705.app.coze
VITE_COZE_CLIENT_SECRET=6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA
VITE_COZE_REDIRECT_URI=http://localhost:5173/oauth/callback

# 用户配置
VITE_COZE_USER_ID=user_123
VITE_COZE_NICKNAME=用户
```

### 2. 启动项目

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 3. 访问测试页面

打开浏览器访问：`http://localhost:5173/coze-test`

### 4. 开始 OAuth 授权

1. 在测试页面找到 "OAuth JWT 授权" 部分
2. 点击 "开始 OAuth 授权" 按钮
3. 在扣子平台完成授权
4. 系统会自动获取并管理 JWT 令牌

## 功能测试

### 测试步骤

1. **配置检查**：验证 Bot ID 和认证配置
2. **OAuth 服务**：检查 JWT 认证服务状态
3. **令牌状态**：验证访问令牌有效性
4. **API 连接**：测试与扣子 API 的连接

### 预期结果

- ✅ 配置检查：通过
- ✅ OAuth 服务：通过
- ✅ 令牌状态：通过
- ✅ API 连接：通过

## 故障排除

### 常见问题

1. **授权失败**
   - 检查网络连接
   - 确认回调 URL 正确
   - 检查 OAuth 客户端配置

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

## 生产环境部署

### 环境变量配置

```bash
# 生产环境配置
VITE_COZE_BOT_ID=7546564367413379135
VITE_COZE_USE_JWT=true
VITE_COZE_CLIENT_ID=08461612714393126791235695948705.app.coze
VITE_COZE_CLIENT_SECRET=6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA
VITE_COZE_REDIRECT_URI=https://yourdomain.com/oauth/callback
```

### 注意事项

1. **HTTPS 要求**：生产环境必须使用 HTTPS
2. **回调 URL**：更新为生产域名
3. **环境变量**：不要在代码中硬编码敏感信息
4. **权限管理**：定期检查 OAuth 应用权限

## 支持

如果遇到问题，请：

1. 查看控制台错误信息
2. 检查网络连接
3. 确认配置正确
4. 参考详细文档：`OAUTH_JWT_GUIDE.md`

---

**恭喜！** 您已成功配置 OAuth JWT 授权，现在可以享受更安全、更稳定的扣子 API 集成体验！
