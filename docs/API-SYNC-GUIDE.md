# API 数据同步指南

本文档介绍如何使用 FunWebGames 的数据同步功能，将游戏数据与外部 API 进行同步。

## 📋 目录

- [概述](#概述)
- [快速开始](#快速开始)
- [配置选项](#配置选项)
- [使用命令行](#使用命令行)
- [集成到网页](#集成到网页)
- [自定义 API](#自定义-api)

---

## 概述

FunWebGames 提供完整的数据同步解决方案，支持：

- **游戏高分同步** - 将玩家的高分记录同步到云端
- **排行榜获取** - 从云端获取全局排行榜
- **离线优先** - 本地缓存 + 网络恢复后自动同步
- **多后端支持** - JSONBin.io、自定义 REST API、本地文件

---

## 快速开始

### 1. 查看同步状态

```bash
cd /workspace/repos/FunWebGames
node sync-data.js status
```

### 2. 生成示例数据

```bash
node sync-data.js sample
```

### 3. 导出数据备份

```bash
node sync-data.js export json
```

---

## 配置选项

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `SYNC_MODE` | 同步模式 | `jsonbin` \| `rest` \| `local` |
| `API_BIN_ID` | JSONBin ID | `6720a1b5acd3134a64c9e3f0` |
| `API_KEY` | API 认证密钥 | `$2a$10$...` |
| `API_BASE_URL` | 自定义 API 地址 | `https://api.example.com/v1` |

### 配置示例

**使用 JSONBin.io:**
```bash
export SYNC_MODE=jsonbin
export API_BIN_ID=your-bin-id
export API_KEY=your-api-key
node sync-data.js sync
```

**使用自定义 API:**
```bash
export SYNC_MODE=rest
export API_BASE_URL=https://api.yoursite.com/v1
export API_KEY=your-secret-key
node sync-data.js push
```

---

## 使用命令行

### 可用命令

| 命令 | 说明 |
|------|------|
| `status` | 查看同步状态 |
| `fetch` | 从云端获取数据 |
| `push` | 推送本地数据到云端 |
| `sync` | 双向同步（合并本地和云端） |
| `sample` | 生成示例数据 |
| `export` | 导出数据（JSON/CSV） |

### 示例

```bash
# 查看当前状态
node sync-data.js status

# 生成测试数据
node sync-data.js sample

# 同步到云端
node sync-data.js sync

# 导出为 CSV
node sync-data.js export csv
```

---

## 集成到网页

### 在 HTML 中引入

```html
<!-- 1. 引入配置 -->
<script src="js/api-config.js"></script>

<!-- 2. 引入同步模块 -->
<script src="js/api-sync.js"></script>

<!-- 3. 引入真实云同步 (可选) -->
<script src="js/real-api-sync.js"></script>
```

### JavaScript 使用示例

```javascript
// 初始化
APISync.init('https://api.example.com', 'user-token');

// 同步分数
APISync.syncScore('color-match', 'moves', 25, 'low');

// 获取排行榜
const leaderboard = await APISync.fetchLeaderboard('color-match');

// 使用 HighScore 模块（自动同步）
HighScore.set('bubble-pop', 'score', 150, 'high', true);
```

---

## 自定义 API

### API 接口规范

如果你的后端需要与 FunWebGames 同步模块对接，请遵循以下接口规范：

#### GET /scores/latest
获取最新数据

**响应格式:**
```json
{
  "scores": [
    {
      "game": "color-match",
      "metric": "moves",
      "value": 25,
      "playerName": "Player1",
      "timestamp": 1234567890
    }
  ],
  "lastUpdate": 1234567890,
  "totalUploads": 10
}
```

#### PUT /scores
上传/更新数据

**请求格式:**
```json
{
  "scores": [...],
  "lastUpdate": 1234567890,
  "totalUploads": 11
}
```

**响应:** HTTP 200 OK

---

## 数据结构

### Score 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `game` | string | 游戏标识 |
| `metric` | string | 指标名称 (score/moves/time 等) |
| `value` | number | 分数值 |
| `playerName` | string | 玩家名称 |
| `timestamp` | number | 时间戳 (毫秒) |
| `metricType` | string | 可选，`high` 或 `low` |
| `deviceId` | string | 可选，设备标识 |

---

## 故障排除

### 常见问题

**Q: 同步失败，显示 401 错误**
A: 检查 API_KEY 是否正确配置

**Q: 显示 404 错误**
A: 检查 API_BIN_ID 或 API_BASE_URL 是否正确

**Q: 离线时数据丢失**
A: 数据会自动保存到 localStorage，刷新页面不会丢失

---

## 相关文件

- `sync-data.js` - 命令行同步工具
- `js/api-config.js` - API 配置
- `js/api-sync.js` - 通用同步模块
- `js/real-api-sync.js` - JSONBin.io 同步实现
- `js/highscore.js` - 高分系统（集成云同步）

---

## 安全提示

⚠️ **不要将 API 密钥提交到版本控制**

将敏感配置添加到 `.gitignore`:
```
data/.env
.env
```

使用环境变量或本地配置文件存储密钥。
