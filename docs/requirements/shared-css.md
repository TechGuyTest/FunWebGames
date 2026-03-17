# Shared CSS Requirements

## Overview

Create a shared stylesheet (`css/shared.css`) that provides consistent styling across all games and the landing page. This ensures visual consistency and reduces code duplication.

## Functional Requirements

### SC-1: Color Palette
Define CSS custom properties for consistent colors:
- Primary colors: red, blue, yellow, green (bright, child-friendly)
- Pastel backgrounds: soft pink, light blue, mint green, lavender
- Semantic colors: success (green), warning (yellow), error (soft red)
- Neutral colors: white, light gray, dark gray for text

### SC-2: Typography
Define font stacks for:
- Headings: rounded, playful sans-serif
- Body text: readable sans-serif
- Numbers/letters in games: large, clear, child-friendly

### SC-3: Spacing System
Define consistent spacing values:
- `--space-xs`: 4px
- `--space-sm`: 8px
- `--space-md`: 16px
- `--space-lg`: 24px
- `--space-xl`: 32px
- Minimum touch target: 48x48px

### SC-4: Component Styles
Provide reusable classes for:
- `.btn`: Base button style with hover/active states
- `.card`: Card container with shadow and rounded corners
- `.back-btn`: "Back to Games" button (fixed position)
- `.celebration`: Animation class for success feedback
- `.hidden`: Utility class to hide elements

### SC-5: Animations
Define keyframe animations for:
- `pulse`: Gentle pulse for interactive elements
- `sparkle`: Star/sparkle effect for correct actions
- `confetti`: Celebration animation for completion
- `slide-in`: Smooth entrance animation
- `bounce`: Playful bounce for success

### SC-6: Responsive Utilities
Provide responsive design helpers:
- Mobile-first breakpoints
- Flexbox and grid utilities
- Hide/show based on viewport size

## Technical Requirements

### File Location
```
css/shared.css
```

### CSS Structure
```css
/* ===== CSS Custom Properties ===== */
:root {
  --color-primary-red: #FF6B6B;
  --color-primary-blue: #4ECDC4;
  /* ... more colors ... */
  
  --space-xs: 4px;
  --space-sm: 8px;
  /* ... more spacing ... */
  
  --border-radius: 12px;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.15);
}

/* ===== Base Styles ===== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Comic Sans MS", "Chalkboard SE", "Arial Rounded MT Bold", sans-serif;
  /* ... */
}

/* ===== Component Classes ===== */
.btn {
  /* ... */
}

.card {
  /* ... */
}

/* ===== Animations ===== */
@keyframes pulse {
  /* ... */
}

/* ===== Responsive Utilities ===== */
@media (max-width: 768px) {
  /* ... */
}
```

### Design Principles (GR-2)
- Clarity: Every style has a clear purpose
- Simplicity: Remove unnecessary decorations
- Depth: Use shadows and elevation for physical depth
- Color with purpose: Every color communicates state

## Acceptance Criteria

- [ ] `css/shared.css` created with all custom properties
- [ ] Color palette includes primary colors + pastels + semantic colors
- [ ] Typography stack defined for headings and body
- [ ] Spacing system with 5 levels (xs to xl)
- [ ] Component classes: `.btn`, `.card`, `.back-btn`, `.celebration`, `.hidden`
- [ ] Animations: `pulse`, `sparkle`, `confetti`, `slide-in`, `bounce`
- [ ] Responsive utilities for mobile/desktop
- [ ] No console errors when imported
- [ ] File size < 50KB

## Related Requirements

- GR-2: Visual Design (global requirement)
- GR-3: Audio & Feedback (global requirement) — animation classes support feedback
- GR-4: Responsive & Touch (global requirement)
- GR-6: Code Quality (global requirement)
