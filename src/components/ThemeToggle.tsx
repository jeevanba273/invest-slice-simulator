
import React from 'react';
import { useTheme } from './ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative h-8 w-16 rounded-full p-1 transition-colors duration-300 focus:outline-none",
        theme === 'dark' 
          ? 'bg-primary/20 border border-primary/30'
          : 'bg-secondary/80 border border-secondary'
      )}
      aria-label="Toggle theme"
    >
      <div
        className={cn(
          "absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full transform transition-all duration-500",
          theme === 'dark' 
            ? 'translate-x-8 bg-primary' 
            : 'translate-x-0 bg-white shadow-md'
        )}
      >
        {theme === 'dark' ? (
          <Moon className="h-4 w-4 text-white transform transition-transform hover:rotate-12" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 transform transition-transform hover:rotate-90" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

export default ThemeToggle;
