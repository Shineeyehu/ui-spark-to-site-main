# 扣子API配置修复指南

## 问题分析

您遇到的令牌失效问题是由于配置混乱导致的：

1. **环境变量名称不一致**：`COZE_TOKEN` vs `COZE_API_TOKEN`
2. **配置来源混乱**：硬编码 vs 环境变量
3. **Supabase环境变量可能未正确设置**

## 解决方案

### 方案1：直接更新硬编码令牌（推荐）

如果您在扣子平台测试的令牌是有效的，可以直接更新配置文件：

1. 打开 `src/lib/coze-config.ts`
2. 将第46行的 `cztei_l9TJYsuULOjBLuOvq98hSWKlS34wLNtxayPrstG80KfhrZRkmbrUJuF3aQJr2RdzI` 替换为您的有效令牌

### 方案2：使用环境变量

1. 在项目根目录创建 `.env.local` 文件：
```env
VITE_COZE_API_TOKEN=您的扣子API令牌
VITE_COZE_BOT_ID=7546564367413379135
```

2. 重启开发服务器

### 方案3：配置Supabase环境变量

1. 登录 [Supabase控制台](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 Settings → Edge Functions
4. 设置环境变量：
   - `COZE_API_TOKEN` = 您的扣子API令牌
   - `COZE_BOT_ID` = 7546564367413379135

## 验证配置

运行以下命令测试令牌有效性：

```powershell
$headers = @{'Authorization' = 'Bearer YOUR_TOKEN_HERE'; 'Content-Type' = 'application/json'}
$body = '{"bot_id": "7546564367413379135", "user_id": "123456789", "stream": false, "additional_messages": [{"content": "hello", "content_type": "text", "role": "user", "type": "question"}], "parameters": {}}'
Invoke-WebRequest -Uri "https://api.coze.cn/v3/chat" -Method POST -Headers $headers -Body $body
```

如果返回200状态码且没有错误，说明令牌有效。

## 已修复的问题

1. ✅ 统一了环境变量名称（都使用 `COZE_API_TOKEN`）
2. ✅ 添加了环境变量支持
3. ✅ 保持了硬编码令牌作为后备

## 下一步

请提供您在扣子平台测试有效的令牌，我会帮您完成配置更新。
