# Mobile-Friendly UI Implementation Plan

## Objective
Enhance the responsiveness of the Pantau Pendidikan web application to ensure a seamless experience on mobile devices (smartphones and tablets).

## Key Areas of Improvement

### 1. Header & Navigation
- **Problem:** Navigation links overflow horizontally on small screens.
- **Solution:** 
  - Add a mobile-friendly navigation pattern for screens < 768px.
  - Implement a mobile-only overlay or drawer for navigation links.
  - Alternatively, use a horizontally scrollable navigation bar for a "dashboard" feel.

### 2. Stats Strip (`HomePage.module.css`)
- **Problem:** `border-right` on stats items looks broken when wrapped.
- **Solution:**
  - Remove `border-right` on screens < 640px.
  - Add `border-bottom` or adjust padding to create visual separation between wrapped items.
  - Adjust width to `50%` to show 2 items per row on mobile.

### 3. Hero & Search Box (`HomePage.module.css`)
- **Problem:** Large padding and fixed layout in the search box.
- **Solution:**
  - Use `flex-direction: column` for the `.searchBox` container on screens < 480px.
  - Set the `.searchButton` width to `100%` and add a top margin.
  - Adjust `heroTitle` clamp values if necessary.

### 4. Grid Layouts (`HomePage.module.css`)
- **Problem:** `minmax(262px, 1fr)` might be too wide for some small phones after padding.
- **Solution:**
  - Update `queryGrid` and `whyGrid` to use `minmax(240px, 1fr)`.
  - Reduce main container padding from `2.5rem` to `1rem` on mobile.

### 5. Result Panel & Charts (`HomePage.module.css` & `Charts/index.jsx`)
- **Problem:** Result content grid and SVGs might become unreadable or cramped.
- **Solution:**
  - Force `grid-template-columns: 1fr` for `.resultContent` on screens < 768px to stack text and charts.
  - Ensure all SVGs have `preserveAspectRatio="xMidYMid meet"`.
  - Conditionally hide some X-axis labels on small screens in `Charts/index.jsx`.

## Implementation Steps

### Phase 1: CSS Refactoring
1. Update `Header.module.css` with media queries for navigation.
2. Update `HomePage.module.css` with media queries for Hero, SearchBox, Stats, and Grids.
3. Update `index.css` for global mobile-first utility classes.

### Phase 2: Component Updates
1. Modify `Header.jsx` to include a mobile menu toggle state and UI.
2. Update `Charts/index.jsx` to handle responsive label density.
3. Update `HomePage.jsx` to adjust padding and layout props if needed.

## Verification & Testing
- Use Chrome DevTools to test at various resolutions:
  - 320px (iPhone SE)
  - 375px (iPhone 12/13/14)
  - 414px (iPhone XR/XS Max)
  - 768px (iPad/Tablet)
- Verify that no horizontal scrollbars appear.
- Ensure all buttons and links remain "tappable" (minimum 44x44px target area).
