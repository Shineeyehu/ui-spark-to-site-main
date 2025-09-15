# Vercel 环境变量配置指南

## 问题说明

部署后出现扣子API token错误（code: 4101）的原因是：
- `vercel.json` 文件中的 `env` 字段**不是**正确的环境变量配置方式
- Vercel 环境变量需要在 **Vercel Dashboard** 中手动配置
- 已修复：移除了 `vercel.json` 中无效的 `env` 配置

## 正确的配置步骤

### 1. 登录 Vercel Dashboard
访问 [vercel.com](https://vercel.com) 并登录您的账户

### 2. 进入项目设置
1. 选择您的项目 `ui-spark-to-site-main`
2. 点击 **Settings** 标签
3. 在左侧菜单中选择 **Environment Variables**

### 3. 添加以下环境变量

请逐一添加以下环境变量，**Environment** 选择 `Production` 和 `Preview`：

#### Supabase 配置
```
VITE_SUPABASE_PROJECT_ID = oulkicwnajomkgmffsmc
VITE_SUPABASE_PUBLISHABLE_KEY = yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bGtpY3duYWpvbWtnbWZmc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTAxMzksImV4cCI6MjA3Mjg4NjEzOX0.P-yA2o7a3rYOlo0Gyndzm1F1_710770XJ2dxq5BPoSYe
VITE_SUPABASE_URL = https://oulkicwnajomkgmffsmc.supabase.co
```

#### 扣子 OAuth 配置
```
VITE_COZE_USE_JWT = false
VITE_COZE_CLIENT_ID = 08461612714393126791235695948705.app.coze
VITE_COZE_CLIENT_SECRET = 6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA
VITE_COZE_REDIRECT_URI = https://ui-spark-to-site-main.vercel.app/oauth/callback
VITE_COZE_BOT_ID = 7546564367413379135
VITE_COZE_USER_ID = user_123
VITE_COZE_NICKNAME = 用户
```

#### 扣子 API Token 配置
```
VITE_COZE_API_KEY = pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS
VITE_COZE_API_TOKEN = pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS
```

### 4. 重新部署

配置完环境变量后，需要触发重新部署：
1. 推送任意代码更改到 `main` 分支，或
2. 在 Vercel Dashboard 中点击 **Redeploy** 按钮

### 5. 验证配置

部署完成后，访问您的网站并测试：
- 解读报告卡是否能正常显示
- 扣子对话功能是否正常工作

## 重要提醒

⚠️ **环境变量配置注意事项：**

1. **Environment 选择**：确保为 `Production` 和 `Preview` 都添加变量
2. **变量名称**：必须完全匹配，区分大小写
3. **VITE_ 前缀**：前端环境变量必须以 `VITE_` 开头
4. **重新部署**：添加环境变量后必须重新部署才能生效
5. **Token 有效性**：如果仍有问题，请检查扣子 API Token 是否有效

## 故障排除

如果配置后仍有问题：

1. **检查 Token**：登录扣子平台验证 API Token 是否有效
2. **检查环境**：确认变量已添加到正确的环境（Production/Preview）
3. **检查部署**：确认最新部署已包含环境变量
4. **查看日志**：在 Vercel Dashboard 的 Functions 标签中查看部署日志

---

配置完成后，您的应用应该能够正常使用扣子API功能。如有问题，请检查以上步骤是否正确执行。