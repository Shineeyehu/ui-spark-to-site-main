# Vercel 环境变量检查清单

## ✅ 必需配置（必须设置）

### Moonshot API
- [ ] `VITE_MOONSHOT_API_KEY` = `sk-your-moonshot-api-key-here`

### Coze API  
- [ ] `VITE_COZE_API_TOKEN` = `your-coze-access-token-here`

## 🔧 可选配置（有默认值）

### Moonshot API
- [ ] `VITE_MOONSHOT_MODEL` = `kimi-k2-0905-preview`
- [ ] `VITE_MOONSHOT_BASE_URL` = `https://api.moonshot.cn/v1`

### Coze API
- [ ] `VITE_COZE_BOT_ID` = `7546564367413379135`
- [ ] `VITE_COZE_USE_JWT` = `false`
- [ ] `VITE_COZE_USER_ID` = `user_123`

### OAuth（可选）
- [ ] `VITE_COZE_CLIENT_ID` = `08461612714393126791235695948705.app.coze`
- [ ] `VITE_COZE_CLIENT_SECRET` = `6JdTe15fTYT2a6FLcZeZWCFbj0ashyGVAA4NiIxz4VrQBxFA`
- [ ] `VITE_COZE_REDIRECT_URI` = `https://your-domain.vercel.app/oauth/callback`

## 📝 配置步骤

1. **登录 Vercel** → 选择项目 → Settings → Environment Variables
2. **添加变量** → 设置 Name 和 Value
3. **选择环境** → 勾选 Production, Preview, Development
4. **保存** → 重新部署

## 🚨 当前错误

```
Moonshot API Key 未配置或为空
```

**解决方案**：设置 `VITE_MOONSHOT_API_KEY` 环境变量