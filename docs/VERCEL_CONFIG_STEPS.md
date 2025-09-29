# Vercel 配置步骤详解

## 🚨 当前问题
页面报错：`Moonshot API Key 未配置或为空`

## 📋 详细配置步骤

### 第一步：登录Vercel控制台
1. 访问 [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. 使用您的GitHub账户登录

### 第二步：找到您的项目
1. 在项目列表中找到 `ui-spark-to-site-main`
2. 点击项目名称进入项目详情页

### 第三步：进入环境变量设置
1. 点击顶部的 **"Settings"** 标签
2. 在左侧导航栏中点击 **"Environment Variables"**

### 第四步：添加必需的环境变量

#### 🔑 必需变量1：Moonshot API Key
- **Name**: `VITE_MOONSHOT_API_KEY`
- **Value**: `sk-your-moonshot-api-key-here` (替换为真实密钥)
- **Environment**: 勾选所有环境 (Production, Preview, Development)
- 点击 **"Add"**

#### 🔑 必需变量2：Coze API Token
- **Name**: `VITE_COZE_API_TOKEN`
- **Value**: `your-coze-access-token-here` (替换为真实令牌)
- **Environment**: 勾选所有环境 (Production, Preview, Development)
- 点击 **"Add"**

### 第五步：添加可选变量（推荐）

#### 🔧 Moonshot配置
- **Name**: `VITE_MOONSHOT_MODEL`
- **Value**: `kimi-k2-0905-preview`
- **Environment**: 勾选所有环境
- 点击 **"Add"**

- **Name**: `VITE_MOONSHOT_BASE_URL`
- **Value**: `https://api.moonshot.cn/v1`
- **Environment**: 勾选所有环境
- 点击 **"Add"**

#### 🔧 Coze配置
- **Name**: `VITE_COZE_BOT_ID`
- **Value**: `7546564367413379135`
- **Environment**: 勾选所有环境
- 点击 **"Add"`

- **Name**: `VITE_COZE_USE_JWT`
- **Value**: `false`
- **Environment**: 勾选所有环境
- 点击 **"Add"`

- **Name**: `VITE_COZE_USER_ID`
- **Value**: `user_123`
- **Environment**: 勾选所有环境
- 点击 **"Add"`

### 第六步：重新部署
1. 点击顶部的 **"Deployments"** 标签
2. 找到最新的部署记录
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 等待部署完成

## 🔑 如何获取API密钥

### Moonshot API密钥
1. 访问 [https://platform.moonshot.cn/](https://platform.moonshot.cn/)
2. 注册/登录账户
3. 进入 **API管理** 页面
4. 点击 **"创建API密钥"**
5. 复制生成的密钥（格式：`sk-xxxxxxxxxx`）

### 扣子API令牌
1. 访问 [https://www.coze.cn/](https://www.coze.cn/)
2. 登录您的账户
3. 进入 **API管理** 页面
4. 创建访问令牌
5. 复制令牌

## ⚠️ 重要提醒

1. **API密钥格式**：
   - Moonshot: `sk-` 开头
   - 扣子: 通常是长字符串

2. **环境选择**：
   - 必须勾选所有环境（Production, Preview, Development）
   - 这样确保在所有部署环境中都能正常工作

3. **重新部署**：
   - 环境变量修改后必须重新部署
   - 否则更改不会生效

4. **安全性**：
   - 不要在代码中硬编码API密钥
   - 使用环境变量是安全的做法

## 🧪 验证配置

部署完成后：
1. 访问您的Vercel应用URL
2. 检查浏览器控制台是否还有API密钥错误
3. 尝试使用应用功能
4. 如果仍有问题，检查环境变量是否正确设置

## 📞 故障排除

如果遇到问题：
1. **检查变量名**：确保名称完全正确（区分大小写）
2. **检查变量值**：确保没有多余的空格或字符
3. **检查环境**：确保勾选了所有环境
4. **重新部署**：确保已经重新部署
5. **查看日志**：在Vercel的Deployments页面查看部署日志
