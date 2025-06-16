# Theme System

This project includes a flexible theme system that makes it easy to switch color palettes across the entire application.

## Quick Start

### 1. Change the Active Theme

Edit `src/lib/theme.ts` and change the `activePalette` variable:

```typescript
// Change this line to switch themes
export const activePalette: PaletteName = 'ocean'; // or "forest" or "sunset"
```

### 2. Add New Color Palettes

Add new palettes to the `colorPalettes` object in `src/lib/theme.ts`:

```typescript
export const colorPalettes = {
  // ...existing palettes
  yourTheme: {
    name: 'Your Theme',
    primary: '#your-color',
    secondary: '#your-color',
    accent: '#your-color',
    neutral: '#your-color',
    background: '#your-color',
  },
};
```

## Available Palettes

### Ocean (Default)

- **Primary:** `#0d1b2a` (Deep navy)
- **Secondary:** `#1b263b` (Dark blue)
- **Accent:** `#415a77` (Steel blue)
- **Neutral:** `#778da9` (Blue gray)
- **Background:** `#e0e1dd` (Light gray)

### Forest

- Professional green-based palette
- Great for corporate/business themes

### Sunset

- Warm orange/yellow-based palette
- Great for creative/energetic themes

## Usage in Components

### Method 1: Import theme directly

```typescript
import { theme } from '@/lib/theme';

// Use in inline styles
<div style={{ backgroundColor: theme.primary }}>
  Content
</div>
```

### Method 2: Use ThemeProvider (Recommended)

```typescript
import { ThemeProvider } from '@/components/theme/theme-provider';

function MyPage() {
  return (
    <ThemeProvider palette="ocean">
      <YourContent />
    </ThemeProvider>
  );
}
```

### Method 3: Use the useTheme hook

```typescript
import { useTheme } from '@/components/theme/theme-provider';

function MyComponent() {
  const theme = useTheme('ocean');

  return (
    <div style={{ color: theme.primary }}>
      Themed content
    </div>
  );
}
```

## Development Tools

### Theme Switcher

Add a live theme switcher for development/testing:

```typescript
import { ThemeDemo } from '@/components/theme/theme-demo';

<ThemeDemo showSwitcher={true}>
  <YourPageContent />
</ThemeDemo>
```

This will add a floating theme switcher in the top-right corner.

## CSS Custom Properties

The theme system also generates CSS custom properties:

```css
:root {
  --color-primary: #0d1b2a;
  --color-secondary: #1b263b;
  --color-accent: #415a77;
  --color-neutral: #778da9;
  --color-background: #e0e1dd;
}
```

Use them in CSS files:

```css
.my-element {
  background-color: var(--color-primary);
  color: var(--color-background);
}
```

## Best Practices

1. **Consistent Usage:** Always use theme colors instead of hardcoded values
2. **Semantic Naming:** Use colors semantically (primary for main actions, accent for highlights, etc.)
3. **Accessibility:** Ensure sufficient contrast ratios when creating new palettes
4. **Testing:** Test all palettes to ensure they work well together

## Color Roles

- **Primary:** Main brand color, primary buttons, headers
- **Secondary:** Supporting text, secondary elements
- **Accent:** Highlights, call-to-action elements, links
- **Neutral:** Body text, borders, subtle backgrounds
- **Background:** Page backgrounds, card backgrounds

## Examples

See the landing page (`src/app/page.tsx`) for a comprehensive example of how to use the theme system throughout a page.
