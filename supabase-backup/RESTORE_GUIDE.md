# Supabase 恢复指南

本文档说明如何恢复项目中的 Supabase 功能。所有 Supabase 相关代码已备份到 `supabase-backup` 目录中。

## 备份内容

### 1. 集成代码
- `integrations/supabase/client.ts` - Supabase 客户端配置
- `integrations/supabase/types.ts` - 数据库类型定义

### 2. Edge Functions
- `functions/coze-chat/index.ts` - 扣子聊天 Edge Function
- `functions/get-coze-config/index.ts` - 获取扣子配置 Edge Function

### 3. 配置文件
- `config.toml` - Supabase 项目配置
- `migrations/` - 数据库迁移文件

## 恢复步骤

### 1. 恢复依赖
在 `package.json` 中取消注释 Supabase 依赖：
```json
"@supabase/supabase-js": "^2.57.2",
```

然后重新安装依赖：
```bash
npm install
```

### 2. 恢复集成代码
将 `supabase-backup/integrations/` 目录复制回 `src/integrations/`：
```bash
xcopy supabase-backup\integrations src\integrations /E /I
```

### 3. 恢复 Edge Functions
将 `supabase-backup/functions/` 目录复制回 `supabase/functions/`：
```bash
xcopy supabase-backup\functions supabase\functions /E /I
```

### 4. 恢复配置文件
```bash
xcopy supabase-backup\config.toml supabase\
xcopy supabase-backup\migrations supabase\migrations /E /I
```

### 5. 恢复代码中的 Supabase 调用

#### 在 `src/lib/coze-api.ts` 中：
1. 取消注释第1行的导入：
```typescript
import { supabase } from "@/integrations/supabase/client";
```

2. 在 `sendMessage` 方法中，替换临时错误抛出代码为原始 Supabase 调用：
```typescript
const { data, error } = await supabase.functions.invoke('coze-chat', {
  body: {
    message,
    conversationId: conversationId || this.config.conversationId
  }
});

if (error) {
  throw new Error(error.message);
}

if (data?.error) {
  throw new Error(data.error);
}

return data;
```

3. 在 `analyzeBirthInfo` 方法中，进行相同的恢复操作。

#### 在 `src/lib/coze-config.ts` 中：
1. 取消注释第1行的导入：
```typescript
import { supabase } from "@/integrations/supabase/client";
```

2. 在 `getCozeConfigSecure` 方法中，恢复原始 Supabase 调用：
```typescript
const { data, error } = await supabase.functions.invoke('get-coze-config');

if (error) {
  console.error('获取扣子配置失败:', error);
  throw new Error('无法获取扣子配置');
}

return {
  botId: data.botId || '7546564367413379135',
  token: data.token || 'cztei_qWuvWgYwcOQJ3ueTuzbytdrHwxRumNwJOTkFAl94W16W1FZlrbGeamRdnRODnL4hb',
  userId: 'user_' + Date.now(),
  nickname: '用户',
  useJWT: true
};
```

### 6. 环境变量配置
确保 `.env` 文件中包含必要的 Supabase 环境变量：
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 7. 启动 Supabase 服务
如果使用本地开发：
```bash
supabase start
```

## 注意事项

1. **环境变量**：确保所有必要的 Supabase 环境变量都已正确配置
2. **数据库迁移**：恢复后可能需要运行数据库迁移
3. **Edge Functions 部署**：如果使用生产环境，需要重新部署 Edge Functions
4. **测试**：恢复后请彻底测试所有功能

## 当前状态

- ✅ Supabase 代码已备份
- ✅ 主要文件中的 Supabase 调用已注释
- ✅ package.json 中的依赖已注释
- ❌ Supabase 功能已禁用

恢复后，项目将重新获得完整的 Supabase 功能，包括 Edge Functions 和数据库集成。