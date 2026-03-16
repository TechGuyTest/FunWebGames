# FunWebGames — Requirements

## Overview

Build 10 browser-based games for 6-year-old children. All games run as static HTML/CSS/JS with zero dependencies. The landing page (`index.html`) serves as a game launcher.

**Target audience**: Children aged 5-7, playing on a parent's laptop or tablet.

---

## Global Requirements

### GR-1: Landing Page
- Grid of game cards (2-3 per row on desktop, 1 per row on mobile)
- Each card shows: game thumbnail, game name, a fun emoji/icon
- Click/tap a card → opens the game in full viewport
- "Back to Games" button visible in every game
- Animated, colorful design — feels like a toy box
- No text that a 6-year-old can't skip — visual navigation only

### GR-2: Shared Visual Style
- Color palette: bright primary colors (red, blue, yellow, green) + pastels
- Font: rounded, playful sans-serif (system fonts: `"Comic Sans MS", "Chalkboard SE", "Arial Rounded MT Bold", sans-serif`)
- Minimum touch target: 48x48px for all interactive elements
- Rounded corners on everything (border-radius ≥ 12px)
- Subtle shadows for depth — feels tactile

### GR-3: Audio & Feedback
- Every tap/click produces a soft sound effect
- Correct action: cheerful chime + star/sparkle animation
- Wrong action: gentle "boop" — never harsh, never punishing
- Completion: celebration animation (confetti, stars) + "You did it!" audio
- Background music: optional, muted by default, toggle button in corner
- All audio uses Web Audio API or `<audio>` elements — no external libraries

### GR-4: Responsive & Touch
- Works on screens 320px to 1920px wide
- All interactions work with mouse click AND touch
- Drag-and-drop uses pointer events (works on both touch and mouse)
- No hover-dependent interactions (hover is enhancement only)
- Landscape and portrait orientations supported

### GR-5: Performance & Compatibility
- Each game loads in < 2 seconds on a modern device
- No console errors or warnings
- Works in Chrome 90+, Safari 15+, Firefox 90+
- No external CDN, API calls, or network requests during gameplay
- Total asset size per game: < 500KB (use CSS art, SVG, emoji, and canvas drawing over raster images)

### GR-6: Code Quality
- Each game is self-contained in its own folder: `games/<name>/index.html`
- Games can share CSS from `css/shared.css` via relative import
- JavaScript is vanilla ES6+ — no frameworks, no build step
- Code is readable, commented where logic is non-obvious
- Each HTML file is valid HTML5

---

## Game Specifications

### Game 1: Color Match Memory (`games/color-match/`)

**Concept**: Classic memory card-flip game with colored shapes.

**Gameplay**:
- Grid of face-down cards (4x3 for easy, 4x4 for medium, 6x4 for hard)
- Each card has a colored shape (red circle, blue star, green triangle, etc.)
- Tap to flip a card, tap another to find its match
- Matched pairs stay face-up with a sparkle
- Timer and move counter displayed (non-competitive — just for fun)
- "You won!" celebration when all pairs are found

**Difficulty**: 3 levels selectable from a simple picker (show 3 stars: ★ ★★ ★★★)

**Learning value**: Memory, pattern recognition, color naming

---

### Game 2: Animal Puzzle (`games/animal-puzzle/`)

**Concept**: Drag-and-drop jigsaw puzzle with cute animal pictures.

**Gameplay**:
- Image of an animal is split into 6 / 9 / 12 pieces (difficulty levels)
- Pieces are scattered around the play area
- Ghost outlines show where each piece goes
- Drag a piece near its correct position → it snaps into place
- Each correct placement triggers a happy sound
- When complete: the animal "comes alive" with a CSS animation + animal sound

**Animals**: Cat, Dog, Elephant, Panda, Lion, Giraffe (one per puzzle, randomized)

**Learning value**: Spatial reasoning, fine motor skills, animal recognition

---

### Game 3: Bubble Pop (`games/bubble-pop/`)

**Concept**: Floating bubbles with numbers and letters — pop the right ones.

**Gameplay**:
- Bubbles float up from the bottom of the screen
- A prompt at the top shows what to pop: "Pop the number 5!" or "Pop the letter A!"
- Tap the correct bubble → it pops with a satisfying animation
- Wrong bubble → gentle wobble, no penalty
- 10 rounds per session, score shown as collected stars
- Bubbles get faster as rounds progress

**Modes**: Numbers (1-10), Letters (A-Z), Colors ("Pop the red bubble!")

**Learning value**: Number recognition, letter recognition, color naming, reaction time

---

### Game 4: Shape Builder (`games/shape-builder/`)

**Concept**: Drag basic shapes onto a canvas to match a target picture.

**Gameplay**:
- Left side: shape palette (circles, squares, triangles, rectangles in various colors)
- Right side: target picture made of shapes (e.g., a house = square + triangle, a car = rectangles + circles)
- Drag shapes from palette to canvas, position them to match the target
- Shapes snap to a grid for easier placement
- "Show hint" button outlines where shapes should go
- 8-10 target pictures of increasing complexity

**Learning value**: Geometry basics, spatial reasoning, creativity

---

### Game 5: Counting Garden (`games/counting-garden/`)

**Concept**: Count objects in a garden scene and tap the right number.

**Gameplay**:
- A garden scene with flowers, butterflies, bees, fruits, etc.
- Prompt: "How many butterflies?" with number options (3 choices)
- Objects gently animate (butterflies flutter, flowers sway)
- Tap the correct number → objects light up one by one as they're "counted"
- 10 rounds with different objects and quantities (1-10)
- Stars awarded for correct answers

**Learning value**: Counting 1-10, number recognition, observation

---

### Game 6: Letter Explorer (`games/letter-explorer/`)

**Concept**: Interactive letter learning — see, hear, and trace letters.

**Gameplay**:
- Shows a large letter (A-Z) with an associated animal/object illustration
- "A is for Apple" — with audio pronunciation
- Trace the letter with your finger/mouse on a dotted guide path
- Tracing accuracy shown with color (green = on path, yellow = close, red = off path)
- "Next letter" arrow, or tap the letter carousel at the bottom
- Both uppercase and lowercase shown side by side
- Optional: phonics mode — plays the letter sound, not just the name

**Learning value**: Letter recognition, letter writing, phonics, vocabulary

---

### Game 7: Music Maker (`games/music-maker/`)

**Concept**: Tap colorful instruments to create music.

**Gameplay**:
- Grid of 8 instrument buttons (drum, xylophone, piano, tambourine, trumpet, guitar, bell, maracas)
- Each instrument is a large, colorful icon
- Tap → plays the instrument sound with a visual pulse animation
- "Record" mode: tap instruments in sequence, then play back your song
- "Magic song" button: plays a random pre-set melody for inspiration
- Tempo slider (slow/medium/fast) shown as a turtle-to-rabbit scale

**Learning value**: Rhythm, cause-and-effect, creativity, auditory discrimination

---

### Game 8: Maze Runner (`games/maze-runner/`)

**Concept**: Guide a cute character through simple mazes.

**Gameplay**:
- Top-down maze with a character (bunny, puppy, or kitty — player picks)
- Move character with arrow buttons on screen (no keyboard required)
- Or drag the character directly along valid paths
- Collectible stars along the path (bonus, not required)
- Reach the goal (a carrot, bone, or fish depending on character) → celebration
- 8-10 mazes of increasing difficulty
- Timer shown as a friendly hourglass (no pressure — just for fun)

**Learning value**: Problem solving, planning, spatial navigation

---

### Game 9: Star Catcher (`games/star-catcher/`)

**Concept**: Move a basket to catch falling stars.

**Gameplay**:
- Stars (and bonus items: moons, planets) fall from the top of the screen
- Player moves a basket left/right by dragging or using on-screen arrow buttons
- Catch a star → +1 point, sparkle effect
- Occasional "rainbow star" worth bonus points
- Avoid catching rain clouds (they slow you down briefly — no penalty)
- Round ends after 60 seconds or when 20 stars have fallen
- Score shown as collected star icons (not abstract numbers)

**Learning value**: Hand-eye coordination, reaction time, tracking moving objects

---

### Game 10: Dress Up (`games/dress-up/`)

**Concept**: Drag clothing and accessories onto a character.

**Gameplay**:
- A friendly character in the center (boy or girl, player picks)
- Categories: Hats, Tops, Bottoms, Shoes, Accessories (glasses, wings, wands)
- Swipe through items in each category, drag onto character
- Items snap to correct body position
- "Randomize" button → outfit surprise
- "Save outfit" → downloads a screenshot (canvas-based)
- "Fashion show" button → character does a spin animation
- 5+ items per category, bright and silly options

**Learning value**: Creativity, categorization, fine motor skills, self-expression

---

## Agent Workflow Requirements

These requirements govern how the three AI agents collaborate:

### AWR-1: PM Agent Behavior
- On each run, read `docs/REQUIREMENTS.md` and check GitHub issues
- Assess which games are complete, in progress, or not started
- Write per-game requirement files in `docs/requirements/<game-name>.md` with detailed specs
- Create GitHub issues for the next highest-priority work (label: `feature`, `game`, or `bug`)
- Update a progress tracker in `docs/PROGRESS.md`
- Commit and push all doc changes

### AWR-2: Developer Agent Behavior
- On each run, read open issues (sorted by priority), pick the top one
- Read the relevant requirement file in `docs/requirements/`
- Implement incrementally — one game or one major feature per run
- Write clean, working code — test by examining the output
- Commit with descriptive messages: `feat(game-name): description` or `fix(game-name): description`
- Close the issue in the commit message or via comment
- Push to main branch

### AWR-3: Reviewer Agent Behavior
- On each run, review all recent commits since last review
- For each game folder with code, verify:
  - HTML is valid and loads without errors
  - Game mechanics work as described in requirements
  - Visual design matches the global requirements (colors, touch targets, etc.)
  - No console errors
- File GitHub issues for bugs found (label: `bug`, include steps to reproduce)
- Fix critical bugs directly (broken games, missing assets)
- Update `tests/checklist.md` with test results
- Commit and push fixes

### AWR-4: Shared Conventions
- All agents use the same repo: `FunWebGames`
- Branch: `main` (no feature branches — agents work incrementally on main)
- Commit format: `<type>(<scope>): <description>` where type is `feat`, `fix`, `docs`, `test`, `style`
- Issues use labels: `feature`, `bug`, `docs`, `game`, `review`, `priority-high`
- Agents should `git pull` before starting work to get latest changes
- Agents should handle merge conflicts gracefully (pull, rebase, retry)
