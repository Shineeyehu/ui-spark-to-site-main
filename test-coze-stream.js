// 测试新的 Coze API v3 流式功能
import { CozeAPI } from './src/lib/coze-api.js';
import { getCozeConfig } from './src/lib/coze-config.js';

async function testCozeStream() {
  console.log('🚀 开始测试 Coze API v3 流式功能...\n');

  try {
    // 获取配置
    const config = getCozeConfig();
    console.log('📋 当前配置:');
    console.log('- API 版本:', config.apiVersion);
    console.log('- 基础 URL:', config.baseUrl);
    console.log('- Bot ID:', config.botId);
    console.log('- 支持流式:', config.streamEnabled);
    console.log('- 超时时间:', config.timeout, 'ms');
    console.log('- 轮询间隔:', config.pollingInterval, 'ms\n');

    // 初始化 API
    const cozeAPI = new CozeAPI(config);
    console.log('✅ CozeAPI 初始化成功\n');

    // 测试流式聊天
    console.log('💬 开始流式聊天测试...');
    const testMessage = '你好，请简单介绍一下自己';
    
    console.log(`📤 发送消息: "${testMessage}"`);
    
    const stream = await cozeAPI.streamChat(testMessage);
    console.log('🔄 流式响应已启动\n');

    // 读取流式数据
    const reader = stream.getReader();
    let messageCount = 0;
    let totalContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('\n✅ 流式响应完成');
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              messageCount++;
              
              console.log(`📨 消息 ${messageCount}:`, {
                event: data.event,
                type: data.type,
                content: data.content ? data.content.substring(0, 50) + '...' : '无内容'
              });

              if (data.content) {
                totalContent += data.content;
              }
            } catch (e) {
              console.log('⚠️  解析数据失败:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    console.log('\n📊 测试结果:');
    console.log('- 收到消息数量:', messageCount);
    console.log('- 总内容长度:', totalContent.length);
    console.log('- 内容预览:', totalContent.substring(0, 100) + '...');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testCozeStream().catch(console.error);