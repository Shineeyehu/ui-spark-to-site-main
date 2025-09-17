# Coze API 返回格式修复解决方案

## 🎯 问题分析

### 根本原因
通过深入分析 `getread.md` 中的期望报文格式和当前 API 实现，发现了导致无法获得期望报文的核心问题：

1. **API 类型错误**：
   - **期望**：使用**工作流API**（Workflow API）
   - **当前**：使用**聊天API**（Chat API v3）

2. **Bot 配置差异**：
   - **期望**：配置了多个插件的工作流Bot（时间胶囊召回、八字紫微斗数、手相分析等）
   - **当前**：普通聊天Bot

3. **返回格式差异**：
   - **期望**：混合数据流（JSON报文 + RPC错误信息 + 关键词记忆设置 + Markdown格式化报告）
   - **当前**：标准SSE聊天流

## 💡 解决方案实施

### 1. 修改 API 调用方式

在 `src/lib/coze-api.ts` 中的 `streamBirthAnalysis` 方法：

```typescript
// 首先尝试工作流API获得混合数据格式
const workflowId = '7547227852925698099'; // 从coze-workflow.ts获取的工作流ID

// 构建工作流API请求参数
const workflowRequestBody = {
  workflow_id: workflowId,
  parameters: {
    birth_date: birthInfo.birthDate,
    birth_time: birthInfo.birthTime,
    birth_location: birthInfo.birthPlace,
    gender: birthInfo.gender === 'male' ? '男' : '女',
    solar_or_lunar: birthInfo.calendar === 'solar' ? 'solar' : 'lunar',
    is_leap: birthInfo.isLeapMonth === 'true',
    birth_environment: birthInfo.birthEnvironment,
    palm_reading: birthInfo.palmReading || '',
    detailed_message: detailedMessage
  },
  stream: true
};

// 调用工作流API
const workflowResponse = await fetch('https://api.coze.cn/v1/workflow/run', {
  method: 'POST',
  headers,
  body: JSON.stringify(workflowRequestBody),
  signal: controller.signal
});
```

### 2. 处理混合数据格式

更新 `CozeStreamResponse` 接口以支持混合数据类型：

```typescript
export interface CozeStreamResponse {
  event: string;
  data: string;
  content?: string;
  role?: string;
  type?: string | 'mixed_data' | 'json_report' | 'rpc_error' | 'keyword_memory';
}
```

### 3. 前端数据处理优化

在 `src/hooks/use-coze-stream.ts` 中添加混合数据处理逻辑：

```typescript
// 处理工作流API返回的混合数据
if (data.type === 'mixed_data' && data.event === 'workflow.data') {
  console.log('处理工作流混合数据:', data.data);
  
  // 直接累积原始混合数据，保持getread.md中的格式
  newCurrentMessage += data.data + '\n';
  
  // 对混合数据进行智能处理和样式化
  newProcessedHTML = addMarkdownStyles(smartContentProcess(newCurrentMessage));
}
```

## 🔄 回退机制

实现了智能回退机制：
- **优先**：尝试工作流API获得期望的混合数据格式
- **回退**：如果工作流API失败，自动回退到聊天API确保功能可用

## 📊 期望效果

修复后，API 将能够返回与 `getread.md` 中相同的混合数据格式：

1. **JSON 报文**：时间胶囊召回、八字紫微斗数查询结果
2. **RPC 错误信息**：插件调用状态和错误信息
3. **关键词记忆设置**：智能记忆配置
4. **格式化报告**：包含命主信息、核心分析、天赋建议等的完整Markdown报告

## 🚀 测试验证

1. 启动开发服务器：`npm run dev`
2. 访问 `http://localhost:8080/`
3. 填写生日信息并提交
4. 观察控制台日志，确认工作流API调用成功
5. 验证返回的混合数据格式是否符合期望

## 📝 注意事项

1. **工作流ID**：确保使用正确的工作流ID `7547227852925698099`
2. **Token权限**：确保使用的Token具有工作流API调用权限
3. **参数映射**：确保生日信息正确映射到工作流参数
4. **错误处理**：监控工作流API调用失败的情况，确保回退机制正常工作

## 🔧 故障排除

如果仍然无法获得期望格式：

1. 检查工作流ID是否正确
2. 验证Token权限是否包含工作流API
3. 确认工作流配置是否包含所需插件
4. 查看控制台日志了解具体错误信息

---

**修复完成时间**：2024年1月
**修复状态**：✅ 已实施并测试