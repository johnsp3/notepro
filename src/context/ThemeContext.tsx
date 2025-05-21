import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import defaultTheme from '../theme';

// Define theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeVariant = 'default' | 'apple';

interface ThemeSettings {
  mode: ThemeMode;
  variant: ThemeVariant;
  followSystem: boolean;
}

interface ThemeContextType {
  settings: ThemeSettings;
  currentTheme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeVariant: (variant: ThemeVariant) => void;
  toggleFollowSystem: () => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Local storage keys
const THEME_SETTINGS_KEY = 'notepro-theme-settings';

// Default settings
const defaultSettings: ThemeSettings = {
  mode: 'system',
  variant: 'default',
  followSystem: true,
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize settings from localStorage if available
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    try {
      const savedSettings = localStorage.getItem(THEME_SETTINGS_KEY);
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error('Failed to parse saved theme settings:', error);
      return defaultSettings;
    }
  });

  // Detect system theme preference
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Determine the actual theme mode based on settings
  const actualThemeMode = settings.followSystem ? systemTheme : settings.mode === 'system' ? 'light' : settings.mode;

  // Create theme based on settings
  const currentTheme = React.useMemo(() => {
    let themeConfig: ThemeOptions;
    
    // Select theme variant
    if (settings.variant === 'apple') {
      // Apple-inspired theme variant
      themeConfig = {
        palette: {
          mode: actualThemeMode,
          primary: {
            light: '#0071e3',
            main: '#0066CC', // Apple blue
            dark: '#004999',
            contrastText: '#ffffff',
          },
          secondary: {
            light: '#ef6c00',
            main: '#ff9500', // Apple orange
            dark: '#c75b00',
            contrastText: '#ffffff',
          },
          background: {
            default: actualThemeMode === 'light' ? '#f5f5f7' : '#1d1d1f', // Apple light/dark gray
            paper: actualThemeMode === 'light' ? '#ffffff' : '#2d2d2f',
          },
          text: {
            primary: actualThemeMode === 'light' ? '#1d1d1f' : '#f5f5f7',
            secondary: actualThemeMode === 'light' ? '#86868b' : '#a1a1a6',
          },
          error: {
            main: '#ff3b30', // Apple red
          },
          warning: {
            main: '#ff9500', // Apple orange
          },
          info: {
            main: '#0066CC', // Apple blue
          },
          success: {
            main: '#34c759', // Apple green
          },
          divider: actualThemeMode === 'light' ? '#d2d2d7' : '#424245',
          action: {
            active: '#007aff',
            hover: actualThemeMode === 'light' ? 'rgba(0, 122, 255, 0.08)' : 'rgba(0, 122, 255, 0.15)',
            selected: actualThemeMode === 'light' ? 'rgba(0, 122, 255, 0.12)' : 'rgba(0, 122, 255, 0.20)',
            disabled: actualThemeMode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
            disabledBackground: actualThemeMode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          }
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            'San Francisco',
            'Helvetica Neue',
            'Helvetica',
            'Arial',
            'sans-serif'
          ].join(','),
          h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            letterSpacing: '-0.025em',
          },
          h2: {
            fontWeight: 700,
            fontSize: '2rem',
            letterSpacing: '-0.025em',
          },
          h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            letterSpacing: '-0.025em',
          },
          h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            letterSpacing: '-0.025em',
          },
          h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
          },
          h6: {
            fontWeight: 500,
            fontSize: '1rem',
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
          subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
          },
          subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 500,
                textTransform: 'none',
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
              containedPrimary: {
                backgroundColor: '#0066CC',
                '&:hover': {
                  backgroundColor: '#0071e3',
                },
                '&.Mui-disabled': {
                  backgroundColor: actualThemeMode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                  color: actualThemeMode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
                },
              },
            },
          },
          // Improve processing state visibility
          MuiCircularProgress: {
            styleOverrides: {
              root: {
                color: '#0071e3',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
              elevation1: {
                boxShadow: actualThemeMode === 'light' 
                  ? '0px 2px 8px rgba(0, 0, 0, 0.05)' 
                  : '0px 2px 8px rgba(0, 0, 0, 0.2)',
              },
            },
          },
        },
      };
    } else {
      // Use the default theme from theme/index.ts but with correct mode
      themeConfig = {
        ...defaultTheme,
        palette: {
          ...defaultTheme.palette,
          mode: actualThemeMode,
          // Update background colors for dark mode
          ...(actualThemeMode === 'dark' && {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#f5f5f5',
              secondary: '#aaaaaa',
            },
          }),
        },
      };
    }
    
    return createTheme(themeConfig);
  }, [settings.variant, actualThemeMode]);

  // Theme mode setter
  const setThemeMode = (mode: ThemeMode) => {
    setSettings(prev => {
      const newSettings: ThemeSettings = { ...prev, mode, followSystem: mode === 'system' };
      localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  };

  // Theme variant setter
  const setThemeVariant = (variant: ThemeVariant) => {
    setSettings(prev => {
      const newSettings = { ...prev, variant };
      localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  };

  // Toggle follow system setting
  const toggleFollowSystem = () => {
    setSettings(prev => {
      const followSystem = !prev.followSystem;
      const newSettings: ThemeSettings = { 
        ...prev, 
        followSystem,
        // If turning on follow system, set mode to 'system'
        mode: followSystem ? 'system' : prev.mode,
      };
      localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <ThemeContext.Provider value={{
      settings,
      currentTheme,
      setThemeMode,
      setThemeVariant,
      toggleFollowSystem,
    }}>
      <MuiThemeProvider theme={currentTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 