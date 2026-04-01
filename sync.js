#!/usr/bin/env node

/**
 * 最简单的 API 同步脚本
 * 
 * 用法:
 *   node sync.js
 *   node sync.js https://api.example.com/data
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

// 配置 - 修改这里使用你的 API
const CONFIG = {
  url: process.argv[2] || 'https://jsonplaceholder.typicode.com/posts',
  output: 'data/synced.json'
};

console.log('🔄 同步 API 数据...\n');
console.log(`URL: ${CONFIG.url}`);
console.log(`输出：${CONFIG.output}\n`);

const lib = CONFIG.url.startsWith('https') ? https : http;

lib.get(CONFIG.url, (res) => {
  let data = '';
  
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const count = Array.isArray(json) ? json.length : 1;
      
      // 确保目录存在
      if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
      }
      
      // 保存文件
      fs.writeFileSync(CONFIG.output, JSON.stringify(json, null, 2));
      
      console.log(`✅ 成功！`);
      console.log(`📦 记录数：${count}`);
      console.log(`💾 已保存：${CONFIG.output}`);
      console.log(`📊 大小：${fs.statSync(CONFIG.output).size} 字节\n`);
      
      // 显示预览
      if (Array.isArray(json) && json.length > 0) {
        console.log('📋 预览:');
        console.log(JSON.stringify(json[0], null, 2));
      }
      
    } catch (e) {
      console.error('❌ JSON 解析失败:', e.message);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('❌ 请求失败:', err.message);
  process.exit(1);
});
