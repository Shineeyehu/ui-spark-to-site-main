# Vercel 环境变量配置清单

## 🚨 解决HTML渲染问题的关键配置

### 问题：Vercel部署版本只显示纯文本，不显示HTML格式
### 原因：缺少Moonshot API环境变量
### 解决：添加以下环境变量到Vercel Dashboard

---

## 📋 环境变量清单

**在Vercel Dashboard → Settings → Environment Variables 中添加：**

### Supabase 配置
```
VITE_SUPABASE_PROJECT_ID
oulkicwnajomkgmffsmc

VITE_SUPABASE_PUBLISHABLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bGtpY3duYWpvbWtnbWZmc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTAxMzksImV4cCI6MjA3Mjg4NjEzOX0.P-yA2o7a3rYOlo0Gyndzm1F1_710770XJ2dxq5BPoSY

VITE_SUPABASE_URL
https://oulkicwnajomkgmffsmc.supabase.co
```

### 扣子 OAuth 配置
```
VITE_COZE_USE_JWT
false

VITE_COZE_CLIENT_ID
08461612714393126791235695948705.app.coze

VITE_COZE_CLIENT_SECRET
6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA

VITE_COZE_REDIRECT_URI
https://ui-spark-to-site-main.vercel.app/oauth/callback

VITE_COZE_BOT_ID
7546564367413379135

VITE_COZE_USER_ID
user_123

VITE_COZE_NICKNAME
用户
```

### 扣子 API Token 配置
```
VITE_COZE_API_KEY
pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS

VITE_COZE_API_TOKEN
pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS
```

### 🔥 关键：Moonshot API 配置（解决HTML渲染问题）
```
VITE_MOONSHOT_API_KEY
sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e

VITE_MOONSHOT_MODEL
kimi-k2-0905-preview

VITE_MOONSHOT_BASE_URL
https://api.moonshot.cn/v1
```

### 环境标识
```
VITE_NODE_ENV
production
```

---

## ⚡ 快速操作步骤

1. **登录Vercel** → [vercel.com](https://vercel.com)
2. **选择项目** → `ui-spark-to-site-main`
3. **进入设置** → Settings → Environment Variables
4. **添加变量** → 逐一添加上述变量（Environment选择：Production + Preview + Development）
5. **重新部署** → Deployments → Redeploy
6. **测试验证** → 访问网站生成解读报告卡，确认HTML格式正确显示

---

## ✅ 验证成功标志

**修复前（问题状态）：**
```
正在生成中...
【玄机子批语】
乾造：乙酉　癸酉　壬寅　辛酉
胎元：甲子　命宫：戊子　身宫：丙子
...
```

**修复后（正常状态）：**
```html
正在生成中...
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>知识卡 - 20岁青年命理与未来指引</title>
...
```

完成配置后，Vercel版本应该能够正确渲染HTML格式的解读报告卡！