# Animal Puzzle Game Requirements

## Overview

Drag-and-drop jigsaw puzzle with cute animal pictures. Children drag puzzle pieces to their correct positions to complete animal images.

## Functional Requirements

### AP-1: Puzzle Grid
- Image of an animal split into pieces
- 3 difficulty levels:
  - Easy: 6 pieces (2x3 grid)
  - Medium: 9 pieces (3x3 grid)
  - Hard: 12 pieces (3x4 grid)
- Difficulty selector shown as 3 stars: ★ ★★ ★★★

### AP-2: Animal Images
- 6 animals: Cat, Dog, Elephant, Panda, Lion, Giraffe
- One animal per puzzle session (randomized)
- Cute, child-friendly illustrations
- High contrast, clear outlines for piece boundaries

### AP-3: Gameplay Mechanics
- Pieces scattered around the play area
- Ghost outlines show where each piece goes
- Drag a piece near correct position → snaps into place
- Snap radius: ~20px tolerance for child-friendly play
- Each correct placement: happy sound + small animation
- Puzzle complete: animal "comes alive" with CSS animation + animal sound

### AP-4: Drag and Drop
- Works with mouse AND touch (pointer events)
- Piece follows finger/cursor while dragging
- Piece slightly scales up while dragging (1.1x)
- Piece has subtle shadow while dragging (elevation)
- Invalid drop: piece returns to original position
- Valid drop: piece snaps to outline with animation

### AP-5: Audio Feedback
- Pick up piece: soft "lift" sound
- Correct placement: cheerful chime
- Puzzle complete: animal sound + celebration music
- Background music: optional, muted by default

### AP-6: Visual Feedback
- Correct placement: piece glows briefly
- Puzzle complete: animal animation (blink, wiggle, or bounce)
- Progress indicator: shows how many pieces placed (e.g., "5/9")
- "Back to Games" button always visible

## Technical Requirements

### File Structure
```
games/animal-puzzle/
  index.html          ← Main game page
  style.css           ← Game-specific styles
  script.js           ← Game logic with pointer events
  assets/
    sounds/
    images/
      animals/        ← SVG animal illustrations
```

### Code Requirements
- Import shared CSS
- Vanilla ES6+ JavaScript
- Use Pointer Events for drag-and-drop (works on touch and mouse)
- SVG for animal images (scalable, small file size)
- CSS animations for piece snap and completion
- No external dependencies
- Total asset size: < 500KB

### Touch Requirements
- Touch targets: pieces minimum 48x48px
- Drag area: full viewport
- Prevent scroll while dragging piece
- Multi-touch safe (ignore extra touches)

## Acceptance Criteria

- [ ] Puzzle displays with correct number of pieces for difficulty
- [ ] Animal image is randomized from 6 options
- [ ] Pieces can be dragged with mouse and touch
- [ ] Pieces snap to correct position with ~20px tolerance
- [ ] Ghost outlines visible for all pieces
- [ ] Correct placement triggers sound and animation
- [ ] Puzzle completion triggers animal animation + sound
- [ ] Progress indicator shows pieces placed
- [ ] "Back to Games" button works
- [ ] Difficulty selector changes piece count
- [ ] Works on mobile (320px) and desktop (1920px)
- [ ] No console errors
- [ ] Loads in under 2 seconds

## Learning Value

- Spatial reasoning
- Fine motor skills
- Animal recognition
- Problem solving

## Related Requirements

- GR-2: Visual Design (global requirement)
- GR-3: Audio & Feedback (global requirement)
- GR-4: Responsive & Touch (global requirement)
- GR-5: Performance & Compatibility (global requirement)
