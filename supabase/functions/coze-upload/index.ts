import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // 获取扣子配置
    const cozeToken = Deno.env.get('COZE_API_TOKEN');
    
    if (!cozeToken) {
      console.error('Missing Coze API token');
      return new Response(
        JSON.stringify({ 
          error: '扣子配置不完整',
          details: 'API Token 未配置'
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 获取上传的文件
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: '未找到文件' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('开始上传文件:', file.name, '大小:', file.size);

    // 创建新的FormData对象用于转发请求
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    // 调用扣子文件上传API
    const response = await fetch('https://api.coze.cn/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeToken}`,
      },
      body: uploadFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('扣子文件上传失败:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: '文件上传失败',
          details: `${response.status} ${errorText}`
        }), 
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await response.json();
    console.log('文件上传响应:', result);

    if (result.code !== 0) {
      return new Response(
        JSON.stringify({ 
          error: '文件上传失败',
          details: result.msg || '未知错误'
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 返回成功结果
    return new Response(
      JSON.stringify({ 
        success: true,
        fileId: result.data.id,
        data: result.data
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('文件上传异常:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务器内部错误',
        details: error.message
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});