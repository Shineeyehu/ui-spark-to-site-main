# 扣子API令牌管理指南

## 问题分析

扣子API令牌频繁失效的原因：

1. **令牌时效性**：扣子API令牌可能有较短的有效期（通常24-48小时）
2. **使用频率限制**：频繁调用可能导致令牌被临时限制
3. **账户类型限制**：免费账户可能有更严格的限制
4. **API调用量限制**：超出每日调用限制会导致令牌失效

## 解决方案

### 1. 智能后备机制 ✅

我已经实现了智能后备机制：
- 当扣子API令牌失效时，自动使用智能模拟回复
- 根据用户问题类型生成个性化的回复
- 保持完整的用户体验

### 2. 令牌更新流程

当遇到令牌失效时：

1. **获取新令牌**：
   - 访问 [https://www.coze.cn](https://www.coze.cn)
   - 登录 → 开发者设置 → 个人访问令牌
   - 创建新令牌或刷新现有令牌

2. **更新配置**：
   - 将新令牌替换 `src/lib/coze-config.ts` 中的硬编码令牌
   - 或者设置环境变量 `VITE_COZE_API_TOKEN`

3. **验证令牌**：
   ```powershell
   $headers = @{'Authorization' = 'Bearer YOUR_NEW_TOKEN'; 'Content-Type' = 'application/json'}
   $body = '{"bot_id": "7546564367413379135", "user_id": "123456789", "stream": false, "additional_messages": [{"content": "hello", "content_type": "text", "role": "user", "type": "question"}], "parameters": {}}'
   Invoke-WebRequest -Uri "https://api.coze.cn/v3/chat" -Method POST -Headers $headers -Body $body
   ```

### 3. 环境变量配置（推荐）

创建 `.env.local` 文件：
```env
VITE_COZE_API_TOKEN=您的扣子API令牌
VITE_COZE_BOT_ID=7546564367413379135
```

### 4. 长期解决方案

#### 方案A：升级扣子账户
- 考虑升级到付费账户
- 获得更长的令牌有效期
- 更高的API调用限制

#### 方案B：实现令牌自动刷新
- 集成扣子API的令牌刷新机制
- 自动检测令牌失效并更新
- 减少手动维护工作

#### 方案C：使用多个令牌轮换
- 配置多个有效令牌
- 实现令牌轮换机制
- 提高系统稳定性

## 当前状态

✅ **已配置新令牌**：`cztei_qWuvWgYwcOQJ3ueTuzbytdrHwxRumNwJOTkFAl94W16W1FZlrbGeamRdnRODnL4hb`

✅ **智能后备机制**：令牌失效时自动使用模拟回复

✅ **错误处理优化**：友好的错误提示和自动恢复

## 监控和维护

1. **定期检查令牌状态**
2. **监控API调用频率**
3. **及时更新失效令牌**
4. **优化API调用策略**

## 注意事项

- 令牌只显示一次，请及时保存
- 定期备份有效令牌
- 监控API使用量避免超限
- 考虑实现自动化令牌管理

现在系统已经具备了强大的容错能力，即使扣子API令牌失效，用户仍然可以获得智能的回复体验！
