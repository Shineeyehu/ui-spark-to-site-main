/**
 * 部署前HTML渲染功能测试脚本
 * 验证HTML报告卡片在生产环境中的渲染效果
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const TEST_CONFIG = {
  distPath: './dist',
  indexHtml: './dist/index.html',
  assetsPath: './dist/assets',
  requiredFiles: [
    'index.html',
    'assets/index--XGdCRo9.js',
    'assets/index-WKMa5W1W.css'
  ],
  htmlChecks: [
    '扣子 Web SDK',
    'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk',
    'id="root"',
    'assets/index--XGdCRo9.js',
    'assets/index-WKMa5W1W.css'
  ]
};

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`
};

// 测试结果统计
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// 日志函数
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  switch (type) {
    case 'success':
      console.log(`[${timestamp}] ${colors.green('✓')} ${message}`);
      testResults.passed++;
      break;
    case 'error':
      console.log(`[${timestamp}] ${colors.red('✗')} ${message}`);
      testResults.failed++;
      break;
    case 'warning':
      console.log(`[${timestamp}] ${colors.yellow('⚠')} ${message}`);
      testResults.warnings++;
      break;
    default:
      console.log(`[${timestamp}] ${colors.blue('ℹ')} ${message}`);
  }
}

// 检查文件是否存在
function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// 检查构建文件
function checkBuildFiles() {
  log('检查构建文件...');
  
  if (!checkFileExists(TEST_CONFIG.distPath)) {
    log('dist目录不存在，请先运行 npm run build', 'error');
    return false;
  }
  
  let allFilesExist = true;
  
  TEST_CONFIG.requiredFiles.forEach(file => {
    const filePath = path.join(TEST_CONFIG.distPath, file.replace('assets/', '').replace('index.html', ''));
    const fullPath = file.startsWith('assets/') ? 
      path.join(TEST_CONFIG.distPath, file) : 
      path.join(TEST_CONFIG.distPath, file);
    
    if (checkFileExists(fullPath)) {
      log(`文件存在: ${file}`, 'success');
    } else {
      log(`文件缺失: ${file}`, 'error');
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// 检查HTML内容
function checkHtmlContent() {
  log('检查HTML内容...');
  
  if (!checkFileExists(TEST_CONFIG.indexHtml)) {
    log('index.html文件不存在', 'error');
    return false;
  }
  
  try {
    const htmlContent = fs.readFileSync(TEST_CONFIG.indexHtml, 'utf8');
    let allChecksPass = true;
    
    TEST_CONFIG.htmlChecks.forEach(check => {
      if (htmlContent.includes(check)) {
        log(`HTML检查通过: ${check}`, 'success');
      } else {
        log(`HTML检查失败: ${check}`, 'error');
        allChecksPass = false;
      }
    });
    
    // 检查扣子SDK是否正确引入
    if (htmlContent.includes('https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk')) {
      log('扣子Web SDK正确引入', 'success');
    } else {
      log('扣子Web SDK未正确引入', 'error');
      allChecksPass = false;
    }
    
    return allChecksPass;
  } catch (error) {
    log(`读取HTML文件失败: ${error.message}`, 'error');
    return false;
  }
}

// 检查CSS文件大小
function checkAssetSizes() {
  log('检查资源文件大小...');
  
  const cssFiles = fs.readdirSync(TEST_CONFIG.assetsPath)
    .filter(file => file.endsWith('.css'));
  
  const jsFiles = fs.readdirSync(TEST_CONFIG.assetsPath)
    .filter(file => file.endsWith('.js'));
  
  cssFiles.forEach(file => {
    const filePath = path.join(TEST_CONFIG.assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    if (stats.size > 0) {
      log(`CSS文件 ${file}: ${sizeKB} KB`, 'success');
    } else {
      log(`CSS文件 ${file} 为空`, 'warning');
    }
  });
  
  jsFiles.forEach(file => {
    const filePath = path.join(TEST_CONFIG.assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    if (stats.size > 0) {
      log(`JS文件 ${file}: ${sizeMB} MB`, 'success');
      if (stats.size > 1024 * 1024) { // 大于1MB
        log(`JS文件 ${file} 较大，建议考虑代码分割`, 'warning');
      }
    } else {
      log(`JS文件 ${file} 为空`, 'warning');
    }
  });
}

// 主测试函数
function runTests() {
  console.log(colors.blue('\n=== HTML渲染功能部署前测试 ===\n'));
  
  const buildFilesOk = checkBuildFiles();
  const htmlContentOk = checkHtmlContent();
  checkAssetSizes();
  
  console.log(colors.blue('\n=== 测试结果汇总 ==='));
  console.log(`${colors.green('通过:')} ${testResults.passed}`);
  console.log(`${colors.red('失败:')} ${testResults.failed}`);
  console.log(`${colors.yellow('警告:')} ${testResults.warnings}`);
  
  if (buildFilesOk && htmlContentOk && testResults.failed === 0) {
    console.log(colors.green('\n✅ 所有测试通过！HTML渲染功能准备就绪，可以部署到Vercel。'));
    console.log(colors.blue('\n📋 部署检查清单:'));
    console.log('  ✓ 构建文件完整');
    console.log('  ✓ HTML结构正确');
    console.log('  ✓ 扣子SDK正确引入');
    console.log('  ✓ 资源文件存在');
    console.log(colors.yellow('\n⚠️  请确保在Vercel中正确配置环境变量！'));
    process.exit(0);
  } else {
    console.log(colors.red('\n❌ 测试失败！请修复问题后重新测试。'));
    process.exit(1);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith('test-html-rendering.js')) {
  runTests();
}

export { runTests, checkBuildFiles, checkHtmlContent, checkAssetSizes };