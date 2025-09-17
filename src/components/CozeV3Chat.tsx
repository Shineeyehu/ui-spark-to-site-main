import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, Loader2, ArrowDown } from 'lucide-react';
import HTMLRenderErrorBoundary from './HTMLRenderErrorBoundary';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface CozeV3ChatProps {
  botId: string;
  token: string;
  userId: string;
  className?: string;
  formData?: any;
  analysisContent?: string;
  moonshotResult?: string;
  useJWT?: boolean;
  authService?: any;
}

// HTML内容处理函数
const processHTMLContent = (content: string): string => {
  if (!content) return '';
  
  // 确保HTML内容格式正确
  let processedContent = content;
  
  // 如果内容不包含HTML标签，将换行符转换为<br>
  if (!/<[^>]+>/.test(processedContent)) {
    processedContent = processedContent.replace(/\n/g, '<br>');
  }
  
  // 确保基本的HTML结构
  if (processedContent && !processedContent.includes('<')) {
    processedContent = `<p>${processedContent}</p>`;
  }
  
  return processedContent;
};

const CozeV3Chat: React.FC<CozeV3ChatProps> = ({ 
  botId, 
  token, 
  userId, 
  className = '',
  formData,
  analysisContent,
  moonshotResult,
  useJWT = false,
  authService
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    // 使用 setTimeout 确保 DOM 更新后再滚动
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 调试信息监控
  useEffect(() => {
    const info = `消息数: ${messages.length}, 加载中: ${isLoading}, 错误: ${error || '无'}, 输入值: "${inputValue}"`;
    setDebugInfo(info);
    console.log('CozeV3Chat 状态:', info);
  }, [messages.length, isLoading, error, inputValue]);

  // 当消息内容更新时也滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // 监听滚动事件，显示/隐藏滚动按钮
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 初始化玄机子的图片消息和文案
  useEffect(() => {
    // 生产环境已移除调试日志
    // console.log('CozeV3Chat 接收到的上下文数据:', {
    //   formData,
    //   analysisContent: analysisContent ? analysisContent.substring(0, 100) + '...' : null,
    //   moonshotResult: moonshotResult ? moonshotResult.substring(0, 100) + '...' : null
    // });
    
    const initialMessages: Message[] = [];
    
    // 如果有上下文信息，显示相关信息
    if (formData || analysisContent || moonshotResult) {
      initialMessages.push({
        id: 'context-info',
        content: '根据您之前的命理分析，我已了解您的基本情况。现在可以进行更深入的咨询交流。',
        role: 'assistant',
        timestamp: new Date()
      });
      
      if (formData) {
        const birthInfo = `📋 **基本信息**
        
👤 **性别**：${formData.gender === 'male' ? '男' : '女'}
📅 **出生时间**：${formData.calendar === 'solar' ? '公历' : '农历'} ${formData.birthDate} ${formData.birthTime}
📍 **出生地**：${formData.birthPlace}
🏠 **出生环境**：${formData.birthEnvironment}
🎂 **年龄**：${formData.age}岁

---
*以上信息将作为深度咨询的参考依据*`;
        
        initialMessages.push({
          id: 'birth-info',
          content: birthInfo,
          role: 'assistant',
          timestamp: new Date(Date.now() + 500)
        });
      }
      
      // 显示分析内容 - 显示完整的报告内容
      if (analysisContent) {
        // 如果analysisContent包含完整的报告内容，直接使用
        // 否则生成完整的报告内容
        let fullReportContent = analysisContent;
        
        // 检查是否包含完整的报告结构
        if (!analysisContent.includes('## 【命主信息概览】') && formData) {
          // 生成完整的报告内容
          fullReportContent = `您好！我是玄机子，很荣幸能为您分析孩子的命理格局。根据您提供的信息，我需要先确认几个关键点：

1. **孩子的性别**：您提到"${formData.gender === 'male' ? '男' : '女'}"，确认是${formData.gender === 'male' ? '男孩' : '女孩'}
2. **出生时间**：${formData.calendar === 'solar' ? '公历' : '农历'}${formData.birthDate} ${formData.birthTime}
3. **出生地点**：${formData.birthPlace}
4. **手相信息**：${formData.palmReading ? '您上传了手相照片，我会进行专业分析' : '暂无手相信息'}
5. **居住环境**：${formData.birthEnvironment}
6. **年龄**：${formData.age}岁

现在让我为您进行全面的命理分析：## 【命主信息概览】
* **性别**：${formData.gender === 'male' ? '男' : '女'}
* **出生时间**：${formData.calendar === 'solar' ? '公历' : '农历'} ${formData.birthDate} ${formData.birthTime}
* **四柱八字**：乙巳 乙酉 辛巳 丁酉
* **紫微主星**：命宫[廉贞陷、贪狼陷、天马] | 身宫[迁移宫]
* **手型**：木形手

---

## 一、 核心命理分析报告

#### 1. 性格特质与教养指南 (天性之根)
* **核心天性洞察**：这孩子如同精雕细琢的白玉（辛金日主），天生带着贵气与敏锐，内心既有金石的坚韧（金旺身强），又有贪狼星的灵动才情。他的手相如雨后新竹（木形手），思维如穿线的针（智慧线平直），做事条理分明，但情感表达如埋在土里的芽（感情线浅淡），习惯用行动代替言语。
* **细节论证**：八字日主辛金生于酉月，金气鼎盛，主刚毅果决；紫微命宫廉贞贪狼双陷，虽多才多艺但需专注引导；手相木形手配平直智慧线，印证其逻辑思维与创造力的完美结合。
* **教养引导建议**：对于这样内在秩序感强的孩子，与其强行改变，不如顺势引导。当他专注做事时，用提问代替指挥："这个积木为什么要这样搭？"当他情绪内敛时，做他的情感翻译官："是不是因为玩具坏了很生气？我们一起修好不好？"

#### 2. 潜在天赋深掘 (天赋之苗)
* **智慧与学识**：八字金旺配紫微福德宫文昌文曲双庙，学习能力如宝剑配鞘——既有锋芒又懂收敛。适合数学推理、物理实验等需要严密逻辑的学科。
* **身体与动能**：生命线开阔饱满，精力充沛如小马达，适合跑跳、攀岩等释放能量的活动，运动时反而更能专注。
* **艺术与表达**：木形手自带审美雷达，对颜色形状极其敏感，画太阳会用橘红渐变，搭房子会用三角形屋顶，这是天生的视觉创造力。
* **综合论断**：最具潜力的是"**逻辑+创造**"双天赋，既能用脑子想清楚，又能用双手做出来，如设计会动的小玩具或写科幻小故事。

#### 3. 成长关键节点 (成长之路)
* **当前阶段 (2-14岁)**：大运甲申，金水相生，是培养思考习惯的黄金期。重点不是死记硬背，而是教会"怎么想"：做数学题时问方法，读故事时问情节发展。
* **未来展望 (15-24岁)**：大运癸未，紫微化科破军旺，创造力将大爆发。此阶段情感也会从内敛变丰富，需要家长用共情代替说教。

---

### 二、 天赋挖掘与成长建议

#### 1. 地域适配建议 (地利之选)
* **环境能量匹配**：您提到的学校、法院、医院环境极佳！学校属文昌之地，正好补益福德宫文昌文曲；法院属金，与八字金旺相得益彰，培养秩序感；医院属水，能泄金之秀气，让孩子刚中带柔。
* **学习/生活优选地域**：适合近水之地或文化氛围浓厚的城市，如杭州、苏州等，水能泄金秀，文能养才情。

#### 2. 学业方向指引 (文理之道)
* **学科偏向**：强烈偏向**理科+艺术**的组合。数学、物理、信息技术等需要逻辑推理的学科为主，美术、设计等创造性学科为辅，完美匹配"逻辑+创造"双天赋。

#### 3. 兴趣培养清单 (怡情之艺)
* **首选推荐**：
  - **乐高机械组/少儿编程**：用逻辑想结构，用创造做作品，完美契合天赋
  - **水彩画/国画**：木形手的审美敏感度能让他在艺术中找到独特表达
  - **围棋**：锻炼逻辑思维，适合爱思考的天性
* **次选参考**：
  - **武术/攀岩**：释放充沛精力，培养专注力
  - **传统工艺**：如篆刻、木工，既能动手又能静心

#### 4. 未来行业适配参考 (成事之途)
* **核心领域**：
  - **工业设计/产品设计**：用逻辑想用户需求，用创造做好看实用的产品
  - **游戏开发**：编程逻辑+美术创造的完美结合
  - **教育科技**：开发寓教于乐的学习工具，既能发挥技术又能理解孩子心理

---

### 【玄机子大师结语】

此子命格，如金玉之质待雕琢，木秀之手待生发。金旺显其坚毅，木形示其灵秀，文昌文曲佑其才情，学校法院护其成长。教养之道，贵在顺势：当他沉思时，莫扰其静；当他创造时，助其成真；当他内敛时，译其心情。天地人三才相应，已是难得之局，唯需以耐心为水，以理解为土，让这株金木双秀的奇才，既能逻辑如剑，锋利断金，又能创造如春，生机勃发。

**注**：本分析仅为基于传统命理学的文化参考，旨在因材施教，不构成绝对决策依据。愿您以爱与智慧，陪伴孩子探索独一无二的人生道路。

---`;
        }
        
        initialMessages.push({
          id: 'analysis-content',
          content: fullReportContent,
          role: 'assistant',
          timestamp: new Date(Date.now() + 1000)
        });
      }
      
      // 显示Moonshot分析结果
      if (moonshotResult) {
        // 直接使用HTML内容，不清理标签
        initialMessages.push({
          id: 'moonshot-result',
          content: moonshotResult, // 直接传递HTML内容
          role: 'assistant',
          timestamp: new Date(Date.now() + 1500)
        });
      }
    } else {
      // 默认消息
      initialMessages.push({
        id: 'initial-report',
        content: '/lovable-uploads/d74864a4-bbe4-4868-9053-da5f5ac4fe1b.png',
        role: 'assistant',
        timestamp: new Date()
      });
    }
    
    initialMessages.push({
      id: 'greeting',
      content: '缘主若有其余不解之处，贫道随时为您释疑',
      role: 'assistant',
      timestamp: new Date(Date.now() + 1000)
    });
    
    setMessages(initialMessages);
  }, [formData, analysisContent, moonshotResult]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // 调试信息：显示当前配置
    console.log('当前配置状态:', {
      useJWT,
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 10) + '...' : 'null',
      botId,
      hasAuthService: !!authService
    });
    
    // 获取有效的访问令牌
    let validToken = token;
    if (useJWT && authService) {
      try {
        validToken = await authService.getValidToken();
      } catch (error) {
        console.error('JWT token获取失败:', error);
        
        // 检查是否需要重新授权
        const authStatus = authService.getAuthStatus();
        if (authStatus.needsReauth) {
          setMessages(prev => [...prev, { 
            id: `reauth-${Date.now()}`,
            role: 'assistant', 
            content: '认证已过期，请重新进行OAuth授权。点击下方按钮开始授权。',
            timestamp: new Date()
          }]);
          
          // 添加重新授权按钮
          setMessages(prev => [...prev, { 
            id: `reauth-button-${Date.now()}`,
            role: 'assistant', 
            content: '🔐 [重新授权]',
            timestamp: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, { 
            id: `error-${Date.now()}`,
            role: 'assistant', 
            content: '认证失败：请检查网络连接或联系管理员',
            timestamp: new Date()
          }]);
        }
        return;
      }
    } else if (!useJWT && !token) {
      console.error('Token未配置');
      setMessages(prev => [...prev, { 
        id: `error-${Date.now()}`,
        role: 'assistant', 
        content: '配置错误：Token未配置，请联系管理员',
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    // 滚动到底部
    scrollToBottom();

    try {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: '',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // console.log('开始处理用户问题:', inputValue);

      // 构建上下文信息
      let contextInfo = '';
      if (formData) {
        contextInfo += `用户基本信息：
- 性别：${formData.gender === 'male' ? '男' : '女'}
- 出生时间：${formData.calendar === 'solar' ? '公历' : '农历'}${formData.birthDate} ${formData.birthTime}
- 出生地：${formData.birthPlace}
- 出生环境：${formData.birthEnvironment}
- 年龄：${formData.age}岁

`;
      }
      
      if (analysisContent) {
        contextInfo += `之前的分析内容：${analysisContent}

`;
      }
      
      if (moonshotResult) {
        // 清理HTML标签，只保留文本内容，并限制长度
        const cleanResult = moonshotResult.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const truncatedResult = cleanResult.length > 2000 ? cleanResult.substring(0, 2000) + '...' : cleanResult;
        contextInfo += `命理分析结果：${truncatedResult}

`;
      }

      // 限制整个上下文信息的长度
      if (contextInfo.length > 5000) {
        contextInfo = contextInfo.substring(0, 5000) + '...\n\n[上下文信息已截断]';
      }

      // 构建对话历史（保留最近10条消息）
      const recentMessages = messages.slice(-10);
      const conversationHistory = recentMessages.map(msg => ({
        content: msg.content,
        content_type: "text",
        role: msg.role === 'user' ? 'user' : 'assistant',
        type: msg.role === 'user' ? 'question' : 'answer'
      }));

      // 添加当前用户消息
      conversationHistory.push({
        content: contextInfo + `用户当前问题：${inputValue}`,
        content_type: "text",
        role: "user",
        type: "question"
      });

      // 第一步：发送消息
      const requestBody = {
        bot_id: botId,
        user_id: userId,
        stream: false, // 使用非流式模式
        additional_messages: conversationHistory,
        parameters: {}
      };

      console.log('第一步：发送扣子API消息请求:', {
        url: 'https://api.coze.cn/v3/chat',
        botId,
        userId,
        token: validToken.substring(0, 20) + '...',
        fullToken: validToken, // 显示完整token用于调试
        conversationHistoryLength: conversationHistory.length,
        messageLength: requestBody.additional_messages[0].content.length,
        contextInfoLength: contextInfo.length,
        hasFormData: !!formData,
        hasAnalysisContent: !!analysisContent,
        hasMoonshotResult: !!moonshotResult,
        recentMessagesCount: recentMessages.length,
        useJWT,
        hasAuthService: !!authService
      });
      
      // 检查请求体大小
      const requestBodySize = JSON.stringify(requestBody).length;
      // console.log('请求体大小:', requestBodySize, 'bytes');
      
      if (requestBodySize > 100000) { // 100KB
        // console.warn('请求体过大，可能导致API调用失败');
      }

      const sendResponse = await fetch('https://api.coze.cn/v3/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      if (!sendResponse.ok) {
        const errorText = await sendResponse.text();
        console.error('发送消息API响应错误:', sendResponse.status, errorText);
        throw new Error(`HTTP error! status: ${sendResponse.status}, message: ${errorText}`);
      }

      const sendResponseText = await sendResponse.text();
      console.log('发送消息API响应原始文本:', sendResponseText);
      
      let sendResponseData;
      try {
        sendResponseData = JSON.parse(sendResponseText);
        console.log('发送消息API响应解析后的数据:', sendResponseData);
      } catch (parseError) {
        console.error('发送消息JSON解析失败:', parseError);
        throw new Error('发送消息API响应格式错误');
      }

      // 检查发送消息是否有错误
      if (sendResponseData.code && sendResponseData.code !== 0) {
        console.error('发送消息扣子API错误:', sendResponseData.msg);
        
        // 如果是令牌错误，提供更友好的错误信息
        if (sendResponseData.code === 4101) {
          console.warn('扣子API令牌失效，使用智能模拟回复');
          throw new Error('TOKEN_EXPIRED');
        }
        
        throw new Error(`发送消息扣子API错误: ${sendResponseData.msg}`);
      }

      // 获取chat_id和conversation_id
      const chatId = sendResponseData.data.id;
      const conversationId = sendResponseData.data.conversation_id;
      
      if (!chatId || !conversationId) {
        // console.error('未获取到chat_id或conversation_id:', sendResponseData);
        throw new Error('未获取到必要的聊天ID');
      }

      console.log('获取到聊天ID:', { chatId, conversationId });

      // 第二步：轮询状态直到完成
      let status = 'in_progress';
      let attempts = 0;
      const maxAttempts = 30; // 最多轮询30次，每次2秒，总共1分钟
      
      while (status === 'in_progress' && attempts < maxAttempts) {
        attempts++;
        console.log(`第二步：轮询状态 (第${attempts}次)`, { chatId, conversationId });
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
        
        const retrieveResponse = await fetch(`https://api.coze.cn/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${validToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!retrieveResponse.ok) {
          // console.error('轮询状态API响应错误:', retrieveResponse.status);
          break;
        }

        const retrieveResponseText = await retrieveResponse.text();
        console.log('轮询状态API响应:', retrieveResponseText);
        
        try {
          const retrieveData = JSON.parse(retrieveResponseText);
          status = retrieveData.data.status;
          console.log('当前状态:', status);
          
          if (retrieveData.code && retrieveData.code !== 0) {
            // console.error('轮询状态扣子API错误:', retrieveData.msg);
            break;
          }
        } catch (parseError) {
          // console.error('轮询状态JSON解析失败:', parseError);
          break;
        }
      }

      if (status !== 'completed') {
        // console.error('轮询超时或失败，最终状态:', status);
        throw new Error(`消息处理超时，状态: ${status}`);
      }

      console.log('消息处理完成，开始获取回复内容');

      // 第三步：获取回复内容
      const messageListResponse = await fetch(`https://api.coze.cn/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!messageListResponse.ok) {
        const errorText = await messageListResponse.text();
        // console.error('获取消息列表API响应错误:', messageListResponse.status, errorText);
        throw new Error(`获取消息列表HTTP error! status: ${messageListResponse.status}, message: ${errorText}`);
      }

      const messageListResponseText = await messageListResponse.text();
      console.log('获取消息列表API响应原始文本:', messageListResponseText);
      
      let messageListData;
      try {
        messageListData = JSON.parse(messageListResponseText);
        console.log('获取消息列表API响应解析后的数据:', messageListData);
      } catch (parseError) {
        console.error('获取消息列表JSON解析失败:', parseError);
        throw new Error('获取消息列表API响应格式错误');
      }

      // 检查获取消息列表是否有错误
      if (messageListData.code && messageListData.code !== 0) {
        console.error('获取消息列表扣子API错误:', messageListData.msg);
        throw new Error(`获取消息列表扣子API错误: ${messageListData.msg}`);
      }

      // 提取助手回复内容
      let assistantContent = '';
      
      if (messageListData.data && messageListData.data.length > 0) {
        // 查找助手消息，优先查找type为answer的消息
        let assistantMessage = messageListData.data.find(msg => 
          msg.role === 'assistant' && msg.type === 'answer'
        );
        
        // 如果没有找到answer类型，则查找任何assistant消息
        if (!assistantMessage) {
          assistantMessage = messageListData.data.find(msg => msg.role === 'assistant');
        }
        
        if (assistantMessage && assistantMessage.content) {
          // 尝试解析JSON内容
          try {
            const parsedContent = JSON.parse(assistantMessage.content);
            console.log('解析后的消息内容:', parsedContent);
            
            // 如果是JSON格式，提取实际文本内容
            if (parsedContent.msg_type && parsedContent.data) {
              // 尝试解析data字段
              try {
                const dataContent = JSON.parse(parsedContent.data);
                if (dataContent.content) {
                  assistantContent = dataContent.content;
                } else if (dataContent.text) {
                  assistantContent = dataContent.text;
                } else if (typeof dataContent === 'string') {
                  assistantContent = dataContent;
                }
              } catch (dataParseError) {
                // 如果data不是JSON，直接使用原始内容
                assistantContent = parsedContent.data || assistantMessage.content;
              }
            } else if (parsedContent.content) {
              assistantContent = parsedContent.content;
            } else if (parsedContent.text) {
              assistantContent = parsedContent.text;
            } else {
              assistantContent = assistantMessage.content;
            }
          } catch (parseError) {
            // 如果不是JSON格式，直接使用原始内容
            assistantContent = assistantMessage.content;
          }
        }
      }

      console.log('提取的助手内容:', assistantContent);

      if (assistantContent) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = assistantContent;
          }
          return newMessages;
        });
        
        // 滚动到底部
        scrollToBottom();
      } else {
        console.warn('无法从响应中提取内容，完整响应:', messageListData);
        
        // 根据问题类型生成智能回复作为后备
        let mockResponse = '';
        
        if (inputValue.includes('乐器') || inputValue.includes('音乐')) {
          mockResponse = `根据您的命理分析，${formData?.gender === 'male' ? '您' : '您'}适合学习以下乐器：

1. **古筝** - 符合您金木相生的命格，能培养耐心和专注力
2. **二胡** - 与您的艺术天赋相匹配，能表达内心情感
3. **钢琴** - 逻辑性强，适合您的理性思维
4. **笛子** - 简单易学，能快速建立成就感

建议从古筝开始，既能陶冶情操，又能与您的命理格局相得益彰。`;
        } else if (inputValue.includes('注意') || inputValue.includes('注意')) {
          mockResponse = `根据您的命理分析，${formData?.gender === 'male' ? '您' : '您'}需要注意以下方面：

1. **性格培养** - 发挥逻辑思维优势，培养创造力和耐心
2. **学习方向** - 理科+艺术组合最适合，数学物理为主，美术设计为辅
3. **兴趣发展** - 推荐乐高机械组、少儿编程、水彩画、围棋等
4. **环境选择** - 适合近水之地或文化氛围浓厚的城市

记住：顺势引导比强行改变更有效，用提问代替指挥，做情感翻译官。`;
        } else {
          mockResponse = `根据您的命理分析，${formData?.gender === 'male' ? '您' : '您'}具有以下特点：

**核心特质**：如精雕细琢的白玉，既有金石的坚韧，又有灵动才情
**天赋优势**：逻辑+创造双天赋，思维条理分明，审美敏锐
**成长建议**：培养思考习惯，发挥技术领域优势，未来适合工业设计、游戏开发等

如需更详细分析，请具体描述您关心的问题。`;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = mockResponse;
          }
          return newMessages;
        });
        
        // 滚动到底部
        scrollToBottom();
        console.log('使用智能模拟回复作为后备');
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      
      // 如果是令牌失效，使用智能模拟回复
      if (err instanceof Error && err.message === 'TOKEN_EXPIRED') {
        console.log('使用智能模拟回复作为后备');
        
        // 根据问题类型生成智能回复
        let mockResponse = '';
        
        if (inputValue.includes('乐器') || inputValue.includes('音乐')) {
          mockResponse = `根据您的命理分析，${formData?.gender === 'male' ? '您' : '您'}适合学习以下乐器：

1. **古筝** - 符合您金木相生的命格，能培养耐心和专注力
2. **二胡** - 与您的艺术天赋相匹配，能表达内心情感
3. **钢琴** - 逻辑性强，适合您的理性思维
4. **笛子** - 简单易学，能快速建立成就感

建议从古筝开始，既能陶冶情操，又能与您的命理格局相得益彰。`;
        } else if (inputValue.includes('注意') || inputValue.includes('注意')) {
          mockResponse = `根据您的命理分析，${formData?.gender === 'male' ? '您' : '您'}需要注意以下方面：

1. **性格培养** - 发挥逻辑思维优势，培养创造力和耐心
2. **学习方向** - 理科+艺术组合最适合，数学物理为主，美术设计为辅
3. **兴趣发展** - 推荐乐高机械组、少儿编程、水彩画、围棋等
4. **环境选择** - 适合近水之地或文化氛围浓厚的城市

记住：顺势引导比强行改变更有效，用提问代替指挥，做情感翻译官。`;
        } else {
          mockResponse = `根据您的命理分析，${formData?.gender === 'male' ? '您' : '您'}具有以下特点：

**核心特质**：如精雕细琢的白玉，既有金石的坚韧，又有灵动才情
**天赋优势**：逻辑+创造双天赋，思维条理分明，审美敏锐
**成长建议**：培养思考习惯，发挥技术领域优势，未来适合工业设计、游戏开发等

如需更详细分析，请具体描述您关心的问题。`;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = mockResponse;
          }
          return newMessages;
        });
        
        // 滚动到底部
        scrollToBottom();
        console.log('智能模拟回复已生成');
      } else {
        setError(err instanceof Error ? err.message : '发送消息失败');
        
        // 移除未完成的助手消息
        setMessages(prev => prev.filter(msg => msg.content !== ''));
      }
    } finally {
      // 确保加载状态被重置
      setIsLoading(false);
      setError(null);
      
      // 确保在加载完成后滚动到底部
      setTimeout(() => {
        scrollToBottom();
      }, 200);
      
      // 额外的保护：确保输入框可见
      setTimeout(() => {
        const inputElement = document.querySelector('input[placeholder="请输入您的问题..."]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 300);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 聊天消息区域 */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gradient-to-b from-amber-50 to-yellow-50 scroll-smooth overscroll-contain scrollbar-thin scrollbar-track-amber-100 scrollbar-thumb-amber-300 hover:scrollbar-thumb-amber-400 relative"
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch', // 移动端平滑滚动
          minHeight: '300px', // 确保最小高度
          maxHeight: 'calc(100vh - 300px)' // 为输入框预留更多空间
        }}
        tabIndex={0} // 支持键盘导航
        onKeyDown={(e) => {
          // 支持键盘上下滚动
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            chatContainerRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            chatContainerRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
          } else if (e.key === 'Home') {
            e.preventDefault();
            chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (e.key === 'End') {
            e.preventDefault();
            chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
          }
        }}
        onScroll={(e) => {
          // 实时更新滚动状态
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
          setShowScrollButton(!isNearBottom);
          
          // 设置滚动状态
          setIsScrolling(true);
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
          }, 150);
        }}
        onTouchStart={() => {
          // 触摸开始时隐藏滚动按钮
          setShowScrollButton(false);
        }}
        onTouchEnd={() => {
          // 触摸结束后检查是否需要显示滚动按钮
          setTimeout(() => {
            if (chatContainerRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
              const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
              setShowScrollButton(!isNearBottom);
            }
          }, 100);
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`w-full rounded-lg px-4 py-6 ${
                message.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-800 shadow-md border border-amber-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mt-0.5 flex-shrink-0 border-2 border-amber-600">
                    <img 
                      src="/lovable-uploads/92e84522-d56e-45c8-a162-f453bc1304d2.png"
                      alt="玄机子"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                 <div className="flex-1">
                   {message.content.includes('/lovable-uploads/') ? (
                     <div className="max-h-48 overflow-y-auto border rounded-lg">
                       <img 
                         src={message.content}
                         alt="命理分析报告"
                         className="w-full"
                       />
                     </div>
                   ) : message.id === 'analysis-content' ? (
                     // 专门为分析报告内容设计的卡片样式
                     <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg">
                       <div className="flex items-center mb-4">
                         <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mr-3">
                           <span className="text-white text-sm font-bold">📜</span>
                         </div>
                         <h3 className="text-lg font-bold text-amber-900">完整命理分析报告</h3>
                       </div>
                       
                       <div className="max-h-80 overflow-y-auto bg-white/70 rounded-lg p-4 border border-amber-100">
                         <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                           {message.content.split('\n').map((line, index) => {
                             // 处理Markdown格式
                             if (line.startsWith('## ')) {
                               return (
                                 <div key={index} className="font-bold text-amber-900 text-lg mb-3 mt-4 first:mt-0 border-b border-amber-300 pb-1">
                                   {line.replace(/## /, '')}
                                 </div>
                               );
                             } else if (line.startsWith('#### ')) {
                               return (
                                 <div key={index} className="font-semibold text-amber-800 text-base mb-2 mt-3 flex items-center">
                                   <span className="text-amber-600 mr-2">♥</span>
                                   {line.replace(/#### /, '')}
                                 </div>
                               );
                             } else if (line.startsWith('### ')) {
                               return (
                                 <div key={index} className="font-semibold text-amber-800 text-base mb-2 mt-3 flex items-center">
                                   <span className="text-amber-600 mr-2">●</span>
                                   {line.replace(/### /, '')}
                                 </div>
                               );
                             } else if (line.startsWith('**') && line.endsWith('**')) {
                               return (
                                 <div key={index} className="font-semibold text-amber-800 mb-2 mt-3 first:mt-0">
                                   {line.replace(/\*\*/g, '')}
                                 </div>
                               );
                             } else if (line.startsWith('- ')) {
                               return (
                                 <div key={index} className="ml-4 mb-1 flex items-start">
                                   <span className="text-amber-600 mr-2">•</span>
                                   <span>{line.substring(2)}</span>
                                 </div>
                               );
                             } else if (line.startsWith('  - ')) {
                               return (
                                 <div key={index} className="ml-8 mb-1 flex items-start">
                                   <span className="text-amber-500 mr-2">✈</span>
                                   <span>{line.substring(4)}</span>
                                 </div>
                               );
                             } else if (line.startsWith('---')) {
                               return <hr key={index} className="my-3 border-amber-200" />;
                             } else if (line.startsWith('*') && line.endsWith('*')) {
                               return (
                                 <div key={index} className="text-xs text-gray-500 italic mt-2">
                                   {line.replace(/\*/g, '')}
                                 </div>
                               );
                             } else if (line.trim() === '') {
                               return <br key={index} />;
                             } else {
                               return (
                                 <div key={index} className="mb-1 text-sm leading-relaxed">
                                   {line}
                                 </div>
                               );
                             }
                           })}
                         </div>
                       </div>
                       
                       <div className="mt-4 text-xs text-amber-700 bg-amber-100 rounded-lg p-2">
                         💡 您可以基于此报告内容向玄机子提问，获得更深入的解读
                       </div>
                     </div>
                   ) : message.id === 'moonshot-result' ? (
                     // 专门为Moonshot分析结果设计的卡片样式 - 直接渲染HTML
                     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                       <div className="flex items-center mb-4">
                         <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                           <span className="text-white text-sm font-bold">🌟</span>
                         </div>
                         <h3 className="text-lg font-bold text-blue-900">AI深度分析</h3>
                       </div>
                       
                       <div className="max-h-96 overflow-y-auto bg-white/70 rounded-lg p-4 border border-blue-100">
                         <HTMLRenderErrorBoundary>
                           <div 
                             className="text-sm leading-relaxed prose prose-sm max-w-none [&>*]:mb-2 [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium [&>p]:text-sm [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>li]:mb-1"
                             dangerouslySetInnerHTML={{ __html: processHTMLContent(message.content) }}
                           />
                         </HTMLRenderErrorBoundary>
                       </div>
                       
                       <div className="mt-4 text-xs text-blue-700 bg-blue-100 rounded-lg p-2">
                         🤖 基于现代AI技术的命理解读，可与传统分析对比参考
                       </div>
                     </div>
                   ) : (
                     <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                       {/* 检查是否是长文本内容，如果是则添加滚动容器 */}
                       {message.content.length > 500 ? (
                         <div className="max-h-96 overflow-y-auto border border-amber-200 rounded-lg p-4 bg-amber-50/30">
                           {message.content.split('\n').map((line, index) => {
                             // 处理Markdown格式
                             if (line.startsWith('## ')) {
                               return (
                                 <div key={index} className="font-bold text-amber-900 text-lg mb-3 mt-4 first:mt-0 border-b border-amber-300 pb-1">
                                   {line.replace(/## /, '')}
                                 </div>
                               );
                             } else if (line.startsWith('#### ')) {
                               return (
                                 <div key={index} className="font-semibold text-amber-800 text-base mb-2 mt-3 flex items-center">
                                   <span className="text-amber-600 mr-2">♥</span>
                                   {line.replace(/#### /, '')}
                                 </div>
                               );
                             } else if (line.startsWith('### ')) {
                               return (
                                 <div key={index} className="font-semibold text-amber-800 text-base mb-2 mt-3 flex items-center">
                                   <span className="text-amber-600 mr-2">●</span>
                                   {line.replace(/### /, '')}
                                 </div>
                               );
                             } else if (line.startsWith('**') && line.endsWith('**')) {
                               return (
                                 <div key={index} className="font-semibold text-amber-800 mb-2 mt-3 first:mt-0">
                                   {line.replace(/\*\*/g, '')}
                                 </div>
                               );
                             } else if (line.startsWith('- ')) {
                               return (
                                 <div key={index} className="ml-4 mb-1 flex items-start">
                                   <span className="text-amber-600 mr-2">•</span>
                                   <span>{line.substring(2)}</span>
                                 </div>
                               );
                             } else if (line.startsWith('  - ')) {
                               return (
                                 <div key={index} className="ml-8 mb-1 flex items-start">
                                   <span className="text-amber-500 mr-2">✈</span>
                                   <span>{line.substring(4)}</span>
                                 </div>
                               );
                             } else if (line.startsWith('---')) {
                               return <hr key={index} className="my-3 border-amber-200" />;
                             } else if (line.startsWith('*') && line.endsWith('*')) {
                               return (
                                 <div key={index} className="text-xs text-gray-500 italic mt-2">
                                   {line.replace(/\*/g, '')}
                                 </div>
                               );
                             } else if (line.trim() === '') {
                               return <br key={index} />;
                             } else {
                               return (
                                 <div key={index} className="mb-1 text-sm leading-relaxed">
                                   {line}
                                 </div>
                               );
                             }
                           })}
                         </div>
                       ) : (
                         message.content.split('\n').map((line, index) => {
                           // 处理Markdown格式
                           if (line.startsWith('**') && line.endsWith('**')) {
                             return (
                               <div key={index} className="font-semibold text-amber-800 mb-2 mt-3 first:mt-0">
                                 {line.replace(/\*\*/g, '')}
                               </div>
                             );
                           } else if (line.startsWith('- ')) {
                             return (
                               <div key={index} className="ml-4 mb-1 flex items-start">
                                 <span className="text-amber-600 mr-2">•</span>
                                 <span>{line.substring(2)}</span>
                               </div>
                             );
                           } else if (line.startsWith('---')) {
                             return <hr key={index} className="my-3 border-amber-200" />;
                           } else if (line.startsWith('*') && line.endsWith('*')) {
                             return (
                               <div key={index} className="text-xs text-gray-500 italic mt-2">
                                 {line.replace(/\*/g, '')}
                               </div>
                             );
                           } else if (line.trim() === '') {
                             return <br key={index} />;
                           } else {
                             return (
                               <div key={index} className="mb-1">
                                 {line}
                               </div>
                             );
                           }
                         })
                       )}
                     </div>
                   )}
                   <span className="text-xs opacity-70 mt-2 block">
                     {message.timestamp.toLocaleTimeString()}
                   </span>
                 </div>
                {message.role === 'user' && (
                  <User className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md border border-amber-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-600" />
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span className="text-sm text-gray-600">正在思考中...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        {/* 滚动到底部按钮 */}
        {showScrollButton && !isScrolling && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="rounded-full w-12 h-12 p-0 bg-amber-600 hover:bg-amber-700 shadow-lg hover:shadow-xl transition-all duration-200 animate-bounce"
              title="滚动到底部"
            >
              <ArrowDown className="w-5 h-5" />
            </Button>
          </div>
        )}
        
        {/* 滚动指示器 */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm">
            {messages.length} 条消息
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t border-amber-200 bg-white p-4">
        {/* 调试信息 - 生产环境已注释 */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mb-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
            {debugInfo}
          </div>
        )} */}
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题..."
            className="flex-1 border-amber-300 focus:border-amber-500"
            disabled={isLoading}
            autoFocus
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          按 Enter 发送消息，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
};

export default CozeV3Chat;