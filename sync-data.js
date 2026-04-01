#!/usr/bin/env node
/**
 * FunWebGames 数据同步脚本
 * 用于从外部 API 同步游戏数据
 * 
 * 支持的后端:
 * - JSONBin.io (免费云存储)
 * - 自定义 REST API
 * - 本地文件 (离线模式)
 * 
 * 用法:
 *   node sync-data.js fetch     - 从云端获取数据
 *   node sync-data.js push      - 推送本地数据到云端
 *   node sync-data.js sync      - 双向同步
 *   node sync-data.js status    - 查看同步状态
 *   node sync-data.js sample    - 添加示例数据
 * 
 * 环境变量:
 *   API_BASE_URL  - API 基础 URL
 *   API_KEY       - API 认证密钥
 *   API_BIN_ID    - JSONBin ID (如使用 JSONBin.io)
 *   SYNC_MODE     - 同步模式：jsonbin | rest | local
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 配置管理
const CONFIG = {
  SYNC_MODE: process.env.SYNC_MODE || 'local',
  BASE_URL: process.env.API_BASE_URL || '',
  API_KEY: process.env.API_KEY || '',
  BIN_ID: process.env.API_BIN_ID || '',
  LOCAL_DATA_FILE: path.join(__dirname, 'data', 'local-scores.json'),
  TIMEOUT: 10000
};

// 自动构建 API URL
if (CONFIG.SYNC_MODE === 'jsonbin' && CONFIG.BIN_ID) {
  CONFIG.API_URL = `https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}`;
} else if (CONFIG.SYNC_MODE === 'rest' && CONFIG.BASE_URL) {
  CONFIG.API_URL = `${CONFIG.BASE_URL}/scores`;
} else {
  CONFIG.SYNC_MODE = 'local';
  CONFIG.API_URL = null;
}

// 确保数据目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 加载本地数据
function loadLocalData() {
  try {
    if (fs.existsSync(CONFIG.LOCAL_DATA_FILE)) {
      const data = fs.readFileSync(CONFIG.LOCAL_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('⚠️  无法加载本地数据:', e.message);
  }
  return { scores: [], lastUpdate: Date.now(), totalUploads: 0, version: 1 };
}

// 保存本地数据
function saveLocalData(data) {
  try {
    data.lastUpdate = Date.now();
    fs.writeFileSync(CONFIG.LOCAL_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ 本地数据已保存:', CONFIG.LOCAL_DATA_FILE);
  } catch (e) {
    console.error('❌ 保存本地数据失败:', e.message);
  }
}

// HTTP 请求封装
function httpRequest(url, method, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + (method === 'GET' ? '/latest' : ''),
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FunWebGames-Sync/1.0'
      },
      timeout: CONFIG.TIMEOUT
    };
    
    if (CONFIG.API_KEY) {
      options.headers['Authorization'] = `Bearer ${CONFIG.API_KEY}`;
      options.headers['X-Master-Key'] = CONFIG.API_KEY;
    }
    
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ raw: data, statusCode: res.statusCode });
          }
        } else {
          reject(new Error(`API 错误：${res.statusCode} ${res.statusMessage || ''}`));
        }
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// 从云端获取数据
async function fetchFromCloud() {
  if (!CONFIG.API_URL) {
    console.log('⚠️  未配置 API，使用本地数据');
    return loadLocalData();
  }
  
  console.log('📥 从云端获取数据...');
  console.log('   API:', CONFIG.API_URL);
  
  try {
    const result = await httpRequest(CONFIG.API_URL, 'GET');
    const cloudData = result.record || result.data || result;
    
    // 标准化数据结构
    const normalized = {
      scores: cloudData.scores || [],
      lastUpdate: cloudData.lastUpdate || Date.now(),
      totalUploads: cloudData.totalUploads || 0,
      version: 1
    };
    
    console.log('✅ 获取成功!');
    console.log('   记录数:', normalized.scores.length);
    console.log('   最后更新:', new Date(normalized.lastUpdate).toISOString());
    
    saveLocalData(normalized);
    return normalized;
  } catch (e) {
    console.error('❌ 获取失败:', e.message);
    console.log('   使用本地缓存数据');
    return loadLocalData();
  }
}

// 推送数据到云端
async function pushToCloud(data = null) {
  if (!CONFIG.API_URL) {
    console.log('⚠️  未配置 API，无法推送');
    return false;
  }
  
  const localData = data || loadLocalData();
  
  if (localData.scores.length === 0) {
    console.log('⚠️  本地没有数据可推送');
    return false;
  }
  
  console.log('📤 推送数据到云端...');
  console.log('   API:', CONFIG.API_URL);
  console.log('   记录数:', localData.scores.length);
  
  try {
    const uploadData = {
      scores: localData.scores,
      lastUpdate: Date.now(),
      totalUploads: (localData.totalUploads || 0) + 1,
      version: 1
    };
    
    await httpRequest(CONFIG.API_URL, 'PUT', uploadData);
    
    console.log('✅ 推送成功!');
    console.log('   总上传次数:', uploadData.totalUploads);
    
    saveLocalData(uploadData);
    return true;
  } catch (e) {
    console.error('❌ 推送失败:', e.message);
    return false;
  }
}

// 添加示例数据
function addSampleData() {
  console.log('📝 添加示例数据...');
  const localData = loadLocalData();
  
  const games = [
    'color-match', 'bubble-pop', 'maze-runner', 'star-catcher',
    'animal-puzzle', 'letter-explorer', 'shape-builder', 'music-maker'
  ];
  
  const metrics = [
    { name: 'score', type: 'high' },
    { name: 'moves', type: 'low' },
    { name: 'time', type: 'low' },
    { name: 'stars', type: 'high' }
  ];
  
  const players = ['Player1', 'Player2', 'Player3', '小明', '小红'];
  
  // 生成 50 条示例数据
  for (let i = 0; i < 50; i++) {
    const game = games[Math.floor(Math.random() * games.length)];
    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    const player = players[Math.floor(Math.random() * players.length)];
    
    let value;
    if (metric.name === 'score' || metric.name === 'stars') {
      value = Math.floor(Math.random() * 500) + 50;
    } else if (metric.name === 'moves') {
      value = Math.floor(Math.random() * 50) + 10;
    } else {
      value = Math.floor(Math.random() * 300) + 30;
    }
    
    localData.scores.push({
      game,
      metric: metric.name,
      metricType: metric.type,
      value,
      playerName: player,
      timestamp: Date.now() - Math.floor(Math.random() * 86400000 * 7),
      deviceId: 'device-' + Math.floor(Math.random() * 10)
    });
  }
  
  // 去重：保留每个玩家每个游戏的最佳成绩
  const grouped = {};
  localData.scores.forEach(s => {
    const key = `${s.game}-${s.metric}-${s.playerName}`;
    if (!grouped[key]) {
      grouped[key] = s;
    } else {
      const isBetter = s.metricType === 'low' ? s.value < grouped[key].value : s.value > grouped[key].value;
      if (isBetter) {
        grouped[key] = s;
      }
    }
  });
  
  localData.scores = Object.values(grouped);
  localData.scores.sort((a, b) => b.timestamp - a.timestamp);
  
  saveLocalData(localData);
  
  console.log('✅ 已生成', localData.scores.length, '条示例数据');
  return localData;
}

// 显示同步状态
async function showStatus() {
  console.log('📊 同步状态\n');
  console.log('同步模式:', CONFIG.SYNC_MODE);
  if (CONFIG.API_URL) {
    console.log('API 地址:', CONFIG.API_URL);
  }
  console.log('─────────────────────────────────────\n');
  
  // 本地数据
  const localData = loadLocalData();
  console.log('📁 本地数据:');
  console.log('   记录数:', localData.scores.length);
  console.log('   文件:', CONFIG.LOCAL_DATA_FILE);
  console.log('   最后更新:', localData.lastUpdate ? new Date(localData.lastUpdate).toISOString() : 'N/A');
  
  // 游戏统计
  if (localData.scores.length > 0) {
    const games = {};
    const players = new Set();
    
    localData.scores.forEach(s => {
      if (!games[s.game]) games[s.game] = 0;
      games[s.game]++;
      players.add(s.playerName);
    });
    
    console.log('\n🎮 游戏分布:');
    Object.entries(games).forEach(([game, count]) => {
      console.log('   -', game + ':', count, '条');
    });
    
    console.log('\n👤 玩家数:', players.size);
  }
  
  // 云端数据 (如果配置了 API)
  if (CONFIG.API_URL) {
    console.log('\n☁️  云端数据:');
    try {
      const result = await httpRequest(CONFIG.API_URL, 'GET');
      const cloudData = result.record || result.data || result;
      console.log('   记录数:', (cloudData.scores || []).length);
      console.log('   最后更新:', cloudData.lastUpdate ? new Date(cloudData.lastUpdate).toISOString() : 'N/A');
    } catch (e) {
      console.log('   无法获取:', e.message);
    }
  }
}

// 双向同步
async function sync() {
  console.log('🔄 执行双向同步...\n');
  
  if (!CONFIG.API_URL) {
    console.log('⚠️  未配置 API，仅显示本地数据状态');
    await showStatus();
    return;
  }
  
  // 获取云端数据
  const cloudData = await fetchFromCloud();
  const localData = loadLocalData();
  
  // 合并数据 (基于时间戳去重，保留最新)
  const merged = {};
  
  [...cloudData.scores, ...localData.scores].forEach(s => {
    const key = `${s.game}-${s.metric}-${s.playerName}`;
    if (!merged[key] || s.timestamp > merged[key].timestamp) {
      merged[key] = s;
    }
  });
  
  const mergedScores = Object.values(merged);
  mergedScores.sort((a, b) => b.timestamp - a.timestamp);
  
  console.log('\n📊 合并结果:');
  console.log('   云端记录:', cloudData.scores.length);
  console.log('   本地记录:', localData.scores.length);
  console.log('   合并后记录:', mergedScores.length);
  
  // 保存并上传
  const finalData = {
    scores: mergedScores.slice(0, 1000),
    lastUpdate: Date.now(),
    totalUploads: Math.max(cloudData.totalUploads || 0, localData.totalUploads || 0) + 1,
    version: 1
  };
  
  saveLocalData(finalData);
  
  const success = await pushToCloud(finalData);
  if (success) {
    console.log('\n✅ 同步完成!');
  } else {
    console.log('\n⚠️  同步部分失败，数据已保存到本地');
  }
}

// 导出数据
function exportData(format = 'json') {
  const localData = loadLocalData();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  if (format === 'json') {
    const file = path.join(__dirname, 'data', `export-${timestamp}.json`);
    fs.writeFileSync(file, JSON.stringify(localData, null, 2));
    console.log('✅ 数据已导出:', file);
  } else if (format === 'csv') {
    const file = path.join(__dirname, 'data', `export-${timestamp}.csv`);
    const headers = ['game', 'metric', 'value', 'playerName', 'timestamp'];
    const lines = [headers.join(',')];
    
    localData.scores.forEach(s => {
      lines.push([
        s.game,
        s.metric,
        s.value,
        s.playerName,
        new Date(s.timestamp).toISOString()
      ].join(','));
    });
    
    fs.writeFileSync(file, lines.join('\n'));
    console.log('✅ 数据已导出:', file);
  }
}

// 显示帮助
function showHelp() {
  console.log(`
🎮 FunWebGames 数据同步工具

用法：node sync-data.js <command> [options]

可用命令:
  fetch     从云端获取数据
  push      推送本地数据到云端
  sync      双向同步 (合并本地和云端数据)
  status    查看同步状态
  sample    添加示例数据
  export    导出数据 (json/csv)

环境变量:
  API_BASE_URL   API 基础 URL
  API_KEY        API 认证密钥
  API_BIN_ID     JSONBin ID
  SYNC_MODE      同步模式：jsonbin | rest | local

示例:
  node sync-data.js status
  node sync-data.js sample
  node sync-data.js sync
  SYNC_MODE=jsonbin API_BIN_ID=xxx API_KEY=xxx node sync-data.js push
`);
}

// 主函数
async function main() {
  const command = process.argv[2] || 'status';
  const option = process.argv[3];
  
  console.log('🎮 FunWebGames 数据同步工具');
  console.log('─────────────────────────────────────\n');
  
  switch (command) {
    case 'fetch':
      await fetchFromCloud();
      break;
    case 'push':
      await pushToCloud();
      break;
    case 'sync':
      await sync();
      break;
    case 'status':
      await showStatus();
      break;
    case 'sample':
      addSampleData();
      break;
    case 'export':
      exportData(option || 'json');
      break;
    case 'help':
    case '-h':
    case '--help':
      showHelp();
      break;
    default:
      console.log('未知命令:', command);
      showHelp();
  }
}

main().catch(console.error);
