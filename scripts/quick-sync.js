#!/usr/bin/env node

/**
 * Quick API Sync - 快速同步外部 API 数据
 * 
 * 使用方法:
 *   node scripts/quick-sync.js [API_URL] [ENDPOINT]
 * 
 * 示例:
 *   node scripts/quick-sync.js https://api.example.com /data
 *   node scripts/quick-sync.js  # 使用默认配置
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 默认配置
const DEFAULTS = {
  apiUrl: 'https://jsonplaceholder.typicode.com',
  endpoint: '/posts',
  outputFile: 'data/api-data.json'
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    apiUrl: args[0] || DEFAULTS.apiUrl,
    endpoint: args[1] || DEFAULTS.endpoint,
    output: args[2] || DEFAULTS.outputFile
  };
}

// HTTP 请求
function fetch(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    
    console.log(`📡 请求：${url}`);
    
    lib.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    }).on('error', reject);
  });
}

// 主函数
async function main() {
  const config = parseArgs();
  const url = `${config.apiUrl}${config.endpoint}`;
  
  console.log('🚀 开始同步外部 API 数据\n');
  console.log(`📍 API: ${config.apiUrl}`);
  console.log(`📍 端点：${config.endpoint}`);
  console.log(`📍 输出：${config.output}\n`);
  
  try {
    // 发送请求
    const response = await fetch(url);
    
    if (response.status !== 200) {
      throw new Error(`API 返回状态码：${response.status}`);
    }
    
    const data = response.data;
    const count = Array.isArray(data) ? data.length : 1;
    
    console.log(`✅ 获取成功：${count} 条记录`);
    
    // 保存数据
    const outputPath = path.join(__dirname, '..', config.output);
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`💾 数据已保存：${outputPath}`);
    console.log(`📊 文件大小：${fs.statSync(outputPath).size} 字节`);
    
    // 显示前几条数据预览
    if (Array.isArray(data) && data.length > 0) {
      console.log('\n📋 数据预览 (前 3 条):');
      data.slice(0, 3).forEach((item, i) => {
        console.log(`\n${i + 1}. ${JSON.stringify(item).slice(0, 100)}...`);
      });
    }
    
    console.log('\n✅ 同步完成!\n');
    
  } catch (error) {
    console.error(`\n❌ 同步失败：${error.message}\n`);
    process.exit(1);
  }
}

main();
