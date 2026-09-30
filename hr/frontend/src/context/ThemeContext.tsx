import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'dark' | 'light';
export type PortalMode = 'hr' | 'employee';

interface ThemeContextType {
  theme: Theme;
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Determine initial portal from URL, window port, or stored auth token
  const initialPortal: PortalMode = (() => {
    if (typeof window !== 'undefined') {
      try {
        // Clean up legacy single-theme key to avoid old dark/light conflicts
        localStorage.removeItem('theme');
      } catch {}

      const urlPortal = new URLSearchParams(window.location.search).get('portal');
      if (urlPortal === 'employee' || window.location.port === '3000' || window.location.port === '5174') {
        return 'employee';
      }
      try {
        const token = localStorage.getItem('hr_auth_token');
        if (token) {
          const parts = token.split('.');
          if (parts.length > 1) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload && payload.role === 'EMPLOYEE') {
              return 'employee';
            }
          }
        }
      } catch {}
    }
    return 'hr';
  })();

  const [portalMode, setPortalModeState] = useState<PortalMode>(initialPortal);

  // Default: Employee = 'light', HR = 'dark'
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const storageKey = initialPortal === 'employee' ? 'theme_employee' : 'theme_hr';
    const saved = localStorage.getItem(storageKey) as Theme;
    if (saved === 'light' || saved === 'dark') return saved;
    return initialPortal === 'employee' ? 'light' : 'dark';
  });

  // Apply DOM classes whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // When switching portals (HR vs Employee), apply the portal's default or saved theme
  const setPortalMode = useCallback((mode: PortalMode) => {
    setPortalModeState(mode);
    const storageKey = mode === 'employee' ? 'theme_employee' : 'theme_hr';
    const saved = localStorage.getItem(storageKey) as Theme;
    const targetTheme: Theme = (saved === 'light' || saved === 'dark')
      ? saved
      : (mode === 'employee' ? 'light' : 'dark');
    setThemeState(targetTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      const storageKey = portalMode === 'employee' ? 'theme_employee' : 'theme_hr';
      localStorage.setItem(storageKey, nextTheme);
      return nextTheme;
    });
  }, [portalMode]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    const storageKey = portalMode === 'employee' ? 'theme_employee' : 'theme_hr';
    localStorage.setItem(storageKey, t);
  }, [portalMode]);

  return (
    <ThemeContext.Provider value={{ theme, portalMode, setPortalMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

