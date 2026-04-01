# 🔄 FunWebGames API 数据同步

> 完整的外部 API 数据同步解决方案

---

## ⚡ 快速开始

### 一键同步所有 API

```bash
cd /workspace/repos/FunWebGames
node sync-data.js
```

### 同步单个 API

```bash
node sync-data.js --sync crypto
```

### 添加新 API

```bash
node sync-data.js --add myapi "https://api.example.com/data"
```

---

## 📦 已同步数据

| 数据源 | 文件 | 记录 | 大小 | 状态 |
|--------|------|------|------|------|
| 💰 Crypto | `crypto-prices.json` | 10 | 9.3 KB | ✅ |
| 📦 GitHub | `github-repo.json` | 1 | 5.7 KB | ✅ |
| 📝 Posts | `posts.json` | 100 | 26.9 KB | ✅ |
| 👥 Users | `users.json` | 10 | 5.5 KB | ✅ |

**总计：121 条记录，47.4 KB**

---

## 🛠️ 可用工具

### 1. 统一同步工具 ⭐推荐

```bash
node sync-data.js              # 同步所有
node sync-data.js --list       # 列出数据源
node sync-data.js --sync <名>  # 同步指定
node sync-data.js --add <名> <URL>  # 添加新源
```

### 2. Shell 脚本

```bash
./api-sync.sh [URL] [输出文件]
```

### 3. Node.js 快速同步

```bash
node sync.js [URL]
```

### 4. 多源并行同步

```bash
node scripts/sync-all.js
```

---

## 📁 文件结构

```
FunWebGames/
├── sync-data.js           # 统一同步工具 ⭐
├── sync-sources.json      # 数据源配置
├── api-sync.sh            # Shell 同步脚本
├── sync.js                # Node.js 快速同步
├── api-data-viewer.html   # 数据可视化
├── README-API-SYNC.md     # 本文档
├── scripts/
│   ├── sync-api.js        # 完整同步系统
│   ├── sync-all.js        # 多源并行同步
│   └── quick-sync.js      # 快速同步
└── data/                  # 同步数据
    ├── crypto-prices.json
    ├── github-repo.json
    ├── posts.json
    └── users.json
```

---

## 🔧 配置数据源

### 编辑 sync-sources.json

```json
{
  "sources": [
    {
      "name": "我的 API",
      "url": "https://api.example.com/v1/data",
      "output": "my-data.json",
      "enabled": true
    }
  ]
}
```

### 或使用命令添加

```bash
node sync-data.js --add myapi "https://api.example.com/data"
```

---

## 🔐 认证配置

### 在 sync-data.js 中添加 Header

```javascript
lib.get(url, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-API-Key': 'YOUR_API_KEY'
  }
}, callback);
```

---

## 📊 使用同步数据

### JavaScript

```javascript
// 浏览器
fetch('data/crypto-prices.json')
  .then(r => r.json())
  .then(data => console.log(data));

// Node.js
const crypto = require('./data/crypto-prices.json');
```

### HTML 可视化

打开 `api-data-viewer.html` 查看数据！

---

## 📖 详细文档

| 文件 | 说明 |
|------|------|
| `README-API-SYNC.md` | 本文档 - 快速指南 |
| `API-同步总结.md` | 完整总结报告 |
| `同步完成.md` | 使用指南 |
| `scripts/README.md` | 工具文档 |

---

## 🎯 示例

### 同步加密货币价格

```bash
node sync-data.js --sync crypto
```

### 同步 GitHub 仓库

```bash
./api-sync.sh https://api.github.com/users/TechGuyTest/repos data/repos.json
```

### 同步多个 API

```bash
# 编辑 sync-sources.json 添加数据源
node sync-data.js --add weather "https://api.weather.com/data"
node sync-data.js --add news "https://api.news.com/headlines"

# 同步所有
node sync-data.js
```

---

## ❓ 常见问题

**Q: 如何定时同步？**

A: 使用 cron：
```bash
# 每小时同步一次
0 * * * * cd /workspace/repos/FunWebGames && node sync-data.js
```

**Q: 数据保存在哪里？**

A: `data/` 目录

**Q: 如何查看同步的数据？**

A: 
```bash
# 命令行
cat data/crypto-prices.json

# 浏览器
open api-data-viewer.html
```

---

## 🚀 立即开始

```bash
cd /workspace/repos/FunWebGames
node sync-data.js
```

**就这么简单！** ✨
