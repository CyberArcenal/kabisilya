// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { themesAPI } from '../api/core/themes';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

// Apply theme by setting data-theme attribute on document root
const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme'); // or set to 'light' if you prefer
    // Optionally: root.setAttribute('data-theme', 'light');
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = useCallback(async () => {
    try {
      const res = await themesAPI.getCurrent();
      if (res.status && res.data) {
        const loadedTheme = res.data;
        setThemeState(loadedTheme);
        applyTheme(loadedTheme);
      } else {
        // Fallback to system preference or light
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        setThemeState(defaultTheme);
        applyTheme(defaultTheme);
      }
    } catch (err) {
      console.error('Failed to load theme', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTheme();

    // Listen for theme changes from other windows (e.g., settings changed)
    const unsubscribe = window.backendAPI?.on?.('theme:changed', (data: { theme: 'light' | 'dark' }) => {
      setThemeState(data.theme);
      applyTheme(data.theme);
    });

    // Optional: listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no explicit user theme is stored? Decide based on your logic.
      // For simplicity, we can ignore or implement a "follow system" setting later.
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      unsubscribe?.();
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, [loadTheme]);

  const setTheme = async (newTheme: 'light' | 'dark') => {
    try {
      await themesAPI.set(newTheme);
      setThemeState(newTheme);
      applyTheme(newTheme);
    } catch (err) {
      console.error('Failed to set theme', err);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  if (isLoading) {
    // Optional: render a minimal loading state or null to avoid flash
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};