# FunWebGames

A collection of 10 fun, colorful web games designed for 6-year-old children. This project is developed autonomously by a multi-agent AI pipeline that operates continuously across multiple days.

## Project Goal

Build a fully functional website with **10 engaging, age-appropriate games** for 6-year-olds. Every game must be playable in a browser, require no installation, and include clear instructions that a young child (or their parent) can follow.

## Agent Development Pipeline

This project is built by three autonomous AI agents running on a scheduler:

```
┌─────────────────────────────────────────────────────────────┐
│                    Scheduler Daemon                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PM Agent     │  │  Dev Agent   │  │  Reviewer Agent  │  │
│  │  Every 1 hr   │  │  Every 2 hrs │  │  Every 4 hrs     │  │
│  │               │  │              │  │                   │  │
│  │ • Write reqs  │  │ • Read reqs  │  │ • Code review     │  │
│  │ • Cut issues  │  │ • Implement  │  │ • Run tests       │  │
│  │ • Prioritize  │  │ • Push code  │  │ • Fix bugs        │  │
│  │ • Track prog. │  │ • Close issu.│  │ • Report issues   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│              GitHub: FunWebGames repo                        │
│              (commits, issues, PRs)                           │
└─────────────────────────────────────────────────────────────┘
```

### PM Agent (runs every 1 hour)
- Reviews current project state and progress
- Writes and updates requirements incrementally in `docs/requirements/`
- Creates GitHub issues for new features, improvements, and tasks
- Prioritizes the backlog based on what's been completed
- Tracks overall progress toward the 10-game goal

### Developer Agent (runs every 2 hours)
- Reads the latest requirements and open issues
- Implements games and features incrementally
- Writes clean, well-structured code
- Pushes commits with descriptive summaries
- Closes issues upon completion

### Code Reviewer / Tester Agent (runs every 4 hours)
- Reviews recent code changes for quality and correctness
- Tests each game manually (loads in browser, verifies functionality)
- Files bug reports as GitHub issues
- Fixes critical bugs directly
- Verifies games match the requirements

## Tech Stack

- **HTML5 + CSS3 + vanilla JavaScript** — no build step, no dependencies
- **Single `index.html`** — landing page with game launcher
- **One folder per game** — `games/<game-name>/index.html`
- **Static site** — can be opened directly via `file://` or served with any HTTP server

## Project Structure

```
FunWebGames/
├── index.html              # Landing page — game launcher with thumbnails
├── css/
│   └── shared.css          # Shared styles (colors, fonts, layout)
├── games/
│   ├── color-match/        # Game 1: Color Matching Memory
│   ├── animal-puzzle/      # Game 2: Animal Jigsaw Puzzle
│   ├── bubble-pop/         # Game 3: Bubble Pop (Numbers & Letters)
│   ├── shape-builder/      # Game 4: Shape Builder
│   ├── counting-garden/    # Game 5: Counting Garden
│   ├── letter-explorer/    # Game 6: Letter Explorer
│   ├── music-maker/        # Game 7: Music Maker
│   ├── maze-runner/        # Game 8: Maze Runner
│   ├── star-catcher/       # Game 9: Star Catcher
│   └── dress-up/           # Game 10: Dress Up
├── assets/
│   ├── images/             # Shared images, icons, sprites
│   └── sounds/             # Shared sound effects, music
├── docs/
│   ├── REQUIREMENTS.md     # Master requirements document
│   └── requirements/       # Per-game requirement files (written by PM agent)
└── tests/
    └── checklist.md        # Manual test checklist for each game
```

## How to Run Locally

```bash
# Option 1: Python (built-in)
cd FunWebGames
python3 -m http.server 8080
# Open http://localhost:8080

# Option 2: Node.js
npx serve .
# Open http://localhost:3000

# Option 3: Just open the file
open index.html
```

## Design Principles

1. **Kid-friendly**: Large buttons, bright colors, forgiving interactions, no small text
2. **No reading required**: Icons, images, and sounds guide the child — minimal text, and any text has audio cues
3. **Encouraging**: Positive feedback on every action — stars, sounds, animations. No "wrong" — just "try again!"
4. **Short sessions**: Each game round is 1-3 minutes. Kids can stop anytime.
5. **Touch-friendly**: Works on tablets. All interactions are tap/click/drag — no keyboard required.
6. **Safe**: No external links, no ads, no data collection, no network requests during gameplay.
7. **Accessible**: High contrast colors, large touch targets (min 48px), simple audio cues.

## Success Criteria

- [ ] 10 fully functional games accessible from the landing page
- [ ] Each game has clear, visual instructions (how to play)
- [ ] All games work in Chrome, Safari, and Firefox (desktop + tablet)
- [ ] No external dependencies — works offline after initial load
- [ ] Each game has a test checklist in `tests/checklist.md`
- [ ] All code passes basic quality review (no console errors, no broken assets)
- [ ] Landing page shows all 10 games with thumbnails and one-click launch
- [ ] Positive, encouraging UX throughout — no negative feedback for wrong answers

## License

MIT
