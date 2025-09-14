# 🔑 扣子API Token更新指南

## 当前状态
- ❌ 当前Token已失效
- ⚠️ 需要重新生成新Token
- 🔄 项目已配置为使用新Token

## 更新步骤

### 1. 生成新Token
1. 访问 [扣子官网](https://coze.cn)
2. 登录您的账户
3. 左下角选择 **"扣子 API"**
4. 在 **"API 令牌"** 中选择 **"添加新令牌"**
5. 配置如下：
   - **令牌名称**: 项目API令牌
   - **过期时间**: 永久有效
   - **团队空间**: 选择正确的团队空间
   - **权限**: 勾选所有权限（特别是chat相关权限）
6. 点击 **"保存"** 并复制新Token

### 2. 更新项目配置
将新Token替换到以下文件中的 `YOUR_NEW_TOKEN_HERE`：

**文件**: `src/lib/coze-config.ts`
**需要替换的位置**:
```typescript
// 第22行
token: data.token || 'YOUR_NEW_TOKEN_HERE',

// 第31行  
token: 'YOUR_NEW_TOKEN_HERE',

// 第42行
token: 'YOUR_NEW_TOKEN_HERE',
```

### 3. 验证Token有效性
使用PowerShell测试新Token：
```powershell
$headers = @{
    'Authorization' = 'Bearer YOUR_NEW_TOKEN_HERE'
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

### 4. 重启项目
```bash
# 停止当前项目
Ctrl+C

# 重新启动
npm run dev
```

## 常见问题

### Q: Token格式是什么？
A: 扣子Token格式为 `cztei_` 开头的长字符串

### Q: 如何确认Token有效？
A: 使用上面的PowerShell命令测试，应该返回200状态码

### Q: 权限设置有什么要求？
A: 必须勾选所有权限，特别是chat相关权限

### Q: 团队空间选择错误怎么办？
A: 重新生成Token时选择正确的团队空间

## 联系支持
如果遇到问题，请联系：
- 扣子官方文档：https://coze.cn/docs
- 扣子社区：https://coze.cn/community
