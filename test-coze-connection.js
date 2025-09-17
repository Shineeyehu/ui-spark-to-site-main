// 测试 Coze API 连接
const testCozeAPI = async () => {
  const botId = '7546564367413379135';
  const token = 'pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS';
  
  console.log('🔍 测试 Coze API 连接...');
  console.log('Bot ID:', botId);
  console.log('Token:', token.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: botId,
        user_id: 'test_user_' + Date.now(),
        stream: true,
        additional_messages: [
          {
            content: '你好，请简单介绍一下自己',
            content_type: 'text',
            role: 'user',
            type: 'question'
          }
        ],
        parameters: {},
        enable_card: false,
        publish_status: 'published_online',
        auto_save_history: true
      })
    });

    console.log('📡 响应状态:', response.status);
    console.log('📡 响应头:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 调用失败:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API 调用成功!');
    console.log('📄 响应数据:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
};

// 运行测试
testCozeAPI();