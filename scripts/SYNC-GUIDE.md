# FunWebGames API 数据同步指南

## 📋 目录

- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [使用命令](#使用命令)
- [自定义 API 集成](#自定义-api-集成)
- [故障排除](#故障排除)

---

## 🚀 快速开始

### 1. 复制配置文件

```bash
cp sync-config.example.json sync-config.json
```

### 2. 编辑配置

编辑 `sync-config.json`，填入你的 API 信息：

```json
{
  "api": {
    "baseUrl": "https://your-api.com",
    "apiKey": "your-api-key"
  }
}
```

### 3. 运行同步

```bash
node scripts/sync-api.js sync
```

---

## ⚙️ 配置说明

### sync-config.json 结构

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `api.baseUrl` | API 服务器地址 | 必填 |
| `api.apiKey` | API 认证密钥 | 可选 |
| `api.timeout` | 请求超时 (ms) | 30000 |
| `api.retries` | 失败重试次数 | 3 |
| `sync.enabled` | 是否启用同步 | true |
| `sync.autoSync` | 是否自动同步 | false |
| `sync.syncInterval` | 自动同步间隔 (ms) | 3600000 |
| `endpoints.*` | 各数据类型的 API 端点 | 见下方 |

### 端点配置示例

```json
{
  "endpoints": {
    "scores": "/api/v1/scores",
    "progress": "/api/v1/progress",
    "leaderboard": "/api/v1/leaderboard",
    "users": "/api/v1/users"
  }
}
```

---

## 💻 使用命令

### 同步所有数据

```bash
node scripts/sync-api.js sync
```

### 查看同步状态

```bash
node scripts/sync-api.js status
```

输出示例：
```
📊 Sync Status

Configuration:
  API Base URL: https://your-api.com
  API Key: ***key
  Enabled: true
  Auto Sync: false

Last Sync:
  Time: 2024-01-15T10:30:00.000Z
  Scores: 150
  Leaderboard: 50
  Progress Keys: 25
```

### 获取特定数据

```bash
# 获取分数
node scripts/sync-api.js fetch --type=scores

# 获取进度
node scripts/sync-api.js fetch --type=progress

# 获取排行榜
node scripts/sync-api.js fetch --type=leaderboard
```

### 推送本地数据到 API

```bash
node scripts/sync-api.js push --type=scores
```

### 查看配置

```bash
node scripts/sync-api.js config
```

### 查看帮助

```bash
node scripts/sync-api.js help
```

---

## 🔧 自定义 API 集成

### 添加新的数据类型

1. 在 `sync-config.json` 中添加端点：

```json
{
  "endpoints": {
    "achievements": "/api/achievements"
  },
  "dataTypes": ["scores", "progress", "leaderboard", "achievements"]
}
```

2. 在 `sync-api.js` 中添加同步函数：

```javascript
async function syncAchievements(options = {}) {
  console.log('🏅 Syncing achievements...');
  
  const config = loadConfig();
  const endpoint = config.endpoints.achievements;
  
  try {
    const achievements = await fetchFromAPI(endpoint);
    console.log(`✅ Fetched ${achievements.length} achievements`);
    return achievements;
  } catch (error) {
    console.error('❌ Failed to sync achievements:', error.message);
    return [];
  }
}
```

3. 在 `syncAll()` 函数中调用新函数。

### 使用不同的认证方式

修改 `makeRequest()` 函数中的认证头：

```javascript
// Basic Auth
headers['Authorization'] = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

// API Key in header
headers['X-API-Key'] = config.api.apiKey;

// API Key in query
const url = `${config.api.baseUrl}${endpoint}?api_key=${config.api.apiKey}`;
```

---

## 🐛 故障排除

### 常见问题

#### 1. "API base URL not configured"

**解决方案：** 运行配置命令并设置 baseUrl
```bash
node scripts/sync-api.js config
# 编辑 sync-config.json
```

#### 2. "Request timeout"

**解决方案：** 增加超时时间
```json
{
  "api": {
    "timeout": 60000
  }
}
```

#### 3. "API returned status 401"

**解决方案：** 检查 API key 是否正确
```json
{
  "api": {
    "apiKey": "your-correct-api-key"
  }
}
```

#### 4. 数据未保存

**解决方案：** 检查 data 目录权限
```bash
mkdir -p data
chmod 755 data
```

### 启用详细日志

```bash
node scripts/sync-api.js sync --verbose
```

---

## 📁 数据文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| 配置 | `sync-config.json` | API 配置 |
| 同步数据 | `data/synced-data.json` | 从 API 同步的数据 |
| 脚本 | `scripts/sync-api.js` | 同步脚本 |

---

## 🔐 安全建议

1. **不要提交 API Key 到 Git**
   ```bash
   echo "sync-config.json" >> .gitignore
   ```

2. **使用环境变量**
   ```javascript
   const apiKey = process.env.API_KEY;
   ```

3. **定期轮换密钥**

---

## 📞 支持

如有问题，请查看：
- [README.md](../README.md)
- [API 文档](./js/api-sync.js)
