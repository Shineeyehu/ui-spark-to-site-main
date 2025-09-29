# 🔑 找到的API密钥配置清单

## 必需的环境变量

### 1. Moonshot API配置
```
VITE_MOONSHOT_API_KEY=sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e
VITE_MOONSHOT_MODEL=kimi-k2-0905-preview
VITE_MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
```

### 2. 扣子API配置
```
VITE_COZE_API_TOKEN=pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS
VITE_COZE_BOT_ID=7546564367413379135
VITE_COZE_USE_JWT=false
VITE_COZE_USER_ID=user_123
```

### 3. OAuth配置（深度咨询功能）
```
VITE_COZE_CLIENT_ID=08461612714393126791235695948705.app.coze
VITE_COZE_CLIENT_SECRET=6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA
VITE_COZE_REDIRECT_URI=https://your-vercel-domain.vercel.app/oauth/callback
```

## 🎯 Vercel配置步骤

### 第一步：登录Vercel
1. 访问：https://vercel.com/dashboard
2. 使用GitHub账户登录

### 第二步：找到项目
1. 找到项目：`ui-spark-to-site-main`
2. 点击项目名称

### 第三步：进入环境变量设置
1. 点击 **Settings** 标签
2. 点击 **Environment Variables**

### 第四步：添加所有环境变量
逐个添加上述所有环境变量，确保：
- ✅ 勾选所有环境（Production, Preview, Development）
- ✅ 变量名完全正确（区分大小写）
- ✅ 变量值完全正确（无多余空格）

### 第五步：重新部署
1. 点击 **Deployments** 标签
2. 点击最新部署的 **"..."** 菜单
3. 选择 **Redeploy**

## ⚠️ 重要提醒

1. **VITE_COZE_REDIRECT_URI** 需要替换为您的实际Vercel域名
2. 所有变量都必须勾选所有环境
3. 添加完所有变量后必须重新部署
4. 这些是从您的代码中找到的真实API密钥

## 🔒 安全建议

1. 定期轮换API密钥
2. 监控API使用情况
3. 不要在代码中硬编码密钥
4. 使用环境变量是正确的做法

## ✅ 验证成功

配置完成后，您的应用将不再显示API密钥错误！
