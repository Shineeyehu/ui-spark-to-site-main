# GitHub Pages 部署指南

本指南将帮助您将项目部署到 GitHub Pages。

## 🚀 自动部署配置

项目已配置了 GitHub Actions 自动部署工作流，当代码推送到 `main` 分支时会自动构建和部署。

### 部署文件说明

1. **GitHub Actions 工作流**: `.github/workflows/deploy.yml`
2. **Vite 配置**: `vite.config.ts` (已配置 GitHub Pages 路径)

## 📋 部署步骤

### 1. 启用 GitHub Pages

1. 进入 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**

### 2. 配置环境变量 (Secrets)

在 GitHub 仓库设置中添加以下 Secrets：

1. 进入 **Settings** > **Secrets and variables** > **Actions**
2. 点击 **New repository secret** 添加以下变量：

```
VITE_COZE_API_BASE_URL=https://api.coze.cn
VITE_COZE_BOT_ID=你的机器人ID
VITE_COZE_USER_ID=你的用户ID
VITE_COZE_PERSONAL_ACCESS_TOKEN=你的访问令牌
VITE_MOONSHOT_API_KEY=你的月之暗面API密钥
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 3. 触发部署

推送代码到 `main` 分支即可触发自动部署：

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 4. 查看部署状态

1. 在 GitHub 仓库页面点击 **Actions** 标签
2. 查看最新的工作流运行状态
3. 部署成功后，网站将在以下地址可用：
   ```
   https://shineeyehu.github.io/ui-spark-to-site-main/
   ```

## 🔧 本地测试生产构建

在部署前，建议本地测试生产构建：

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📝 注意事项

1. **路径配置**: 项目已配置正确的 base 路径 `/ui-spark-to-site-main/`
2. **环境变量**: 确保所有必要的环境变量都已在 GitHub Secrets 中配置
3. **构建时间**: 首次部署可能需要几分钟时间
4. **缓存**: GitHub Pages 可能有缓存，更新后需要等待几分钟才能看到变化

## 🐛 故障排除

### 部署失败
1. 检查 Actions 页面的错误日志
2. 确认所有环境变量已正确配置
3. 检查代码是否有构建错误

### 页面无法访问
1. 确认 GitHub Pages 已启用
2. 检查仓库是否为公开仓库
3. 等待 DNS 传播（可能需要几分钟）

### 功能异常
1. 检查浏览器控制台错误
2. 确认 API 密钥在生产环境中有效
3. 检查 CORS 设置

## 🔄 手动重新部署

如需手动触发重新部署：

1. 进入 GitHub 仓库的 **Actions** 页面
2. 选择最新的工作流
3. 点击 **Re-run jobs**

## 📊 部署监控

- **构建状态**: 在 Actions 页面查看
- **部署日志**: 点击具体的工作流查看详细日志
- **网站状态**: 访问部署的 URL 确认功能正常

---

部署完成后，您的应用将在 GitHub Pages 上运行，支持所有核心功能包括 AI 对话、报告生成等。