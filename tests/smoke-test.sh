#!/usr/bin/env bash
# Smoke Test Script for FunWebGames
# Validates basic structure and presence of required files
#
# Usage: ./tests/smoke-test.sh
#
# Checks:
# 1. All games have required files (index.html, script.js, style.css)
# 2. HTML files are valid (basic structure check)
# 3. All games have "Back to Games" button
# 4. Landing page links to all 10 games
# 5. No obvious JavaScript syntax errors

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
GAMES_DIR="$ROOT_DIR/games"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
    echo -e "${GREEN}✓${NC} $1"
    PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARN_COUNT=$((WARN_COUNT + 1))
}

echo "========================================"
echo "  FunWebGames Smoke Test"
echo "========================================"
echo ""

# Test 1: Check all games have required files
echo "Test 1: Checking required files for all games..."
EXPECTED_GAMES=(
    "color-match"
    "animal-puzzle"
    "bubble-pop"
    "shape-builder"
    "counting-garden"
    "letter-explorer"
    "music-maker"
    "maze-runner"
    "star-catcher"
    "dress-up"
)

for game in "${EXPECTED_GAMES[@]}"; do
    game_path="$GAMES_DIR/$game"
    if [[ -d "$game_path" ]]; then
        if [[ -f "$game_path/index.html" && -f "$game_path/script.js" && -f "$game_path/style.css" ]]; then
            pass "$game: All required files present"
        else
            fail "$game: Missing required files (index.html, script.js, or style.css)"
        fi
    else
        fail "$game: Game directory not found"
    fi
done

echo ""

# Test 2: Check HTML structure
echo "Test 2: Validating HTML structure..."
for game in "${EXPECTED_GAMES[@]}"; do
    html_file="$GAMES_DIR/$game/index.html"
    if [[ -f "$html_file" ]]; then
        # Check for DOCTYPE
        if grep -q "<!DOCTYPE html>" "$html_file"; then
            # Check for html tag
            if grep -q "<html" "$html_file"; then
                # Check for head and body
                if grep -q "<head>" "$html_file" && grep -q "<body>" "$html_file"; then
                    pass "$game: Valid HTML5 structure"
                else
                    fail "$game: Missing <head> or <body> tag"
                fi
            else
                fail "$game: Missing <html> tag"
            fi
        else
            fail "$game: Missing DOCTYPE declaration"
        fi
    fi
done

# Check landing page
if [[ -f "$ROOT_DIR/index.html" ]]; then
    if grep -q "<!DOCTYPE html>" "$ROOT_DIR/index.html" && \
       grep -q "<html" "$ROOT_DIR/index.html" && \
       grep -q "<head>" "$ROOT_DIR/index.html" && \
       grep -q "<body>" "$ROOT_DIR/index.html"; then
        pass "Landing page: Valid HTML5 structure"
    else
        fail "Landing page: Invalid HTML structure"
    fi
else
    fail "Landing page: index.html not found"
fi

echo ""

# Test 3: Check "Back to Games" button in all games
echo "Test 3: Checking 'Back to Games' button..."
for game in "${EXPECTED_GAMES[@]}"; do
    html_file="$GAMES_DIR/$game/index.html"
    if [[ -f "$html_file" ]]; then
        if grep -qi "back.*game" "$html_file" || grep -qi "back.*home" "$html_file"; then
            pass "$game: Has 'Back to Games' button/link"
        else
            fail "$game: Missing 'Back to Games' button/link"
        fi
    fi
done

echo ""

# Test 4: Check landing page links to all games
echo "Test 4: Checking landing page game links..."
for game in "${EXPECTED_GAMES[@]}"; do
    if grep -q "games/$game/index.html" "$ROOT_DIR/index.html"; then
        pass "Landing page links to $game"
    else
        fail "Landing page missing link to $game"
    fi
done

echo ""

# Test 5: Check JavaScript syntax (basic check)
echo "Test 5: Checking JavaScript syntax..."
for game in "${EXPECTED_GAMES[@]}"; do
    js_file="$GAMES_DIR/$game/script.js"
    if [[ -f "$js_file" ]]; then
        # Basic syntax check using node
        if command -v node &> /dev/null; then
            if node --check "$js_file" 2>/dev/null; then
                pass "$game: JavaScript syntax OK"
            else
                fail "$game: JavaScript syntax error detected"
            fi
        else
            warn "$game: Node.js not available for syntax check"
        fi
    fi
done

# Check shared CSS
if [[ -f "$ROOT_DIR/css/shared.css" ]]; then
    pass "Shared CSS file exists"
else
    fail "Shared CSS file (css/shared.css) not found"
fi

echo ""

# Summary
echo "========================================"
echo "  Test Summary"
echo "========================================"
echo -e "${GREEN}Passed:${NC} $PASS_COUNT"
echo -e "${RED}Failed:${NC} $FAIL_COUNT"
echo -e "${YELLOW}Warnings:${NC} $WARN_COUNT"
echo ""

if [[ $FAIL_COUNT -eq 0 ]]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please fix the issues above.${NC}"
    exit 1
fi
