#!/bin/bash

# FunWebGames API 数据同步脚本
# 用法：./api-sync.sh [API_URL] [OUTPUT_FILE]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
DEFAULT_URL="https://jsonplaceholder.typicode.com/posts"
OUTPUT_DIR="data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 参数
API_URL="${1:-$DEFAULT_URL}"
OUTPUT_FILE="${2:-$OUTPUT_DIR/synced_$TIMESTAMP.json}"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FunWebGames API 数据同步工具        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📡 API 地址:${NC} $API_URL"
echo -e "${YELLOW}📁 输出文件:${NC} $OUTPUT_FILE"
echo ""

# 确保输出目录存在
mkdir -p "$OUTPUT_DIR"

# 发送请求
echo -e "${YELLOW}🔄 正在请求 API...${NC}"

if command -v curl &> /dev/null; then
    # 使用 curl
    HTTP_CODE=$(curl -s -w "%{http_code}" -o "$OUTPUT_FILE" "$API_URL")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ 请求成功 (HTTP $HTTP_CODE)${NC}"
        
        # 统计记录数
        if command -v jq &> /dev/null; then
            if jq -e 'type == "array"' "$OUTPUT_FILE" > /dev/null 2>&1; then
                COUNT=$(jq 'length' "$OUTPUT_FILE")
                echo -e "${GREEN}📦 记录数:${NC} $COUNT 条"
            else
                echo -e "${GREEN}📦 数据格式:${NC} 对象"
            fi
        else
            # 没有 jq，用简单方式统计
            COUNT=$(grep -c '"id"' "$OUTPUT_FILE" || echo "?")
            echo -e "${GREEN}📦 估算记录数:${NC} ~$COUNT 条"
        fi
        
        # 文件大小
        SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
        echo -e "${GREEN}💾 文件大小:${NC} $SIZE"
        echo -e "${GREEN}📍 保存位置:${NC} $(pwd)/$OUTPUT_FILE"
        
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║          ✅ 同步完成！                ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
        
        # 显示预览
        echo ""
        echo -e "${YELLOW}📋 数据预览:${NC}"
        if command -v jq &> /dev/null; then
            jq '.[0:2]' "$OUTPUT_FILE" 2>/dev/null || jq '.' "$OUTPUT_FILE" | head -20
        else
            head -30 "$OUTPUT_FILE"
        fi
        
    else
        echo -e "${RED}❌ 请求失败 (HTTP $HTTP_CODE)${NC}"
        rm -f "$OUTPUT_FILE"
        exit 1
    fi
    
elif command -v wget &> /dev/null; then
    # 使用 wget
    if wget -q -O "$OUTPUT_FILE" "$API_URL"; then
        echo -e "${GREEN}✅ 下载成功${NC}"
        SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
        echo -e "${GREEN}💾 文件大小:${NC} $SIZE"
    else
        echo -e "${RED}❌ 下载失败${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 错误：需要 curl 或 wget${NC}"
    echo "请安装: apt install curl 或 yum install curl"
    exit 1
fi

echo ""
