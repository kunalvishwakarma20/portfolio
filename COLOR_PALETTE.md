# Website Color Palette

This document outlines the complete color palette used throughout the website.

## Primary Colors

### Background Colors
- **Primary Black**: `#030412` - Main background color
- **Midnight**: `#06091f` - Secondary dark background
- **Navy**: `#161a31` - Dark blue-gray background
- **Indigo**: `#1f1e39` - Deep indigo background
- **Storm**: `#282b4b` - Storm blue-gray background

## Accent Colors

### Blue Theme (Primary Accent - Used Throughout)
- **Blue (Royal)**: `#1725D1` - Primary blue accent (used in hero blob, buttons, and highlights)
- **Blue Light (Lavender)**: `#3b4df0` - Lighter blue variant for gradients and highlights
- **Blue Dark**: `#0f1a9f` - Darker variant for depth
- **Blue Medium**: `#2563eb` - Medium blue for borders and glows

### Green/Mint Theme
- **Mint**: `#57db96` - Fresh mint green accent
- **Mint Light**: `#7ae8b0` - Lighter mint variant
- **Mint Dark**: `#3db875` - Darker mint variant

### Warm Accents
- **Orange**: `#cc6033` - Warm orange accent
- **Sand**: `#d6995c` - Sandy beige accent
- **Coral**: `#ea4884` - Coral pink accent
- **Fuchsia**: `#ca2f8c` - Fuchsia accent

## Hero Section Background

The hero section uses a solid dark black background:
- **Background**: `#000000` (Pure Black)

This creates a clean, dark backdrop that makes the blue blob stand out prominently.

## Color Usage Guidelines

### Hero Section
- **Blob Color**: `#1725D1` (Blue) - Main 3D blob element
- **Background**: Pure black (`#000000`) - Solid dark black background
- **Text**: White and neutral grays for contrast

### General Usage
- **Primary Background**: `#030412`
- **Card Backgrounds**: Use `storm` or `indigo` for subtle elevation
- **Accent Highlights**: Use `royal` (blue) or `lavender` (blue light) for interactive elements, buttons, and gradients
- **Timeline & Progress**: Use blue colors (`blue-500`, `blue-400`) for timeline indicators and progress bars
- **Warm Accents**: Use `orange`, `coral`, or `fuchsia` sparingly for emphasis

## Color Variables (CSS)

All colors are defined in `src/index.css` using CSS custom properties:

```css
--color-primary: #030412;
--color-midnight: #06091f;
--color-navy: #161a31;
--color-indigo: #1f1e39;
--color-storm: #282b4b;
--color-aqua: #33c2cc;
--color-mint: #57db96;
--color-royal: #1725D1;  /* Blue - Primary accent */
--color-lavender: #3b4df0;  /* Blue Light - Secondary accent */
--color-orange: #cc6033;
--color-sand: #d6995c;
--color-coral: #ea4884;
--color-fuchsia: #ca2f8c;
```

## Notes

- **Purple colors have been completely removed** from the entire website
- **Royal** (`#5c33cc` → `#1725D1`) and **Lavender** (`#7a57db` → `#3b4df0`) have been replaced with blue colors
- The entire website now uses a **consistent dark blue theme** throughout all components
- All purple gradients, borders, glows, and accents have been replaced with blue equivalents
- The hero section uses a vibrant blue theme (`#1725D1`) for a modern, professional look
- All colors are optimized for dark mode interfaces

