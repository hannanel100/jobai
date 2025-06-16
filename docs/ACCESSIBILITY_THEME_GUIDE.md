# Accessibility-Enhanced Theme System

## Overview

The JobTracker theme system has been enhanced with comprehensive accessibility features, providing multiple color palettes designed to meet different accessibility needs and WCAG guidelines.

## 🎨 Available Palettes

### ✅ WCAG AA Compliant Palettes

#### Ocean (Default)

- **Use Case**: General business use, excellent readability
- **Compliance**: WCAG AA ✅
- **Characteristics**: Rich blue tones with excellent contrast ratios
- **Primary**: `#1e3a8a` (10.36:1 contrast)
- **Best For**: Default theme for most users

#### Professional

- **Use Case**: Corporate environments, maximum readability
- **Compliance**: WCAG AA ✅
- **Characteristics**: Near-black text with professional blue accents
- **Primary**: `#1f2937` (14.68:1 contrast)
- **Best For**: Business applications, formal settings

### 🎯 Specialized Accessibility Palettes

#### High Contrast

- **Use Case**: Users with low vision
- **Characteristics**: Pure black text, maximum contrast ratios
- **Primary**: `#000000` (21:1 contrast - perfect score)
- **Best For**: Users requiring maximum contrast

#### Colorblind Friendly

- **Use Case**: Users with color vision deficiencies
- **Characteristics**: Orange/blue/purple combinations, avoids red-green
- **Primary**: `#2c3e50` (10.98:1 contrast)
- **Best For**: Users with deuteranopia, protanopia, tritanopia

#### Ultra High Contrast

- **Use Case**: Users with severe visual impairments
- **Characteristics**: Maximum contrast with high-visibility accents
- **Primary**: `#000000` (21:1 contrast)
- **Best For**: Users requiring extreme contrast

## 🛠️ Implementation Guide

### Basic Usage

```typescript
import { theme, switchTheme, generateCSSVariables } from '@/lib/theme';

// Use current theme colors
<div style={{ color: theme.primary, backgroundColor: theme.background }}>
  Content with theme colors
</div>

// Switch theme programmatically
const result = switchTheme('highContrast');
console.log(result.accessibility); // View accessibility metrics
```

### Semantic Colors

The enhanced theme system includes semantic colors for consistent UI states:

```typescript
// Success states (green tones)
<div style={{ color: theme.success }}>Operation successful!</div>

// Warning states (amber/orange tones)
<div style={{ color: theme.warning }}>Warning message</div>

// Error states (red tones)
<div style={{ color: theme.error }}>Error occurred</div>

// Informational states (blue tones)
<div style={{ color: theme.info }}>Information notice</div>
```

### CSS Variables Integration

```typescript
import { applyCSSVariables } from '@/lib/theme';

// Apply theme as CSS custom properties
applyCSSVariables('professional');

// Use in CSS
.button {
  background-color: var(--color-primary);
  border: var(--border-accent);
  color: var(--color-background);
}

.button:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

### System Preference Detection

```typescript
import { detectSystemPreferences, getRecommendedPalette } from '@/lib/theme';

// Auto-detect user preferences
const preferences = detectSystemPreferences();

if (preferences?.prefersHighContrast) {
  switchTheme('highContrast');
} else if (preferences?.prefersColorScheme === 'dark') {
  switchTheme('professional');
}

// Or use the built-in recommendation engine
const recommendedPalette = getRecommendedPalette();
switchTheme(recommendedPalette);
```

## 🔍 Accessibility Testing

### Built-in Contrast Checking

```typescript
import { accessibilityHelpers } from '@/lib/theme';

// Check contrast ratio between two colors
const ratio = accessibilityHelpers.getContrastRatio('#1e3a8a', '#ffffff');
console.log(`Contrast ratio: ${ratio}:1`);

// Validate accessibility compliance
const check = accessibilityHelpers.checkAccessibility('#1e3a8a', '#ffffff');
console.log(`WCAG AA: ${check.wcagAA}, WCAG AAA: ${check.wcagAAA}`);

// Validate entire palette
const validation = accessibilityHelpers.validatePalette(theme);
console.log(validation.overallCompliance);
```

### WCAG Compliance Levels

- **WCAG AA**: 4.5:1 contrast ratio minimum (standard compliance)
- **WCAG AAA**: 7:1 contrast ratio minimum (enhanced compliance)
- **Large Text**: 3:1 contrast ratio minimum (18pt+ or 14pt+ bold)

## 🎯 Accessibility Recommendations

### For Different User Needs

| User Need              | Recommended Palette                | Features                                 |
| ---------------------- | ---------------------------------- | ---------------------------------------- |
| **General Use**        | Ocean, Professional                | WCAG AA compliant, business-friendly     |
| **Low Vision**         | High Contrast, Ultra High Contrast | Maximum contrast ratios (up to 21:1)     |
| **Color Blindness**    | Colorblind Friendly                | Orange/blue/purple combinations          |
| **Light Sensitivity**  | Professional                       | Darker tones, reduced brightness         |
| **Corporate/Business** | Professional                       | Conservative colors, maximum readability |

### Implementation Best Practices

1. **Always use semantic colors** for UI states (success, warning, error, info)
2. **Test with multiple palettes** during development
3. **Provide theme switcher** in user settings
4. **Respect system preferences** when possible
5. **Include focus indicators** with sufficient contrast

### Focus Management

```typescript
// Enhanced focus styles with theme integration
.focusable:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-focus-ring);
}

// High contrast focus for accessibility
.high-contrast .focusable:focus {
  outline: 3px solid #000000;
  background-color: #ffff00; // High contrast yellow
}
```

## 🧪 Testing Your Implementation

### Automated Accessibility Testing

```bash
# Run the accessibility test script
node test-accessibility-theme.js
```

### Manual Testing Checklist

- [ ] All text meets minimum contrast ratios
- [ ] Interactive elements have visible focus indicators
- [ ] Color is not the only way to convey information
- [ ] Semantic colors are consistent across the application
- [ ] Theme switching works correctly
- [ ] System preferences are respected

### Browser Developer Tools

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run Accessibility audit
4. Check for contrast ratio issues
5. Test with different themes

## 🚀 Advanced Features

### Dynamic Theme Switching

```typescript
// Theme switcher component example
const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('ocean');

  const handleThemeChange = (newTheme: PaletteName) => {
    const result = switchTheme(newTheme);
    setCurrentTheme(newTheme);

    // Show accessibility info to user
    if (result.accessibility.overallCompliance.wcagAA) {
      toast.success('Theme meets accessibility standards');
    }
  };

  return (
    <select value={currentTheme} onChange={(e) => handleThemeChange(e.target.value)}>
      <option value="ocean">Ocean (Default)</option>
      <option value="professional">Professional</option>
      <option value="highContrast">High Contrast</option>
      <option value="colorblindFriendly">Colorblind Friendly</option>
    </select>
  );
};
```

### Accessibility Monitoring

```typescript
// Monitor theme accessibility in production
const monitorAccessibility = () => {
  const validation = accessibilityHelpers.validatePalette(theme);

  if (!validation.overallCompliance.wcagAA) {
    console.warn('Current theme may not meet accessibility standards');
    // Optionally suggest high contrast theme
    return getRecommendedPalette();
  }

  return null;
};
```

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Universal Design](https://jfly.uni-koeln.de/color/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## 🤝 Contributing

When adding new colors or palettes:

1. Test contrast ratios with the built-in helpers
2. Ensure WCAG AA compliance minimum
3. Consider color-blind users
4. Update documentation and tests
5. Run accessibility validation

---

**Note**: This enhanced theme system provides a solid foundation for accessible design. Always test with real users and assistive technologies when possible.
