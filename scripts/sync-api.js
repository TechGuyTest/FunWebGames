#!/usr/bin/env node

/**
 * External API Data Sync Script for FunWebGames
 * 
 * Syncs game data (scores, progress, leaderboards) from external APIs
 * 
 * Usage:
 *   node scripts/sync-api.js [command] [options]
 * 
 * Commands:
 *   sync        - Sync all data from external API (default)
 *   fetch       - Fetch specific data type
 *   push        - Push local data to API
 *   status      - Check sync status
 *   config      - Show/update configuration
 * 
 * Options:
 *   --type=<data_type>    Data type to sync (scores, progress, leaderboard)
 *   --game=<game_name>    Specific game to sync
 *   --dry-run             Show what would be synced without making changes
 *   --verbose             Show detailed output
 * 
 * Examples:
 *   node scripts/sync-api.js sync
 *   node scripts/sync-api.js fetch --type=scores --game=color-match
 *   node scripts/sync-api.js status
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG_PATH = path.join(__dirname, '..', 'sync-config.json');
const DATA_PATH = path.join(__dirname, '..', 'data', 'synced-data.json');

// Default configuration
const DEFAULT_CONFIG = {
  api: {
    baseUrl: '',
    apiKey: '',
    timeout: 30000,
    retries: 3
  },
  sync: {
    enabled: true,
    autoSync: false,
    syncInterval: 3600000, // 1 hour
    lastSync: null
  },
  endpoints: {
    scores: '/api/scores',
    progress: '/api/progress',
    leaderboard: '/api/leaderboard',
    users: '/api/users'
  },
  dataTypes: ['scores', 'progress', 'leaderboard']
};

// Load configuration
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.warn('⚠️  Could not load config, using defaults:', error.message);
  }
  return DEFAULT_CONFIG;
}

// Save configuration
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    console.log('✅ Configuration saved to', CONFIG_PATH);
  } catch (error) {
    console.error('❌ Failed to save config:', error.message);
  }
}

// Load synced data
function loadSyncedData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    }
  } catch (error) {
    console.warn('⚠️  Could not load synced data:', error.message);
  }
  return { scores: [], progress: {}, leaderboard: [], lastSync: null };
}

// Save synced data
function saveSyncedData(data) {
  try {
    const dataDir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    data.lastSync = new Date().toISOString();
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Data saved to', DATA_PATH);
  } catch (error) {
    console.error('❌ Failed to save data:', error.message);
  }
}

// Make HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const config = loadConfig();
    const isHttps = url.startsWith('https://');
    const lib = isHttps ? https : http;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FunWebGames-Sync/1.0'
      },
      timeout: config.api.timeout
    };
    
    if (config.api.apiKey) {
      defaultOptions.headers['Authorization'] = `Bearer ${config.api.apiKey}`;
      defaultOptions.headers['X-API-Key'] = config.api.apiKey;
    }
    
    const reqOptions = { ...defaultOptions, ...options };
    
    const req = lib.request(url, reqOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (reqOptions.body) {
      req.write(JSON.stringify(reqOptions.body));
    }
    
    req.end();
  });
}

// Fetch data from API with retries
async function fetchFromAPI(endpoint, options = {}) {
  const config = loadConfig();
  const url = `${config.api.baseUrl}${endpoint}`;
  
  if (!config.api.baseUrl) {
    throw new Error('API base URL not configured. Run: node scripts/sync-api.js config');
  }
  
  let lastError;
  for (let i = 0; i < config.api.retries; i++) {
    try {
      const response = await makeRequest(url, options);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      
      lastError = new Error(`API returned status ${response.status}`);
    } catch (error) {
      lastError = error;
      if (i < config.api.retries - 1) {
        console.log(`⏳ Retrying... (${i + 1}/${config.api.retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

// Sync scores from API
async function syncScores(options = {}) {
  console.log('📊 Syncing scores...');
  
  const config = loadConfig();
  const endpoint = config.endpoints.scores;
  
  try {
    const scores = await fetchFromAPI(endpoint, {
      method: 'GET'
    });
    
    console.log(`✅ Fetched ${Array.isArray(scores) ? scores.length : 'unknown'} scores`);
    return scores;
  } catch (error) {
    console.error('❌ Failed to sync scores:', error.message);
    return [];
  }
}

// Sync progress from API
async function syncProgress(options = {}) {
  console.log('📈 Syncing progress...');
  
  const config = loadConfig();
  const endpoint = config.endpoints.progress;
  
  try {
    const progress = await fetchFromAPI(endpoint, {
      method: 'GET'
    });
    
    console.log('✅ Fetched progress data');
    return progress;
  } catch (error) {
    console.error('❌ Failed to sync progress:', error.message);
    return {};
  }
}

// Sync leaderboard from API
async function syncLeaderboard(options = {}) {
  console.log('🏆 Syncing leaderboard...');
  
  const config = loadConfig();
  const endpoint = config.endpoints.leaderboard;
  
  try {
    const leaderboard = await fetchFromAPI(endpoint, {
      method: 'GET'
    });
    
    console.log(`✅ Fetched ${Array.isArray(leaderboard) ? leaderboard.length : 'unknown'} leaderboard entries`);
    return leaderboard;
  } catch (error) {
    console.error('❌ Failed to sync leaderboard:', error.message);
    return [];
  }
}

// Push data to API
async function pushToAPI(dataType, data) {
  console.log(`📤 Pushing ${dataType} to API...`);
  
  const config = loadConfig();
  const endpoint = config.endpoints[dataType];
  
  if (!endpoint) {
    throw new Error(`Unknown data type: ${dataType}`);
  }
  
  try {
    const response = await fetchFromAPI(endpoint, {
      method: 'POST',
      body: data
    });
    
    console.log(`✅ Pushed ${dataType} successfully`);
    return response;
  } catch (error) {
    console.error(`❌ Failed to push ${dataType}:`, error.message);
    throw error;
  }
}

// Main sync function
async function syncAll(options = {}) {
  console.log('🚀 Starting full sync...\n');
  
  const config = loadConfig();
  const syncedData = loadSyncedData();
  const results = {};
  
  // Sync scores
  if (config.dataTypes.includes('scores')) {
    results.scores = await syncScores(options);
    syncedData.scores = results.scores;
  }
  
  // Sync progress
  if (config.dataTypes.includes('progress')) {
    results.progress = await syncProgress(options);
    syncedData.progress = results.progress;
  }
  
  // Sync leaderboard
  if (config.dataTypes.includes('leaderboard')) {
    results.leaderboard = await syncLeaderboard(options);
    syncedData.leaderboard = results.leaderboard;
  }
  
  // Save synced data
  saveSyncedData(syncedData);
  
  // Update last sync time
  config.sync.lastSync = new Date().toISOString();
  saveConfig(config);
  
  console.log('\n✅ Sync completed successfully!');
  console.log('📁 Data saved to:', DATA_PATH);
  
  return results;
}

// Show sync status
function showStatus() {
  const config = loadConfig();
  const syncedData = loadSyncedData();
  
  console.log('\n📊 Sync Status\n');
  console.log('Configuration:');
  console.log(`  API Base URL: ${config.api.baseUrl || 'Not configured'}`);
  console.log(`  API Key: ${config.api.apiKey ? '***' + config.api.apiKey.slice(-4) : 'Not set'}`);
  console.log(`  Enabled: ${config.sync.enabled}`);
  console.log(`  Auto Sync: ${config.sync.autoSync}`);
  console.log(`  Sync Interval: ${config.sync.syncInterval / 1000 / 60} minutes`);
  
  console.log('\nLast Sync:');
  console.log(`  Time: ${syncedData.lastSync || 'Never'}`);
  console.log(`  Scores: ${Array.isArray(syncedData.scores) ? syncedData.scores.length : 0}`);
  console.log(`  Leaderboard: ${Array.isArray(syncedData.leaderboard) ? syncedData.leaderboard.length : 0}`);
  console.log(`  Progress Keys: ${Object.keys(syncedData.progress || {}).length}`);
  
  console.log('\nEndpoints:');
  Object.entries(config.endpoints).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log('');
}

// Initialize configuration
function initConfig() {
  const config = loadConfig();
  
  console.log('\n⚙️  API Sync Configuration\n');
  console.log('Edit sync-config.json to configure:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\n📝 Quick Setup:');
  console.log('  1. Set api.baseUrl to your API endpoint');
  console.log('  2. Set api.apiKey to your API key (if required)');
  console.log('  3. Run: node scripts/sync-api.js sync\n');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';
  const options = {};
  
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value || true;
    }
  });
  
  return { command, options };
}

// Main entry point
async function main() {
  const { command, options } = parseArgs();
  
  console.log('🎮 FunWebGames API Sync Tool\n');
  
  try {
    switch (command) {
      case 'sync':
        await syncAll(options);
        break;
      
      case 'fetch':
        const dataType = options.type || 'scores';
        const data = await fetchFromAPI(loadConfig().endpoints[dataType]);
        console.log('\nFetched data:', JSON.stringify(data, null, 2));
        break;
      
      case 'push':
        const syncedData = loadSyncedData();
        const pushType = options.type || 'scores';
        await pushToAPI(pushType, syncedData[pushType]);
        break;
      
      case 'status':
        showStatus();
        break;
      
      case 'config':
        initConfig();
        break;
      
      case 'help':
      case '--help':
      case '-h':
        console.log(`
FunWebGames API Sync Tool

Usage: node scripts/sync-api.js [command] [options]

Commands:
  sync      Sync all data from external API (default)
  fetch     Fetch specific data type
  push      Push local data to API
  status    Check sync status
  config    Show configuration
  help      Show this help message

Options:
  --type=<type>     Data type (scores, progress, leaderboard)
  --game=<name>     Specific game to sync
  --dry-run         Show what would be synced
  --verbose         Show detailed output

Examples:
  node scripts/sync-api.js sync
  node scripts/sync-api.js fetch --type=scores
  node scripts/sync-api.js status
  node scripts/sync-api.js config
`);
        break;
      
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "node scripts/sync-api.js help" for usage');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run main
main();
