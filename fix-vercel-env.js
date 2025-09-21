#!/usr/bin/env node

/**
 * Vercel 环境变量快速修复脚本
 * 用于解决 Moonshot API Key 未配置的问题
 */

console.log('🔧 Vercel 环境变量快速修复');
console.log('================================');
console.log('');

console.log('🚨 当前错误：');
console.log('Error: Moonshot API Key 未配置。请在环境变量中设置 VITE_MOONSHOT_API_KEY');
console.log('');

console.log('📋 立即解决步骤：');
console.log('');

console.log('1. 登录 Vercel 控制台');
console.log('   访问：https://vercel.com/dashboard');
console.log('');

console.log('2. 找到您的项目');
console.log('   项目名：ui-spark-to-site-main');
console.log('');

console.log('3. 进入环境变量设置');
console.log('   点击：Settings → Environment Variables');
console.log('');

console.log('4. 添加以下环境变量：');
console.log('');

console.log('🔑 必需变量：');
console.log('   Name: VITE_MOONSHOT_API_KEY');
console.log('   Value: sk-MA54Wq2TSJqIPd7fOQSRpESX05JgH0nkIQ5OdAaQAb8spr7e');
console.log('   Environment: ✅ Production ✅ Preview ✅ Development');
console.log('');

console.log('🔧 推荐变量：');
console.log('   Name: VITE_MOONSHOT_MODEL');
console.log('   Value: kimi-k2-0905-preview');
console.log('   Environment: ✅ Production ✅ Preview ✅ Development');
console.log('');

console.log('   Name: VITE_MOONSHOT_BASE_URL');
console.log('   Value: https://api.moonshot.cn/v1');
console.log('   Environment: ✅ Production ✅ Preview ✅ Development');
console.log('');

console.log('   Name: VITE_COZE_API_TOKEN');
console.log('   Value: pat_WJDhe5pLrsGYOyNuzTDJIQMuf3lSv5R6R0vjbb9qA448GceGAzzcRJCqz1cEzMlS');
console.log('   Environment: ✅ Production ✅ Preview ✅ Development');
console.log('');

console.log('   Name: VITE_COZE_BOT_ID');
console.log('   Value: 7546564367413379135');
console.log('   Environment: ✅ Production ✅ Preview ✅ Development');
console.log('');

console.log('5. 重新部署项目');
console.log('   点击：Deployments → 最新部署的 "..." → Redeploy');
console.log('');

console.log('⚠️  重要提醒：');
console.log('- 确保所有变量都勾选了所有环境');
console.log('- 变量名必须完全正确（区分大小写）');
console.log('- 变量值不能有多余的空格');
console.log('- 设置完成后必须重新部署');
console.log('');

console.log('🧪 验证步骤：');
console.log('1. 重新部署完成后，访问您的应用');
console.log('2. 打开浏览器开发者工具');
console.log('3. 查看 Console 中的调试信息');
console.log('4. 确认不再显示 API Key 错误');
console.log('');

console.log('📞 如果仍有问题：');
console.log('1. 检查 Vercel 部署日志');
console.log('2. 确认环境变量是否正确设置');
console.log('3. 检查 API 密钥是否有效');
console.log('4. 联系技术支持');
console.log('');

console.log('✅ 修复完成后，您的应用将正常运行！');
