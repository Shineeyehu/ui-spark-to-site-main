# 🚨 Vercel 快速修复指南

## 当前错误
```
Moonshot API Key 未配置或为空
```

## ⚡ 立即解决步骤

### 1. 登录Vercel
访问：https://vercel.com/dashboard

### 2. 找到项目
点击：`ui-spark-to-site-main`

### 3. 进入设置
点击：**Settings** → **Environment Variables**

### 4. 添加必需变量

#### 🔑 第一个（最重要）
- **Name**: `VITE_MOONSHOT_API_KEY`
- **Value**: `sk-your-moonshot-api-key-here`
- **Environment**: ✅ Production ✅ Preview ✅ Development

#### 🔑 第二个（必需）
- **Name**: `VITE_COZE_API_TOKEN`  
- **Value**: `your-coze-access-token-here`
- **Environment**: ✅ Production ✅ Preview ✅ Development

### 5. 重新部署
- 点击：**Deployments**
- 点击最新部署的 **"..."** 菜单
- 选择：**Redeploy**

## 🔑 获取API密钥

### Moonshot API
1. 访问：https://platform.moonshot.cn/
2. 注册/登录
3. 创建API密钥
4. 复制密钥（格式：`sk-xxxxxxxxxx`）

### 扣子API
1. 访问：https://www.coze.cn/
2. 登录账户
3. 创建访问令牌
4. 复制令牌

## ✅ 验证成功
部署完成后，页面应该不再显示API密钥错误。

## 📞 如果还有问题
1. 检查变量名是否正确
2. 检查是否勾选了所有环境
3. 确认已经重新部署
4. 查看Vercel部署日志
