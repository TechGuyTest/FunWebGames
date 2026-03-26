# FunWebGames Test Suite

Automated test scripts for validating the FunWebGames project.

## Quick Start

Run all tests:
```bash
# Run smoke tests (required files, HTML structure, Back to Games buttons)
./tests/smoke-test.sh

# Run validation tests (file sizes, optional HTML/CSS linting)
./tests/validate-html.sh
```

## Test Scripts

### smoke-test.sh
Validates basic structure and presence of required files:
- ✓ All games have required files (index.html, script.js, style.css)
- ✓ HTML files have valid HTML5 structure
- ✓ All games have "Back to Games" button
- ✓ Landing page links to all 10 games
- ✓ JavaScript syntax validation (using Node.js)
- ✓ Shared CSS file exists

### validate-html.sh
Performs additional validation:
- HTML5 validation (requires `html5` npm package)
- CSS linting (requires `csslint` npm package)
- File size checks (ensures each game is under 500KB per GR-5)

## Manual Testing

For comprehensive manual testing, see `checklist.md` which contains detailed test cases for:
- Landing page functionality
- All 10 games' core features
- Cross-game checks (touch interactions, audio, responsive design)

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:
```yaml
# Example GitHub Actions step
- name: Run smoke tests
  run: ./tests/smoke-test.sh
```

## Requirements

- Bash shell
- Node.js (optional, for JavaScript syntax checking)
- html5 npm package (optional, for HTML validation)
- csslint npm package (optional, for CSS linting)
