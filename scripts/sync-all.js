#!/usr/bin/env node

/**
 * 多源 API 同步工具
 * 从多个外部 API 端点同步数据
 * 
 * 使用：node scripts/sync-all.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CONFIG_FILE = path.join(__dirname, '..', 'api-sync-config.json');

// 加载配置
function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

// HTTP 请求
function fetch(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    req.setTimeout(timeout);
  });
}

// 同步单个数据源
async function syncSource(source, settings) {
  console.log(`\n📡 同步：${source.name}`);
  console.log(`   URL: ${source.url}`);
  
  try {
    const response = await fetch(source.url, settings.timeout);
    
    if (response.status !== 200) {
      throw new Error(`状态码：${response.status}`);
    }
    
    const data = response.data;
    const count = Array.isArray(data) ? data.length : 1;
    
    // 保存文件
    const outputPath = path.join(__dirname, '..', source.output);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`   ✅ ${count} 条记录 → ${source.output}`);
    
    return { name: source.name, count, status: 'success' };
  } catch (error) {
    console.log(`   ❌ 失败：${error.message}`);
    return { name: source.name, count: 0, status: 'failed', error: error.message };
  }
}

// 主函数
async function main() {
  console.log('🚀 多源 API 数据同步\n');
  console.log('=' .repeat(50));
  
  const config = loadConfig();
  const enabledSources = config.sources.filter(s => s.enabled);
  
  console.log(`📋 数据源：${enabledSources.length} 个`);
  console.log(`⚙️  超时：${config.settings.timeout}ms`);
  console.log(`🔄 重试：${config.settings.retries}次`);
  console.log('=' .repeat(50));
  
  const results = [];
  const startTime = Date.now();
  
  // 并行或串行同步
  if (config.settings.parallel) {
    const promises = enabledSources.map(s => syncSource(s, config.settings));
    const completed = await Promise.allSettled(promises);
    completed.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({ 
          name: enabledSources[i].name, 
          count: 0, 
          status: 'failed', 
          error: result.reason.message 
        });
      }
    });
  } else {
    for (const source of enabledSources) {
      const result = await syncSource(source, config.settings);
      results.push(result);
    }
  }
  
  // 汇总报告
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const success = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const total = results.reduce((sum, r) => sum + r.count, 0);
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 同步报告');
  console.log('=' .repeat(50));
  console.log(`⏱️  耗时：${elapsed}秒`);
  console.log(`✅ 成功：${success} 个`);
  console.log(`❌ 失败：${failed} 个`);
  console.log(`📦 总记录：${total} 条`);
  console.log('=' .repeat(50));
  
  if (failed > 0) {
    console.log('\n⚠️  失败详情:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n');
}

main().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
