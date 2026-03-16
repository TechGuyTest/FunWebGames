# Test Checklist

## How to Test

1. Serve the project: `python3 -m http.server 8080`
2. Open `http://localhost:8080` in Chrome, Safari, or Firefox
3. Run through each game's checklist below

---

## Landing Page

- [ ] All 10 game cards visible
- [ ] Each card has a thumbnail/icon and game name
- [ ] Clicking a card opens the game
- [ ] Responsive: works on 320px, 768px, and 1920px widths
- [ ] No console errors

## Game 1: Color Match Memory
- [ ] Cards flip on tap
- [ ] Matched pairs stay face-up
- [ ] Unmatched pairs flip back after 1 second
- [ ] Completion celebration when all matched
- [ ] Sound effects work
- [ ] 3 difficulty levels work
- [ ] "Back to Games" button works

## Game 2: Animal Puzzle
- [ ] Pieces can be dragged
- [ ] Pieces snap to correct position
- [ ] Completion triggers animal animation + sound
- [ ] Works with touch (drag)
- [ ] "Back to Games" button works

## Game 3: Bubble Pop
- [ ] Bubbles float upward
- [ ] Correct bubble pops on tap
- [ ] Wrong bubble wobbles (no penalty)
- [ ] 10 rounds complete with score
- [ ] Number, letter, and color modes work
- [ ] "Back to Games" button works

## Game 4: Shape Builder
- [ ] Shapes can be dragged from palette
- [ ] Shapes snap to grid on canvas
- [ ] Target picture is clear
- [ ] Hint button works
- [ ] Multiple target pictures available
- [ ] "Back to Games" button works

## Game 5: Counting Garden
- [ ] Garden objects animate
- [ ] Number choices displayed
- [ ] Correct answer triggers count-up animation
- [ ] 10 rounds work
- [ ] "Back to Games" button works

## Game 6: Letter Explorer
- [ ] Letter shown with illustration and audio
- [ ] Letter tracing works with mouse/touch
- [ ] Tracing accuracy feedback (color)
- [ ] Letter carousel navigation works
- [ ] Uppercase and lowercase shown
- [ ] "Back to Games" button works

## Game 7: Music Maker
- [ ] All 8 instruments produce sound on tap
- [ ] Visual pulse animation on tap
- [ ] Record mode captures sequence
- [ ] Playback works
- [ ] Tempo slider changes speed
- [ ] "Back to Games" button works

## Game 8: Maze Runner
- [ ] Character moves with on-screen arrows
- [ ] Character cannot pass through walls
- [ ] Stars collectible along path
- [ ] Goal reached triggers celebration
- [ ] Multiple mazes available
- [ ] "Back to Games" button works

## Game 9: Star Catcher
- [ ] Basket moves with drag/arrows
- [ ] Stars fall from top
- [ ] Catching star adds to score
- [ ] Rainbow star gives bonus
- [ ] Round ends after timer/count
- [ ] "Back to Games" button works

## Game 10: Dress Up
- [ ] Items can be dragged onto character
- [ ] Items snap to correct position
- [ ] Category switching works
- [ ] Randomize button works
- [ ] Save/screenshot works
- [ ] "Back to Games" button works

---

## Cross-Game Checks
- [ ] All games: no console errors
- [ ] All games: touch interactions work
- [ ] All games: "Back to Games" returns to landing page
- [ ] All games: sound effects present and appropriate
- [ ] All games: celebration on completion
- [ ] All games: minimum 48px touch targets
- [ ] Overall: site works offline (no network requests during gameplay)
