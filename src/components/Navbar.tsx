
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6", 
        scrolled ? "glass shadow-sm backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            InvestSlice
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="#home" 
            className="text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            Home
          </a>
          <a 
            href="#simulation" 
            className="text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            Simulation
          </a>
          <a 
            href="#about" 
            className="text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            About
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <a 
            href="#simulation" 
            className="button-primary hidden sm:block"
          >
            Start Simulation
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
