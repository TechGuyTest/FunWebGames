# Color Match Memory Game Requirements

## Overview

Classic memory card-flip game with colored shapes. Children flip cards to find matching pairs of colored shapes.

## Functional Requirements

### CM-1: Game Grid
- Grid of face-down cards
- 3 difficulty levels:
  - Easy: 4x3 grid (6 pairs)
  - Medium: 4x4 grid (8 pairs)
  - Hard: 6x4 grid (12 pairs)
- Difficulty selector shown as 3 stars: ★ ★★ ★★★

### CM-2: Card Design
- Each card has a colored shape on one side
- Shapes: circle, star, triangle, square, heart, diamond
- Colors: red, blue, green, yellow, purple, orange
- Face-down: uniform back design (colorful pattern)
- Face-up: shows the colored shape clearly
- Card size: minimum 80x80px on desktop, 60x60px on mobile

### CM-3: Gameplay Mechanics
- Tap to flip a card (flip animation)
- Tap another card to find its match
- Matched pairs: stay face-up with sparkle animation
- Mismatched pair: flip back after 1 second
- Timer displayed (non-competitive, just for fun)
- Move counter displayed
- "You won!" celebration when all pairs found

### CM-4: Audio Feedback
- Card flip: soft "flip" sound
- Match found: cheerful chime + sparkle sound
- Wrong match: gentle "boop"
- Game complete: celebration music + "You did it!" audio
- Background music: optional, muted by default

### CM-5: Visual Feedback
- Card flip: smooth 3D rotation animation
- Match found: star/sparkle particles
- Game complete: confetti animation
- Timer and move counter update smoothly

### CM-6: Navigation
- "Back to Games" button in top-left or top-right corner
- Difficulty selector accessible but not intrusive
- Restart button after game completion

## Technical Requirements

### File Structure
```
games/color-match/
  index.html          ← Main game page
  style.css           ← Game-specific styles (imports shared.css)
  script.js           ← Game logic
  assets/
    sounds/           ← Audio files (or use Web Audio API)
    images/           ← SVG shapes (or draw with canvas/CSS)
```

### Code Requirements
- Import shared CSS: `<link rel="stylesheet" href="../../css/shared.css">`
- Vanilla ES6+ JavaScript — no frameworks
- Use CSS for card flip animation (transform: rotateY)
- Use Web Audio API or `<audio>` elements for sounds
- No external CDN or network requests
- Total asset size: < 500KB

### Accessibility
- Touch targets: minimum 48x48px
- Works with mouse click AND touch
- No hover-dependent interactions
- High contrast between cards and background

## Acceptance Criteria

- [ ] Game grid displays correctly at all 3 difficulty levels
- [ ] Cards flip with smooth animation
- [ ] Matching logic works correctly
- [ ] Matched pairs stay face-up with sparkle
- [ ] Mismatched cards flip back after 1 second
- [ ] Timer and move counter update correctly
- [ ] "You won!" celebration triggers on completion
- [ ] Audio feedback for all actions
- [ ] "Back to Games" button works
- [ ] Difficulty selector changes grid size
- [ ] Works on mobile (320px) and desktop (1920px)
- [ ] No console errors
- [ ] Loads in under 2 seconds

## Learning Value

- Memory skills
- Pattern recognition
- Color naming
- Shape recognition

## Related Requirements

- GR-2: Visual Design (global requirement)
- GR-3: Audio & Feedback (global requirement)
- GR-4: Responsive & Touch (global requirement)
- GR-5: Performance & Compatibility (global requirement)
