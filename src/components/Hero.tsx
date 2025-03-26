
import React, { useEffect, useRef } from 'react';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;
      
      // Calculate mouse position as percentage of screen
      const x = clientX / innerWidth;
      const y = clientY / innerHeight;
      
      // Apply subtle parallax effect to the background
      if (heroRef.current) {
        heroRef.current.style.setProperty('--x', `${(x - 0.5) * 20}px`);
        heroRef.current.style.setProperty('--y', `${(y - 0.5) * 20}px`);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <section 
      id="home" 
      ref={heroRef}
      className="min-h-screen relative flex items-center justify-center pt-16 overflow-hidden"
      style={{ 
        backgroundImage: 'radial-gradient(circle at center, rgba(236, 240, 243, 0.8) 0%, rgba(250, 250, 252, 0.4) 100%)',
        backgroundPosition: 'calc(50% + var(--x, 0)) calc(50% + var(--y, 0))',
      }}
    >
      {/* Abstract background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 filter blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-blue-200/20 filter blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-in">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              Investment Strategy Simulator
            </span>
          </div>
          
          <h1 className="hero-text-gradient text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in animate-delay-100">
            Compare Investment Strategies With Precision
          </h1>
          
          <p className="text-foreground/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in animate-delay-200">
            Analyze Lump Sum vs Dollar-Cost Averaging using historical NIFTY 50 data, visualize performance, and make informed investment decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animate-delay-300">
            <a 
              href="#simulation" 
              className="button-primary w-full sm:w-auto"
            >
              Start Your Simulation
            </a>
            <a 
              href="#about" 
              className="button-secondary w-full sm:w-auto"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-foreground/30 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
