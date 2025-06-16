'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette, Check } from 'lucide-react';

interface ThemePalette {
  name: string;
  displayName: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  wcagCompliant: boolean;
  colorblindFriendly: boolean;
  contrastRatio: number;
}

const themePalettes: Record<string, ThemePalette> = {
  ocean: {
    name: 'ocean',
    displayName: 'Ocean',
    primary: '#0ea5e9',
    secondary: '#0284c7',
    accent: '#0369a1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    wcagCompliant: true,
    colorblindFriendly: true,
    contrastRatio: 4.5,
  },
  professional: {
    name: 'professional',
    displayName: 'Professional',
    primary: '#1e40af',
    secondary: '#1e3a8a',
    accent: '#3730a3',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#d1d5db',
    wcagCompliant: true,
    colorblindFriendly: true,
    contrastRatio: 7.1,
  },
  forest: {
    name: 'forest',
    displayName: 'Forest',
    primary: '#059669',
    secondary: '#047857',
    accent: '#065f46',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    surface: '#f0fdf4',
    text: '#14532d',
    textSecondary: '#6b7280',
    border: '#d1fae5',
    wcagCompliant: true,
    colorblindFriendly: false,
    contrastRatio: 4.8,
  },
  highContrast: {
    name: 'highContrast',
    displayName: 'High Contrast',
    primary: '#000000',
    secondary: '#1a1a1a',
    accent: '#333333',
    success: '#006600',
    warning: '#cc6600',
    error: '#cc0000',
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#333333',
    border: '#666666',
    wcagCompliant: true,
    colorblindFriendly: true,
    contrastRatio: 21,
  },
};

// Predefined utility classes using CSS variables
export const themeClasses = {
  // Primary button styles
  buttonPrimary:
    'bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200 shadow-sm hover:shadow-md',

  // Secondary button styles
  buttonSecondary:
    'bg-[var(--theme-secondary)] hover:bg-[var(--theme-accent)] text-white transition-colors duration-200',

  // Outline button styles
  buttonOutline:
    'border border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200',

  // Ghost button styles
  buttonGhost:
    'text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 transition-colors duration-200',

  // Destructive button styles
  buttonDestructive:
    'bg-[var(--theme-error)] hover:bg-red-700 text-white transition-colors duration-200',

  // Text colors
  textPrimary: 'text-[var(--theme-text)]',
  textSecondary: 'text-[var(--theme-text-secondary)]',
  textAccent: 'text-[var(--theme-accent)]',

  // Background colors
  bgSurface: 'bg-[var(--theme-surface)]',
  bgPrimary: 'bg-[var(--theme-primary)]',

  // Border colors
  borderDefault: 'border-[var(--theme-border)]',
  borderAccent: 'border-[var(--theme-accent)]',

  // Interactive states with improved animations
  interactive:
    'transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]',
  focusRing:
    'focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:ring-offset-2',
} as const;

interface ThemeContextType {
  currentTheme: ThemePalette;
  setTheme: (themeName: string) => void;
  availableThemes: ThemePalette[];
  classes: typeof themeClasses;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function setThemeVariables(palette: ThemePalette): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Set all theme variables
  root.style.setProperty('--theme-primary', palette.primary);
  root.style.setProperty('--theme-secondary', palette.secondary);
  root.style.setProperty('--theme-accent', palette.accent);
  root.style.setProperty('--theme-success', palette.success);
  root.style.setProperty('--theme-warning', palette.warning);
  root.style.setProperty('--theme-error', palette.error);
  root.style.setProperty('--theme-surface', palette.surface);
  root.style.setProperty('--theme-text', palette.text);
  root.style.setProperty('--theme-text-secondary', palette.textSecondary);
  root.style.setProperty('--theme-border', palette.border);
}

function getCurrentTheme(): ThemePalette {
  const savedTheme =
    typeof window !== 'undefined' ? localStorage.getItem('theme') : null;

  return themePalettes[savedTheme || 'ocean'] || themePalettes.ocean;
}

interface CSSVariableThemeProviderProps {
  children: ReactNode;
}

export function CSSVariableThemeProvider({
  children,
}: CSSVariableThemeProviderProps) {
  const [currentTheme, setCurrentThemeState] = useState<ThemePalette>(() =>
    getCurrentTheme()
  );

  const setTheme = (themeName: string) => {
    const newTheme = themePalettes[themeName];
    if (newTheme) {
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', themeName);
      }

      // Set CSS variables
      setThemeVariables(newTheme);
      setCurrentThemeState(newTheme);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    setThemeVariables(currentTheme);
  }, [currentTheme]);

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: Object.values(themePalettes),
    classes: themeClasses,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a CSSVariableThemeProvider');
  }
  return context;
}

// Improved theme switcher component
export function CSSVariableThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes, classes } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${classes.buttonOutline} ${classes.focusRing}`}
        >
          <Palette className="h-4 w-4 mr-2" />
          {currentTheme.displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableThemes.map(theme => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => setTheme(theme.name)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-[var(--theme-primary)]" />
              <div>
                <span className="font-medium">{theme.displayName}</span>
                {theme.wcagCompliant && (
                  <div className="text-xs text-green-600">WCAG AA</div>
                )}
              </div>
            </div>
            {currentTheme.name === theme.name && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
