'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

type AppstateType = { theme: Theme; isInitialized: boolean };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fix: Move localStorage read into the state initialization function
  const [appState, setAppState] = useState<AppstateType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      return {
        theme: savedTheme || 'light',
        isInitialized: true,
      };
    }
    return {
      theme: 'light',
      isInitialized: false,
    };
  });

  // The first useEffect that caused the lint error is now safely REMOVED!

  // This second effect is perfect and handles syncing state changes back to DOM/Storage
  useEffect(() => {
    if (appState.isInitialized) {
      localStorage.setItem('theme', appState.theme);
      if (appState.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [appState.theme, appState.isInitialized]);

  const toggleTheme = () => {
    setAppState((prevAppState) => ({
      ...prevAppState,
      theme: prevAppState.theme === 'light' ? 'dark' : 'light',
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme: appState.theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
