# Vercel 部署指南

## 部署准备清单

### ✅ 已完成项目

- [x] **代码优化** - 已移除Supabase依赖，使用直接API调用
- [x] **构建配置** - package.json包含正确的构建脚本
- [x] **Vercel配置** - vercel.json配置文件已就绪
- [x] **生产构建测试** - 本地构建成功，无错误
- [x] **静态资源** - public目录包含所需资源

## 部署步骤

### 1. 环境变量配置

在Vercel项目设置中添加以下环境变量：

```bash
# 扣子 OAuth 配置
VITE_COZE_USE_JWT=true
VITE_COZE_CLIENT_ID=your_coze_client_id
VITE_COZE_CLIENT_SECRET=your_coze_client_secret
VITE_COZE_REDIRECT_URI=https://your-vercel-domain.vercel.app/oauth/callback
VITE_COZE_BOT_ID=your_bot_id
VITE_COZE_USER_ID=user_123
VITE_COZE_NICKNAME=用户

# 扣子 API Key 配置（备用方案）
VITE_COZE_API_KEY=your_coze_api_key

# 生产环境标识
VITE_NODE_ENV=production
```

### 2. 部署配置

#### vercel.json 配置说明
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### package.json 构建脚本
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "npm run build"
  }
}
```

### 3. 部署流程

1. **连接GitHub仓库**
   - 登录Vercel控制台
   - 选择"Import Git Repository"
   - 连接GitHub账户并选择项目仓库

2. **配置项目设置**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **设置环境变量**
   - 在项目设置中添加上述环境变量
   - 确保VITE_COZE_REDIRECT_URI使用正确的域名

4. **部署**
   - 点击"Deploy"开始部署
   - 等待构建完成

### 4. 部署后配置

#### 更新扣子OAuth回调地址
1. 登录扣子开发者平台
2. 找到你的应用配置
3. 更新OAuth回调地址为：`https://your-vercel-domain.vercel.app/oauth/callback`

#### 自定义域名（可选）
1. 在Vercel项目设置中添加自定义域名
2. 配置DNS记录
3. 更新环境变量中的VITE_COZE_REDIRECT_URI

## 注意事项

### 🚨 重要提醒

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 使用Vercel环境变量管理
   - 客户端密钥应谨慎处理

2. **OAuth配置**
   - 确保回调地址与部署域名一致
   - 测试OAuth流程是否正常工作

3. **构建优化**
   - 当前bundle大小较大(722KB)，建议考虑代码分割
   - 可以使用动态导入优化加载性能

### 🔧 故障排除

#### 构建失败
- 检查依赖是否正确安装
- 确认Node.js版本兼容性
- 查看构建日志中的错误信息

#### OAuth认证失败
- 验证回调地址配置
- 检查客户端ID和密钥
- 确认扣子应用权限设置

#### 页面路由问题
- 确认vercel.json中的路由配置
- 检查React Router配置

## 性能优化建议

1. **代码分割**
   ```javascript
   // 使用动态导入
   const LazyComponent = lazy(() => import('./Component'));
   ```

2. **资源优化**
   - 压缩图片资源
   - 使用WebP格式
   - 启用Vercel的自动优化

3. **缓存策略**
   - 配置适当的缓存头
   - 使用Vercel Edge Network

## 监控和维护

1. **部署监控**
   - 使用Vercel Analytics
   - 设置部署通知

2. **错误追踪**
   - 集成错误监控服务
   - 监控API调用状态

3. **性能监控**
   - 使用Vercel Speed Insights
   - 定期检查Core Web Vitals

---

## 快速部署命令

```bash
# 1. 确保代码已推送到GitHub
git push origin main

# 2. 本地测试构建
npm run build
npm run preview

# 3. 在Vercel控制台导入项目并配置环境变量
# 4. 部署完成后更新扣子OAuth回调地址
```

部署完成后，你的应用将在 `https://your-project-name.vercel.app` 上线！