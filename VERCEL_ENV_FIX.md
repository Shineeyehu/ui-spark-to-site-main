# Vercel 环境变量配置修复指南

## 问题描述
Vercel部署版本出现以下问题：
- 网络请求超时 (net::ERR_TIMED_OUT)
- API调用失败，显示 "Failed to fetch"
- HTML渲染直接显示文字，没有渲染过程

## 根本原因
1. **API密钥未正确配置**：Vercel环境中缺少必要的环境变量
2. **硬编码API密钥已移除**：为了安全性，移除了代码中的硬编码密钥

## 解决方案

### 1. 在Vercel中配置环境变量

登录 [Vercel Dashboard](https://vercel.com/dashboard)，进入项目设置：

1. 选择你的项目
2. 点击 "Settings" 标签
3. 点击左侧菜单的 "Environment Variables"
4. 添加以下环境变量：

```bash
# Moonshot API 配置（必需）
VITE_MOONSHOT_API_KEY=your_moonshot_api_key_here
VITE_MOONSHOT_MODEL=kimi-k2-0905-preview
VITE_MOONSHOT_BASE_URL=https://api.moonshot.cn/v1

# 扣子 API 配置（如果使用）
VITE_COZE_API_KEY=your_coze_api_key_here
VITE_COZE_CLIENT_ID=your_coze_client_id
VITE_COZE_CLIENT_SECRET=your_coze_client_secret
VITE_COZE_BOT_ID=your_bot_id
VITE_COZE_USER_ID=user_123
VITE_COZE_NICKNAME=用户

# 生产环境标识
VITE_NODE_ENV=production
```

### 2. 获取API密钥

#### Moonshot API密钥
1. 访问 [Moonshot AI 官网](https://platform.moonshot.cn/)
2. 注册/登录账户
3. 进入控制台，创建API密钥
4. 复制密钥并添加到Vercel环境变量中

#### 扣子API密钥（可选）
1. 访问 [扣子开放平台](https://www.coze.cn/)
2. 创建应用并获取相关配置

### 3. 重新部署

配置完环境变量后：
1. 在Vercel Dashboard中点击 "Redeploy"
2. 或者推送新的代码到GitHub触发自动部署

### 4. 验证修复

部署完成后，访问你的Vercel域名：
- 测试生成解读报告功能
- 确认HTML渲染正常工作
- 检查网络请求不再超时

## 安全注意事项

1. **不要在代码中硬编码API密钥**
2. **使用环境变量管理敏感信息**
3. **定期轮换API密钥**
4. **限制API密钥的使用权限**

## 故障排除

### 如果仍然出现问题：

1. **检查环境变量名称**：确保变量名完全匹配（区分大小写）
2. **检查API密钥有效性**：在API提供商控制台验证密钥状态
3. **查看Vercel部署日志**：检查是否有其他错误信息
4. **清除浏览器缓存**：强制刷新页面

### 调试步骤：

1. 在浏览器开发者工具中检查网络请求
2. 查看控制台错误信息
3. 验证环境变量是否正确加载

## 联系支持

如果问题仍然存在，请提供：
- Vercel部署日志
- 浏览器控制台错误信息
- 环境变量配置截图（隐藏敏感信息）