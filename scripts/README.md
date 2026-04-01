# 🔄 API 数据同步工具

FunWebGames 项目的外部 API 数据同步解决方案。

---

## 📦 可用工具

| 工具 | 说明 | 命令 |
|------|------|------|
| `quick-sync.js` | 快速同步单个 API | `node scripts/quick-sync.js [URL] [端点]` |
| `sync-all.js` | 多源并行同步 | `node scripts/sync-all.js` |
| `sync-api.js` | 完整同步（带配置） | `node scripts/sync-api.js sync` |

---

## 🚀 快速开始

### 1. 快速同步（单次）

```bash
# 使用默认 API
node scripts/quick-sync.js

# 指定 API 和端点
node scripts/quick-sync.js https://api.example.com /data

# 指定输出文件
node scripts/quick-sync.js https://api.example.com /data data/output.json
```

### 2. 多源同步（推荐）

```bash
# 编辑配置
# 修改 api-sync-config.json 添加你的 API

# 运行同步
node scripts/sync-all.js
```

### 3. 完整同步（带状态管理）

```bash
# 配置 API
node scripts/sync-api.js config

# 同步所有数据
node scripts/sync-api.js sync

# 查看状态
node scripts/sync-api.js status
```

---

## ⚙️ 配置说明

### api-sync-config.json

```json
{
  "sources": [
    {
      "name": "数据源名称",
      "url": "https://api.example.com/endpoint",
      "output": "data/output.json",
      "enabled": true
    }
  ],
  "settings": {
    "timeout": 30000,
    "retries": 3,
    "parallel": true
  }
}
```

### sync-config.json

```json
{
  "api": {
    "baseUrl": "https://api.example.com",
    "apiKey": "your-api-key",
    "timeout": 30000,
    "retries": 3
  },
  "endpoints": {
    "scores": "/scores",
    "progress": "/progress",
    "leaderboard": "/leaderboard"
  }
}
```

---

## 📁 输出文件

```
data/
├── api-data.json      # quick-sync.js 输出
├── scores.json        # 游戏分数
├── users.json         # 用户数据
├── comments.json      # 评论数据
└── synced-data.json   # sync-api.js 输出
```

---

## 🔐 认证配置

### Bearer Token

```json
{
  "api": {
    "baseUrl": "https://api.example.com",
    "apiKey": "your-bearer-token"
  }
}
```

### API Key (Header)

在 `sync-api.js` 中修改请求头：

```javascript
headers['X-API-Key'] = config.api.apiKey;
```

### 无认证

留空 `apiKey` 字段即可。

---

## 📊 示例输出

```
🚀 多源 API 数据同步

==================================================
📋 数据源：3 个
⚙️  超时：30000ms
==================================================

📡 同步：游戏分数
   ✅ 100 条记录 → data/scores.json

📡 同步：用户数据
   ✅ 10 条记录 → data/users.json

📡 同步：评论数据
   ✅ 500 条记录 → data/comments.json

==================================================
📊 同步报告
==================================================
⏱️  耗时：0.12 秒
✅ 成功：3 个
📦 总记录：610 条
```

---

## 🛠️ 自定义 API

### 步骤 1: 创建配置

```bash
cp api-sync-config.json my-api-config.json
```

### 步骤 2: 编辑配置

```json
{
  "sources": [
    {
      "name": "我的 API",
      "url": "https://my-api.com/data",
      "output": "data/my-data.json",
      "enabled": true
    }
  ]
}
```

### 步骤 3: 运行同步

```bash
node scripts/sync-all.js
```

---

## 🐛 故障排除

| 问题 | 解决方案 |
|------|----------|
| 请求超时 | 增加 `timeout` 值 |
| 状态码 401 | 检查 API Key 配置 |
| 状态码 404 | 检查 URL 和端点 |
| JSON 解析失败 | 检查 API 返回格式 |
| 文件保存失败 | 检查 `data/` 目录权限 |

---

## 📞 需要帮助？

查看详细文档：
- [SYNC-GUIDE.md](SYNC-GUIDE.md) - 详细使用指南
- [../README.md](../README.md) - 项目主文档
