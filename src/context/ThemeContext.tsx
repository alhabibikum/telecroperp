import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type FontSize = 'small' | 'normal' | 'large' | 'xlarge';

interface ThemeContextType {
  theme: Theme;
  fontSize: FontSize;
  toggleTheme: () => void;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('telecorp_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    try {
      const saved = localStorage.getItem('telecorp_fontsize');
      if (saved === 'small' || saved === 'normal' || saved === 'large' || saved === 'xlarge') return saved;
    } catch {}
    return 'normal';
  });

  useEffect(() => {
    try {
      localStorage.setItem('telecorp_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('telecorp_fontsize', fontSize);
      if (fontSize === 'small') {
        document.documentElement.style.fontSize = '14px';
      } else if (fontSize === 'large') {
        document.documentElement.style.fontSize = '17.5px';
      } else if (fontSize === 'xlarge') {
        document.documentElement.style.fontSize = '19px';
      } else {
        document.documentElement.style.fontSize = '15.5px';
      }
    } catch {}
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  return (
    <ThemeContext.Provider value={{ theme, fontSize, toggleTheme, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
