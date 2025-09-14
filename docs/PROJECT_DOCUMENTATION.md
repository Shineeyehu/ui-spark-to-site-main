# 深度咨询AI系统 - 项目文档

## 项目概述

深度咨询AI系统是一个基于React + TypeScript的现代化Web应用，集成了扣子(Coze) AI平台和月之暗面(Moonshot) API，为用户提供智能命理分析和深度咨询服务。

## 核心功能

### 1. 智能命理分析
- 基于用户生辰八字进行AI分析
- 支持多种分析维度：性格特征、事业发展、感情运势等
- 生成详细的个性化报告

### 2. AI对话咨询
- 集成扣子AI机器人，提供智能对话服务
- 支持上下文理解和连续对话
- 智能回复生成和问题解答

### 3. 双重认证系统
- **JWT OAuth认证**：主要认证方式，支持扣子平台OAuth流程
- **API Key认证**：备用认证方案，确保服务稳定性
- 自动令牌刷新和过期处理

## 技术架构

### 前端技术栈
- **React 18** + **TypeScript**
- **Vite** 构建工具
- **Tailwind CSS** 样式框架
- **Radix UI** 组件库
- **React Router** 路由管理
- **React Query** 状态管理

### 后端集成
- **Supabase** 数据库和后端服务
- **扣子(Coze) API** AI对话服务
- **月之暗面(Moonshot) API** 文本分析服务

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件
│   ├── CozeV3Chat.tsx  # 扣子AI聊天组件
│   ├── BirthdayForm.tsx # 生辰信息表单
│   └── ...
├── pages/              # 页面组件
│   ├── Index.tsx       # 首页
│   ├── DeepTalkPage.tsx # 深度咨询页面
│   ├── ReportPage.tsx  # 报告页面
│   └── ...
├── lib/                # 核心库文件
│   ├── coze-api.ts     # 扣子API封装
│   ├── jwt-auth.ts     # JWT认证服务
│   ├── moonshot-api.ts # 月之暗面API封装
│   └── ...
├── hooks/              # 自定义Hooks
└── types/              # 类型定义
```

## 环境配置

### 环境变量说明

```bash
# Supabase配置
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url

# 扣子OAuth配置
VITE_COZE_USE_JWT=true
VITE_COZE_CLIENT_ID=your_client_id
VITE_COZE_CLIENT_SECRET=your_client_secret
VITE_COZE_REDIRECT_URI=http://localhost:8082/oauth/callback
VITE_COZE_BOT_ID=your_bot_id
VITE_COZE_USER_ID=user_123

# 扣子API Key配置（备用）
VITE_COZE_API_KEY=your_api_key
```

### 开发环境启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 核心特性

### 1. 智能认证系统
- 优先使用JWT OAuth认证
- API Key作为备用认证方案
- 自动令牌刷新机制
- 认证失败时的智能降级处理

### 2. 错误处理机制
- 全局错误边界
- API调用失败时的友好提示
- 网络异常的自动重试
- 用户友好的错误信息展示

### 3. 响应式设计
- 移动端适配
- 多设备兼容
- 流畅的用户体验

## 部署说明

### 生产环境配置
1. 复制 `.env.example` 为 `.env.production`
2. 配置生产环境的API密钥和URL
3. 确保所有测试代码已被注释
4. 运行 `npm run build` 构建生产版本

### 安全注意事项
- 所有敏感信息通过环境变量配置
- API密钥不应暴露在客户端代码中
- 生产环境禁用调试日志
- 定期更新依赖包版本

## 维护指南

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint配置规则
- 组件采用函数式编程
- 使用自定义Hooks管理状态

### 测试策略
- 核心功能的单元测试
- API集成测试
- 用户界面交互测试

## 故障排除

### 常见问题
1. **认证失败**：检查环境变量配置，确认API密钥有效性
2. **API调用超时**：检查网络连接，确认服务端点可访问
3. **页面加载异常**：清除浏览器缓存，检查控制台错误信息

### 调试工具
- 浏览器开发者工具
- React Developer Tools
- 网络请求监控

## 更新日志

### v1.0.0 (当前版本)
- 完成核心功能开发
- 集成扣子AI和月之暗面API
- 实现双重认证系统
- 优化用户体验和界面设计
- 完成生产环境配置

## 联系信息

如有技术问题或建议，请通过以下方式联系：
- 项目仓库：[GitHub链接]
- 技术支持：[邮箱地址]

---

*最后更新：2025年1月*