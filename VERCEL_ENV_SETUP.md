# Vercel 环境变量配置指南

## HTML渲染问题分析

### 问题现象
- **本地环境**：生成的解读报告卡能够正确渲染HTML格式，显示完整的样式和布局
- **Vercel部署版本**：只显示纯文本内容，没有HTML渲染效果

### 根本原因
缺少 **Moonshot API** 环境变量配置，导致：
1. API调用失败（没有有效的API Key）
2. 系统回退到显示纯文本内容
3. `smartContentProcess` 和 `addMarkdownStyles` 函数无法正常工作

### 技术原理
```
用户生成报告卡 → 调用Moonshot API → 返回HTML格式内容 → smartContentProcess处理 → addMarkdownStyles美化 → 最终渲染
```

如果Moonshot API调用失败，系统会跳过HTML处理步骤，直接显示原始文本。

## 解决步骤

### 1. 登录 Vercel Dashboard
访问 [vercel.com](https://vercel.com) 并登录您的账户

### 2. 进入项目设置
1. 选择您的项目 `ui-spark-to-site-main`
2. 点击 **Settings** 标签
3. 在左侧菜单中选择 **Environment Variables**

### 3. 添加以下环境变量

请逐一添加以下环境变量，**Environment** 选择 `Production`、`Preview` 和 `Development`：

#### Supabase 配置
```
VITE_SUPABASE_PROJECT_ID = oulkicwnajomkgmffsmc
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bGtpY3duYWpvbWtnbWZmc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTAxMzksImV4cCI6MjA3Mjg4NjEzOX0.P-yA2o7a3rYOlo0Gyndzm1F1_710770XJ2dxq5BPoSY
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

#### 🔥 关键：Moonshot API 配置（解决HTML渲染问题）
```
VITE_MOONSHOT_API_KEY = sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e
VITE_MOONSHOT_MODEL = kimi-k2-0905-preview
VITE_MOONSHOT_BASE_URL = https://api.moonshot.cn/v1
```

#### 环境标识
```
VITE_NODE_ENV = production
```

### 4. 重新部署

配置完环境变量后，需要触发重新部署：
1. 推送任意代码更改到 `main` 分支，或
2. 在 Vercel Dashboard 中点击 **Redeploy** 按钮

### 5. 验证修复

部署完成后，访问您的网站并测试：
- 进入生日分析页面
- 生成解读报告卡
- 确认HTML格式正确渲染（而不是纯文本）

## 重要提醒

⚠️ **环境变量配置注意事项：**

1. **Environment 选择**：确保为 `Production`、`Preview` 和 `Development` 都添加变量
2. **变量名称**：必须完全匹配，区分大小写
3. **VITE_ 前缀**：前端环境变量必须以 `VITE_` 开头
4. **重新部署**：添加环境变量后必须重新部署才能生效
5. **Token 有效性**：如果仍有问题，请检查API Token是否有效

## 常见问题

### Q: 添加环境变量后还是不工作？
A: 确保重新部署了项目，环境变量只有在重新部署后才会生效。

### Q: 如何确认环境变量是否正确配置？
A: 可以在Vercel的Function Logs中查看是否有API调用相关的错误信息。

### Q: 还有其他可能的原因吗？
A: 检查Moonshot API Key是否有效，以及API调用是否有配额限制。

---

**完成以上步骤后，您的Vercel部署版本应该能够正确渲染HTML格式的解读报告卡了。**