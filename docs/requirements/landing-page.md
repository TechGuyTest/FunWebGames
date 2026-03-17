# Landing Page Requirements

## Overview

The landing page (`index.html`) serves as the game launcher for all 10 games. It should feel like a colorful toy box that invites children to explore.

## Functional Requirements

### LP-1: Game Card Grid
- Display game cards in a grid layout (2-3 per row on desktop, 1 per row on mobile)
- Each card represents one of the 10 games
- Click/tap a card → opens the game in full viewport
- Responsive: works on screens 320px to 1920px wide

### LP-2: Card Design
Each game card shows:
- Game thumbnail (colorful, playful illustration)
- Game name (large, readable text)
- Fun emoji/icon representing the game
- Hover/tap animation (slight lift + shadow increase)

### LP-3: Navigation
- "Back to Games" button visible in every game (links back to index.html)
- No other navigation elements needed — keep it simple for children
- Visual navigation only — no text that a 6-year-old can't skip

### LP-4: Visual Design
- Animated, colorful design — feels like a toy box
- Follow Apple-inspired design principles (GR-2):
  - Generous whitespace between cards
  - Rounded corners (border-radius ≥ 12px)
  - Subtle shadows for depth
  - Bright primary colors + soft pastel backgrounds
- Font: rounded, playful sans-serif (`"Comic Sans MS", "Chalkboard SE", "Arial Rounded MT Bold", sans-serif`)

### LP-5: Performance
- Loads in < 2 seconds on a modern device
- No console errors or warnings
- No external CDN, API calls, or network requests
- Total asset size: < 500KB

## Technical Requirements

### File Structure
```
index.html              ← Landing page
games/
  color-match/
    index.html
  animal-puzzle/
    index.html
  ...
css/
  shared.css            ← Shared styles imported by all pages
```

### Code Requirements
- Valid HTML5
- Vanilla ES6+ JavaScript — no frameworks, no build step
- Import shared CSS: `<link rel="stylesheet" href="css/shared.css">`
- Each game card links to its game: `<a href="games/color-match/index.html">`
- Touch targets: minimum 48x48px with 8px spacing

## Acceptance Criteria

- [ ] Landing page displays all 10 game cards in a responsive grid
- [ ] Each card has thumbnail, name, and emoji
- [ ] Clicking a card navigates to the game
- [ ] "Back to Games" button works from any game
- [ ] Design matches GR-2 (rounded corners, shadows, playful colors)
- [ ] Works on mobile (320px) and desktop (1920px)
- [ ] No console errors
- [ ] Loads in under 2 seconds

## Related Requirements

- GR-1: Landing Page (global requirement)
- GR-2: Visual Design (global requirement)
- GR-4: Responsive & Touch (global requirement)
- GR-5: Performance & Compatibility (global requirement)
