
import React, { useEffect, useState } from 'react';

interface MetricsCardProps {
  title: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  subtitle?: string;
  comparison?: {
    value: number;
    label: string;
  };
  isVisible: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ 
  title, 
  value, 
  format, 
  subtitle, 
  comparison,
  isVisible 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Animated counter effect
  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16); // Update every ~16ms for smooth 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, isVisible]);
  
  // Format the value based on the format prop
  const formattedValue = () => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(displayValue);
    } else if (format === 'percentage') {
      return `${displayValue.toFixed(2)}%`;
    } else {
      return displayValue.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }
  };
  
  // Calculate difference for comparison
  const getDifference = () => {
    if (!comparison) return null;
    
    const diff = value - comparison.value;
    const percentageDiff = comparison.value !== 0 
      ? (diff / comparison.value) * 100 
      : 0;
    
    return {
      isPositive: diff >= 0,
      formattedDiff: format === 'currency' 
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(diff))
        : format === 'percentage'
          ? `${Math.abs(diff).toFixed(2)}%`
          : Math.abs(diff).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      percentageDiff: `${Math.abs(percentageDiff).toFixed(2)}%`
    };
  };
  
  const difference = comparison ? getDifference() : null;
  
  return (
    <div className={`card-container transform transition-all duration-500 ${
      isVisible 
        ? 'translate-y-0 opacity-100' 
        : 'translate-y-4 opacity-0'
    }`}>
      <h4 className="text-sm font-medium text-foreground/60">{title}</h4>
      <div className="mt-2 flex items-end">
        <span className="text-2xl font-semibold">{formattedValue()}</span>
        {subtitle && (
          <span className="ml-1 text-xs text-foreground/60 mb-1">{subtitle}</span>
        )}
      </div>
      
      {comparison && difference && (
        <div className={`mt-2 text-xs ${
          difference.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="flex items-center">
            {difference.isPositive ? '↑' : '↓'} {difference.formattedDiff} ({difference.percentageDiff}) vs {comparison.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
