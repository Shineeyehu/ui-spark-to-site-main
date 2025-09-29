# 🚨 Vercel 配置指南 - Windows版本

## 当前错误
```
Moonshot API Key 未配置或为空
```

## ⚡ 立即解决步骤

### 1. 打开Vercel控制台
- 访问：https://vercel.com/dashboard
- 使用GitHub账户登录

### 2. 找到您的项目
- 在项目列表中找到：`ui-spark-to-site-main`
- 点击项目名称

### 3. 进入环境变量设置
- 点击顶部的 **"Settings"** 标签
- 在左侧菜单中点击 **"Environment Variables"**

### 4. 添加必需的环境变量

#### 🔑 第一个变量（最重要）
- **Name**: `VITE_MOONSHOT_API_KEY`
- **Value**: `sk-your-moonshot-api-key-here`
- **Environment**: 勾选所有选项
  - ✅ Production
  - ✅ Preview  
  - ✅ Development
- 点击 **"Add"**

#### 🔑 第二个变量（必需）
- **Name**: `VITE_COZE_API_TOKEN`
- **Value**: `your-coze-access-token-here`
- **Environment**: 勾选所有选项
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- 点击 **"Add"**

### 5. 添加可选变量（推荐）

#### Moonshot配置
- **Name**: `VITE_MOONSHOT_MODEL`
- **Value**: `kimi-k2-0905-preview`
- **Environment**: 全部勾选
- 点击 **"Add"**

- **Name**: `VITE_MOONSHOT_BASE_URL`
- **Value**: `https://api.moonshot.cn/v1`
- **Environment**: 全部勾选
- 点击 **"Add"**

#### Coze配置
- **Name**: `VITE_COZE_BOT_ID`
- **Value**: `7546564367413379135`
- **Environment**: 全部勾选
- 点击 **"Add"**

- **Name**: `VITE_COZE_USE_JWT`
- **Value**: `false`
- **Environment**: 全部勾选
- 点击 **"Add"**

- **Name**: `VITE_COZE_USER_ID`
- **Value**: `user_123`
- **Environment**: 全部勾选
- 点击 **"Add"**

### 6. 重新部署项目
- 点击顶部的 **"Deployments"** 标签
- 找到最新的部署记录
- 点击右侧的 **"..."** 菜单
- 选择 **"Redeploy"**
- 等待部署完成

## 🔑 如何获取API密钥

### Moonshot API密钥
1. 访问：https://platform.moonshot.cn/
2. 注册/登录账户
3. 进入API管理页面
4. 创建新的API密钥
5. 复制密钥（格式：`sk-xxxxxxxxxx`）

### 扣子API令牌
1. 访问：https://www.coze.cn/
2. 登录您的账户
3. 进入API管理页面
4. 创建访问令牌
5. 复制令牌

## ⚠️ 重要提醒

1. **变量名必须完全正确**（区分大小写）
2. **必须勾选所有环境**（Production, Preview, Development）
3. **添加变量后必须重新部署**
4. **API密钥格式要正确**

## ✅ 验证成功

配置完成后：
1. 访问您的Vercel应用URL
2. 检查是否还有API密钥错误
3. 尝试使用应用功能

## 📞 如果还有问题

1. 检查变量名是否正确
2. 检查是否勾选了所有环境
3. 确认已经重新部署
4. 查看Vercel部署日志
5. 确认API密钥有效

## 🎯 快速检查清单

- [ ] 登录Vercel控制台
- [ ] 找到项目 `ui-spark-to-site-main`
- [ ] 进入 Settings → Environment Variables
- [ ] 添加 `VITE_MOONSHOT_API_KEY`
- [ ] 添加 `VITE_COZE_API_TOKEN`
- [ ] 勾选所有环境
- [ ] 重新部署项目
- [ ] 验证页面不再报错
