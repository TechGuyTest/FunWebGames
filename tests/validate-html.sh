#!/usr/bin/env bash
# HTML/CSS Validation Script for FunWebGames
# Uses HTML5 validator if available, otherwise does basic checks
#
# Usage: ./tests/validate-html.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================"
echo "  HTML/CSS Validation"
echo "========================================"
echo ""

# Check if html5.validator is available (optional)
if command -v html5 &> /dev/null; then
    echo "Using HTML5 validator..."
    echo ""
    
    # Validate landing page
    echo "Validating landing page..."
    if html5 "$ROOT_DIR/index.html" 2>&1; then
        echo -e "${GREEN}✓ Landing page: Valid HTML5${NC}"
    else
        echo -e "${RED}✗ Landing page: Validation errors${NC}"
    fi
    
    # Validate all games
    for game_dir in "$ROOT_DIR"/games/*/; do
        game_name=$(basename "$game_dir")
        html_file="$game_dir/index.html"
        if [[ -f "$html_file" ]]; then
            echo "Validating $game_name..."
            if html5 "$html_file" 2>&1; then
                echo -e "${GREEN}✓ $game_name: Valid HTML5${NC}"
            else
                echo -e "${RED}✗ $game_name: Validation errors${NC}"
            fi
        fi
    done
else
    echo "HTML5 validator not installed (optional)."
    echo "Install with: npm install -g html5"
    echo ""
    echo -e "${GREEN}✓ Skipping HTML5 validation (tool not available)${NC}"
fi

echo ""
echo "========================================"
echo "  CSS Validation"
echo "========================================"
echo ""

# Check if csslint is available (optional)
if command -v csslint &> /dev/null; then
    echo "Using CSSLint..."
    echo ""
    csslint "$ROOT_DIR/css/shared.css" 2>&1 || true
    
    for game_dir in "$ROOT_DIR"/games/*/; do
        game_name=$(basename "$game_dir")
        css_file="$game_dir/style.css"
        if [[ -f "$css_file" ]]; then
            echo "Linting $game_name CSS..."
            csslint "$css_file" 2>&1 || true
        fi
    done
else
    echo "CSSLint not installed (optional)."
    echo "Install with: npm install -g csslint"
    echo ""
    echo -e "${GREEN}✓ Skipping CSS validation (tool not available)${NC}"
fi

echo ""
echo "========================================"
echo "  Basic File Size Check"
echo "========================================"
echo ""

# Check file sizes (should be under 500KB per game per GR-5)
MAX_SIZE=512000  # 500KB in bytes

for game_dir in "$ROOT_DIR"/games/*/; do
    game_name=$(basename "$game_dir")
    total_size=0
    
    for file in "$game_dir"/*; do
        if [[ -f "$file" ]]; then
            file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            total_size=$((total_size + file_size))
        fi
    done
    
    if [[ $total_size -lt $MAX_SIZE ]]; then
        echo -e "${GREEN}✓${NC} $game_name: $(($total_size / 1024))KB (under 500KB limit)"
    else
        echo -e "${RED}✗${NC} $game_name: $(($total_size / 1024))KB (exceeds 500KB limit)"
    fi
done

echo ""
echo -e "${GREEN}Validation complete!${NC}"
