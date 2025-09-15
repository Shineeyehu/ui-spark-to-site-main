-- 创建扣子配置表用于存储非敏感配置信息
CREATE TABLE IF NOT EXISTS public.coze_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT NULL,
  nickname TEXT DEFAULT '用户',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.coze_configurations ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own coze configurations" 
ON public.coze_configurations 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own coze configurations" 
ON public.coze_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own coze configurations" 
ON public.coze_configurations 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);