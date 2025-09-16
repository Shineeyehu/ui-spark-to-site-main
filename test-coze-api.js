// 测试Coze API连接
const testCozeAPI = async () => {
  const token = 'pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS';
  const botId = '7546564367413379135';
  
  console.log('测试Coze API连接...');
  console.log('Token:', token.substring(0, 20) + '...');
  console.log('Bot ID:', botId);
  
  try {
    const response = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Coze-Client/1.0',
      },
      body: JSON.stringify({
        bot_id: botId,
        user_id: 'test_user_' + Date.now(),
        stream: false,
        additional_messages: [{
          content: '你好，这是一个测试消息',
          content_type: "text",
          role: "user",
          type: "question"
        }],
        parameters: {}
      }),
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('响应内容:', responseText);
    
    if (!response.ok) {
      console.error('API调用失败:', response.status, responseText);
      return false;
    }
    
    const data = JSON.parse(responseText);
    console.log('解析后的响应:', data);
    
    if (data.code && data.code !== 0) {
      console.error('Coze API错误:', data.msg);
      return false;
    }
    
    console.log('✅ API测试成功！');
    return true;
    
  } catch (error) {
    console.error('❌ API测试失败:', error);
    return false;
  }
};

// 在Node.js环境中运行
if (typeof window === 'undefined') {
  testCozeAPI();
}

// 在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.testCozeAPI = testCozeAPI;
  console.log('在浏览器控制台中运行: testCozeAPI()');
}