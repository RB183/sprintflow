import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const storageKey = 'sprintflow_theme';

function getInitialTheme() {
  const savedTheme = localStorage.getItem(storageKey);
  // Default strictly to 'light'; user must explicitly toggle to 'dark'
  if (savedTheme === 'dark') return 'dark';
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(storageKey, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
