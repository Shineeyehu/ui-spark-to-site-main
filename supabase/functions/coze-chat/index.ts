import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BirthInfo {
  gender: string;
  calendar: string;
  birthDate: string;
  birthTime: string;
  isLeapMonth?: string;
  birthPlace: string;
  birthEnvironment: string;
  palmReading?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, birthInfo, conversationId } = await req.json();
    
    // 获取扣子配置
    const cozeBotId = Deno.env.get('COZE_BOT_ID');
    const cozeToken = Deno.env.get('COZE_API_TOKEN');
    
    if (!cozeBotId || !cozeToken) {
      console.error('Missing Coze configuration:', { cozeBotId: !!cozeBotId, cozeToken: !!cozeToken });
      return new Response(
        JSON.stringify({ 
          error: '扣子配置不完整',
          details: 'Bot ID 或 Token 未配置'
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let finalMessage = message;

    // 如果有出生信息，构建分析提示词
    if (birthInfo) {
      finalMessage = buildAnalysisPrompt(birthInfo);
    }

    console.log('Sending message to Coze API:', {
      botId: cozeBotId,
      messageLength: finalMessage.length,
      hasConversationId: !!conversationId
    });

    // 调用扣子 API (使用 v3 版本)
    const cozeResponse = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeToken}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Host': 'api.coze.cn',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        bot_id: cozeBotId,
        user_id: 'user_' + Date.now(),
        stream: false,
        additional_messages: [
          {
            content: finalMessage,
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

    if (!cozeResponse.ok) {
      console.error('Coze API error:', {
        status: cozeResponse.status,
        statusText: cozeResponse.statusText
      });
      throw new Error(`扣子 API 调用失败: ${cozeResponse.status} ${cozeResponse.statusText}`);
    }

    const cozeData = await cozeResponse.json();
    console.log('Coze API response:', cozeData);

    return new Response(JSON.stringify(cozeData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in coze-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务器内部错误',
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function buildAnalysisPrompt(birthInfo: BirthInfo): string {
  const genderText = birthInfo.gender === 'male' ? '男' : '女';
  const calendarText = birthInfo.calendar === 'solar' ? '公历' : '农历';
  const leapMonthText = birthInfo.isLeapMonth === 'true' ? '是' : '否';

  return `请基于以下出生信息进行命理分析：

基本信息：
- 性别：${genderText}
- 历法：${calendarText}
- 出生日期：${birthInfo.birthDate}
- 出生时间：${birthInfo.birthTime}
- 是否闰月：${leapMonthText}
- 出生地：${birthInfo.birthPlace}
- 出生环境：${birthInfo.birthEnvironment}
${birthInfo.palmReading ? `- 手相信息：${birthInfo.palmReading}` : ''}

请从以下角度进行分析：
1. 四柱八字分析
2. 性格特质与天赋潜能
3. 成长关键节点
4. 学业方向建议
5. 兴趣培养指导
6. 未来发展方向

请用专业但易懂的语言，结合传统命理学和现代教育理念，给出具体的建议和指导。`;
}