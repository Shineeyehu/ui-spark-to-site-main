# 命理分析AI应用

一个基于React + TypeScript的现代化命理分析应用，集成了Coze AI、Moonshot API等先进技术，提供智能命理分析和深度咨询功能。

## 🚀 项目特色

- **智能命理分析**: 基于传统命理学和现代AI技术
- **深度咨询功能**: 与AI进行实时对话交流
- **移动端优化**: 完美适配手机和平板设备
- **现代化UI**: 使用Tailwind CSS和Radix UI构建
- **多平台部署**: 支持Vercel、GitHub Pages等部署方式

## 📋 功能模块

### 🎂 生日信息收集
- 智能表单设计，支持公历/农历选择
- 自动年龄计算功能
- 手相照片上传支持
- 移动端友好的输入体验

### 🤖 AI智能分析
- **Coze AI集成**: 专业的命理分析AI
- **Moonshot API**: 深度文本分析
- **实时对话**: 支持流式响应
- **多模态支持**: 文本+图片分析

### 💬 深度咨询
- 实时AI对话功能
- 上下文感知的智能回复
- 移动端优化的聊天界面
- 思考状态可视化

### 📊 报告生成
- 精美的命理分析报告
- HTML渲染支持
- 移动端适配的报告显示
- 可分享的报告链接

## 🛠️ 技术栈

### 前端框架
- **React 18**: 现代化React框架
- **TypeScript**: 类型安全的JavaScript
- **Vite**: 快速的构建工具

### UI组件
- **Tailwind CSS**: 实用优先的CSS框架
- **Radix UI**: 无障碍的组件库
- **Lucide React**: 精美的图标库

### AI集成
- **Coze API**: 智能对话和分析
- **Moonshot API**: 文本分析服务
- **JWT认证**: 安全的API访问

### 后端服务
- **Supabase**: 数据库和认证服务
- **Edge Functions**: 服务器端逻辑
- **文件上传**: 图片处理服务

## 📱 移动端优化

### 响应式设计
- 完美适配各种屏幕尺寸
- 触摸友好的交互体验
- 移动端特有的UI优化

### 性能优化
- 懒加载和代码分割
- 移动端网络优化
- 缓存策略优化

### 用户体验
- 智能键盘处理
- 滚动优化
- 加载状态可视化

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ui-spark-to-site-main
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
# 配置Coze API、Moonshot API等密钥
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
```
http://localhost:5173
```

## 🔧 环境配置

### 必需的环境变量

```env
# Coze API配置
VITE_COZE_API_TOKEN=your_coze_token
VITE_COZE_BOT_ID=your_bot_id
VITE_COZE_USE_JWT=false

# Moonshot API配置
VITE_MOONSHOT_API_KEY=your_moonshot_key
VITE_MOONSHOT_MODEL=kimi-k2-0905-preview

# OAuth配置（可选）
VITE_COZE_CLIENT_ID=your_client_id
VITE_COZE_CLIENT_SECRET=your_client_secret
```

### 部署配置

#### Vercel部署
1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署

#### GitHub Pages部署
1. 配置GitHub Actions
2. 设置部署密钥
3. 自动构建和部署

## 📚 文档索引

### 🔧 开发文档
- [项目结构梳理总结](./项目结构梳理总结.md)
- [快速设置指南](./docs/QUICK_SETUP_GUIDE.md)
- [项目主要文档](./docs/PROJECT_DOCUMENTATION.md)

### 🤖 AI集成
- [Coze集成文档](./docs/COZE_INTEGRATION.md)
- [完整AI工作流指南](./docs/COMPLETE_AI_WORKFLOW_GUIDE.md)
- [DeepTalk集成指南](./docs/DEEPTALK_INTEGRATION_GUIDE.md)

### 🔐 认证与配置
- [Coze API修复指南](./docs/COZE_API_FIX_GUIDE.md)
- [JWT令牌修复指南](./docs/JWT_TOKEN_FIX_GUIDE.md)
- [OAuth实现总结](./docs/OAUTH_IMPLEMENTATION_SUMMARY.md)

### 📱 移动端优化
- [移动端兼容性修复总结](./移动端兼容性修复总结.md)
- [移动端思考对话框显示修复说明](./移动端思考对话框显示修复说明.md)
- [移动端思考对话框遮挡问题修复说明](./移动端思考对话框遮挡问题修复说明.md)

### 🎯 功能实现
- [自动年龄计算功能实现说明](./自动年龄计算功能实现说明.md)
- [深度咨询内容统一说明](./深度咨询内容统一说明.md)
- [生产环境优化完成说明](./生产环境优化完成说明.md)

### 🚀 部署指南
- [Vercel部署指南](./VERCEL_DEPLOYMENT_GUIDE.md)
- [GitHub Pages部署](./GITHUB_PAGES_DEPLOYMENT.md)
- [环境配置检查清单](./VERCEL_ENV_CHECKLIST.md)

## 🐛 问题排查

### 常见问题
1. **API调用失败**: 检查环境变量配置
2. **移动端显示问题**: 查看移动端兼容性文档
3. **认证问题**: 参考JWT和OAuth相关文档
4. **部署问题**: 查看部署指南

### 调试工具
- 浏览器开发者工具
- 网络请求监控
- 控制台日志分析

## 🤝 贡献指南

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

### 代码规范
- 使用TypeScript
- 遵循ESLint规则
- 编写清晰的注释
- 保持代码整洁

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 创建Issue
- 发送邮件
- 提交Pull Request

---

**最后更新**: 2025年1月27日

*本项目持续更新中，欢迎关注和贡献！*
