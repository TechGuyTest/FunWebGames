# 🔄 API 数据同步 - 快速指南

## ⚡ 最快方式（3 秒开始）

```bash
# 1. 同步测试数据
node sync.js

# 2. 同步你的 API
node sync.js https://你的 API.com/数据

# 完成！数据在 data/synced.json
```

---

## 📁 文件结构

```
FunWebGames/
├── sync.js                    # 最简单同步脚本 ⭐
├── api-sync-config.json       # 多源配置
├── sync-config.json           # 完整配置
├── scripts/
│   ├── quick-sync.js          # 快速同步
│   ├── sync-all.js            # 多源并行同步
│   └── sync-api.js            # 完整同步系统
└── data/                      # 同步数据输出目录
    ├── synced.json            # 最新同步数据
    ├── scores.json
    ├── users.json
    └── ...
```

---

## 🛠️ 选择适合你的工具

| 需求 | 工具 | 命令 |
|------|------|------|
| **快速测试** | `sync.js` | `node sync.js [URL]` |
| **多个 API** | `scripts/sync-all.js` | `node scripts/sync-all.js` |
| **定时同步** | `scripts/sync-api.js` | `node scripts/sync-api.js sync` |
| **自定义端点** | `scripts/quick-sync.js` | `node scripts/quick-sync.js URL ENDPOINT` |

---

## 📝 配置你的 API

### 方式 1: 命令行参数（最简单）

```bash
node sync.js https://api.github.com/users/TechGuyTest/repos
```

### 方式 2: 修改 sync.js

```javascript
const CONFIG = {
  url: 'https://你的 API.com/端点',
  output: 'data/你的文件.json'
};
```

### 方式 3: 多源配置 (api-sync-config.json)

```json
{
  "sources": [
    {
      "name": "我的 API",
      "url": "https://api.example.com/data",
      "output": "data/my-data.json"
    }
  ]
}
```

---

## 🔐 需要认证？

### 在 sync.js 中添加认证头：

```javascript
const options = {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-API-Key': 'YOUR_API_KEY'
  }
};

lib.get(CONFIG.url, options, callback);
```

### 或使用完整同步系统：

```bash
node scripts/sync-api.js config
# 编辑 sync-config.json 添加 apiKey
```

---

## 📊 当前同步数据

```bash
$ ls -la data/
-rw-r--r--  synced.json      (27 KB, 100 条记录)
-rw-r--r--  scores.json      (27 KB, 100 条记录)
-rw-r--r--  users.json       (5.6 KB, 10 条记录)
-rw-r--r--  comments.json    (158 KB, 500 条记录)
```

---

## 🚀 下一步

1. **替换 API URL** - 编辑 `sync.js` 或使用命令行参数
2. **运行同步** - `node sync.js`
3. **使用数据** - 在 `data/synced.json` 中获取数据

---

## ❓ 需要帮助？

```bash
# 查看完整文档
cat scripts/README.md

# 查看同步指南
cat scripts/SYNC-GUIDE.md
```

---

**现在就试试：**

```bash
node sync.js https://api.github.com/repos/TechGuyTest/FunWebGames
```
