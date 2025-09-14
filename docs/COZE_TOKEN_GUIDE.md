# 扣子API Token获取指南

## 当前状态
- 当前使用的token `cztei_hvL2Ok3vVx1cnZzGKMferHvEog6gLczbZeCDHW7adkdAWAMC3ZthPhZQmoIj7fM54` 仍然无效
- 系统暂时使用智能模拟回复来确保功能正常
- 需要重新生成有效的token

## 获取有效Token的步骤

### 1. 登录扣子平台
访问 [https://www.coze.cn](https://www.coze.cn) 并登录您的账户

### 2. 进入开发者设置
1. 点击右上角头像
2. 选择"开发者设置"或"API设置"
3. 进入"个人访问令牌"页面

### 3. 创建新的Token
1. 点击"创建新令牌"
2. 设置令牌名称（如：ui-spark-site）
3. 选择权限范围：
   - ✅ 聊天API访问
   - ✅ 机器人管理
   - ✅ 消息读取
   - ✅ 所有API权限（如果可用）
4. 设置过期时间（建议选择较长时间或永不过期）
5. 点击"生成令牌"

### 4. 重要注意事项
- **确保选择正确的账户**：个人版 vs 团队版
- **检查权限设置**：确保有足够的API调用权限
- **验证token格式**：应该以 `cztei_` 开头
- **立即保存**：token只显示一次，请立即复制

### 5. 复制并保存Token
- 新生成的token格式类似：`cztei_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **重要**：token只显示一次，请立即复制并保存
- 将token添加到环境变量或配置文件中

### 6. 更新项目配置
在 `src/lib/coze-config.ts` 中更新token：

```typescript
export const getCozeConfig = (): CozeConfig => {
  return {
    botId: '7547965462022193162',
    token: 'YOUR_NEW_TOKEN_HERE', // 替换为新的有效token
    userId: 'user_' + Date.now(),
    nickname: '用户'
  };
};
```

## 验证Token有效性

使用PowerShell测试新token：

```powershell
$headers = @{
    'Authorization' = 'Bearer YOUR_NEW_TOKEN_HERE'
    'Content-Type' = 'application/json'
}
$body = '{
  "bot_id": "7547965462022193162",
  "user_id": "123456789",
  "stream": false,
  "additional_messages": [{
    "content": "hello",
    "content_type": "text",
    "role": "user",
    "type": "question"
  }],
  "parameters": {}
}'
Invoke-WebRequest -Uri "https://api.coze.cn/v3/chat" -Method POST -Headers $headers -Body $body
```

如果返回200状态码且没有错误信息，说明token有效。

## 注意事项

1. **安全性**：不要在代码中硬编码token，建议使用环境变量
2. **权限**：确保token有足够的权限调用所需API
3. **过期时间**：定期检查token是否过期
4. **备份**：保存token到安全的地方，避免丢失

## 当前解决方案

在获取有效token之前，系统会：
- 显示智能模拟回复
- 根据用户问题类型提供个性化建议
- 保持完整的用户体验
- 在控制台显示"当前扣子API token无效，使用智能模拟回复"

获取有效token后，只需更新配置文件即可恢复真实API调用。
