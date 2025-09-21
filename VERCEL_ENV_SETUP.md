# Vercel 环境变量配置指南

## 🚨 必需的环境变量

### 1. Moonshot API 配置
```
VITE_MOONSHOT_API_KEY=sk-your-moonshot-api-key-here
VITE_MOONSHOT_MODEL=kimi-k2-0905-preview
VITE_MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
```

### 2. Coze API 配置
```
VITE_COZE_BOT_ID=7546564367413379135
VITE_COZE_API_TOKEN=your-coze-access-token-here
VITE_COZE_USE_JWT=false
VITE_COZE_USER_ID=user_123
```

### 3. OAuth 配置（可选，如果需要深度咨询功能）
```
VITE_COZE_CLIENT_ID=08461612714393126791235695948705.app.coze
VITE_COZE_CLIENT_SECRET=6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA
VITE_COZE_REDIRECT_URI=https://your-domain.vercel.app/oauth/callback
```

## 📋 配置步骤

### 1. 登录 Vercel 控制台
访问 [vercel.com](https://vercel.com) 并登录

### 2. 进入项目设置
1. 找到项目 `ui-spark-to-site-main`
2. 点击项目进入详情页
3. 点击 **Settings** 标签
4. 点击 **Environment Variables** 选项

### 3. 添加环境变量
点击 **Add New** 按钮，逐个添加上述环境变量：

#### 必需变量（必须配置）：
- **Name**: `VITE_MOONSHOT_API_KEY`
  - **Value**: 您的 Moonshot API 密钥
  - **Environment**: Production, Preview, Development

- **Name**: `VITE_COZE_API_TOKEN`
  - **Value**: 您的扣子 API 访问令牌
  - **Environment**: Production, Preview, Development

#### 可选变量（有默认值）：
- **Name**: `VITE_MOONSHOT_MODEL`
  - **Value**: `kimi-k2-0905-preview`
  - **Environment**: Production, Preview, Development

- **Name**: `VITE_MOONSHOT_BASE_URL`
  - **Value**: `https://api.moonshot.cn/v1`
  - **Environment**: Production, Preview, Development

- **Name**: `VITE_COZE_BOT_ID`
  - **Value**: `7546564367413379135`
  - **Environment**: Production, Preview, Development

- **Name**: `VITE_COZE_USE_JWT`
  - **Value**: `false`
  - **Environment**: Production, Preview, Development

- **Name**: `VITE_COZE_USER_ID`
  - **Value**: `user_123`
  - **Environment**: Production, Preview, Development

### 4. 重新部署
1. 环境变量设置完成后，点击 **Deployments** 标签
2. 点击最新部署右侧的 **...** 菜单
3. 选择 **Redeploy** 重新部署

## 🔑 如何获取 API 密钥

### Moonshot API 密钥
1. 访问 [Moonshot AI 官网](https://platform.moonshot.cn/)
2. 注册/登录账户
3. 进入 API 管理页面
4. 创建新的 API 密钥
5. 复制密钥（格式：`sk-xxxxxxxxxx`）

### 扣子 API 访问令牌
1. 访问 [扣子平台](https://www.coze.cn/)
2. 登录您的账户
3. 进入 API 管理页面
4. 创建访问令牌
5. 复制令牌

## ⚠️ 重要提醒

1. **安全性**：请勿在代码中硬编码 API 密钥
2. **权限**：确保 API 密钥有足够的权限和配额
3. **域名**：OAuth 重定向 URI 需要使用正确的 Vercel 域名
4. **重新部署**：环境变量修改后必须重新部署才能生效

## 🧪 测试配置

部署完成后，访问您的 Vercel 应用：
1. 检查控制台是否还有 API 密钥错误
2. 尝试使用应用功能
3. 如果仍有问题，检查环境变量是否正确设置

## 📞 故障排除

如果遇到问题：
1. 检查环境变量名称是否正确（区分大小写）
2. 检查环境变量值是否包含多余的空格
3. 确认 API 密钥是否有效
4. 检查 Vercel 部署日志中的错误信息