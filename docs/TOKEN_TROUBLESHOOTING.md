# 扣子API Token失效问题排查指南

## 🚨 常见Token失效原因

### 1. Token权限配置问题
- **权限不足**：Token没有足够的权限访问聊天功能
- **团队空间错误**：Token绑定到错误的团队空间
- **权限范围限制**：某些功能需要特定权限

### 2. Token生成配置问题
- **过期时间设置**：Token设置了短期过期时间
- **权限选择不完整**：生成时未勾选所有必要权限
- **团队空间选择错误**：选择了错误的团队空间

### 3. API调用方式问题
- **请求头格式错误**：Authorization头格式不正确
- **参数传递错误**：请求参数格式或内容有误
- **API版本过时**：使用了过时的API版本

### 4. 平台限制问题
- **调用频率超限**：超过API调用频率限制
- **并发请求过多**：同时发送过多请求
- **IP地址限制**：IP地址被限制访问

## 🛠️ 解决方案

### 1. 重新生成Token（推荐）
```bash
# 在扣子官网操作步骤：
1. 登录扣子官网
2. 左下角选择"扣子 API"
3. 在"API 令牌"中选择"添加新令牌"
4. 为令牌命名（如：项目API令牌）
5. 选择过期时间：永久有效
6. 选择指定团队空间：确保选择正确的空间
7. 勾选所有权限：特别是chat相关权限
8. 保存并复制Token
```

### 2. 验证Token有效性
```bash
# PowerShell测试命令
$headers = @{
    'Authorization' = 'Bearer YOUR_TOKEN_HERE'
    'Content-Type' = 'application/json'
}
$body = '{
  "bot_id": "7547965462022193162",
  "user_id": "123456789",
  "stream": false,
  "additional_messages": [
    {
      "content": "hello",
      "content_type": "text",
      "role": "user",
      "type": "question"
    }
  ],
  "parameters": {}
}'
$response = Invoke-WebRequest -Uri "https://api.coze.cn/v3/chat" -Method POST -Headers $headers -Body $body
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content: $($response.Content)"
```

### 3. 检查项目配置
```typescript
// 确保Token格式正确
const token = 'cztei_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// 确保Token以cztei_开头
if (!token.startsWith('cztei_')) {
  console.error('Token格式不正确');
}

// 确保API调用参数正确
const requestBody = {
  bot_id: "7547965462022193162",
  user_id: "user_" + Date.now(),
  stream: false,
  additional_messages: [
    {
      content: "用户问题",
      content_type: "text",
      role: "user",
      type: "question"
    }
  ],
  parameters: {}
};
```

## 🔍 调试步骤

### 1. 检查控制台日志
```javascript
// 查看以下日志信息：
- Token格式是否正确
- API请求参数是否完整
- 响应状态码和错误信息
- 请求体大小是否过大
```

### 2. 网络请求检查
```javascript
// 在浏览器开发者工具中检查：
- Network标签页中的API请求
- 请求头是否正确
- 响应状态码
- 错误信息详情
```

### 3. 常见错误码
- **4101**: Token无效或过期
- **4001**: 参数错误
- **4003**: 权限不足
- **429**: 请求频率超限
- **500**: 服务器内部错误

## 📋 预防措施

### 1. Token管理
- 定期检查Token有效性
- 使用环境变量存储Token
- 避免在代码中硬编码Token
- 设置Token过期提醒

### 2. API调用优化
- 实现请求重试机制
- 添加错误处理和降级方案
- 监控API调用频率
- 优化请求体大小

### 3. 监控和日志
- 记录API调用日志
- 监控错误率
- 设置告警机制
- 定期检查API状态

## 🆘 紧急处理

如果Token持续失效：

1. **立即重新生成Token**
2. **检查扣子平台状态**
3. **联系扣子技术支持**
4. **查看官方公告**
5. **使用备用Token**

## 📞 技术支持

- 扣子官方文档：https://coze.cn/docs
- 扣子社区论坛：https://coze.cn/community
- 技术支持邮箱：support@coze.cn
