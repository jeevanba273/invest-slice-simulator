
import React, { useEffect, useRef, useState } from 'react';
import { DataPoint } from '@/utils/simulationUtils';

interface ComparisonChartProps {
  data: DataPoint[];
  lumpSumEnabled: boolean;
  dcaEnabled: boolean;
  isVisible: boolean;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  data, 
  lumpSumEnabled, 
  dcaEnabled,
  isVisible 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    date: string;
    lumpSumValue: string;
    dcaValue: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    date: '',
    lumpSumValue: '',
    dcaValue: ''
  });
  
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (data.length === 0) return;
    
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    data.forEach(point => {
      if (lumpSumEnabled && point.lumpSumValue !== undefined) {
        minValue = Math.min(minValue, point.lumpSumValue);
        maxValue = Math.max(maxValue, point.lumpSumValue);
      }
      if (dcaEnabled && point.dcaValue !== undefined && point.dcaValue !== null) {
        minValue = Math.min(minValue, point.dcaValue);
        maxValue = Math.max(maxValue, point.dcaValue);
      }
    });
    
    const padding = (maxValue - minValue) * 0.1;
    minValue = Math.max(0, minValue - padding);
    maxValue = maxValue + padding;
    
    const chartWidth = rect.width - 60;
    const chartHeight = rect.height - 40;
    const chartLeft = 50;
    const chartTop = 20;
    
    const getX = (index: number) => chartLeft + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => chartTop + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
    
    // Draw chart axes
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartTop + chartHeight);
    ctx.lineTo(chartLeft + chartWidth, chartTop + chartHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartTop);
    ctx.lineTo(chartLeft, chartTop + chartHeight);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const numYTicks = 5;
    for (let i = 0; i <= numYTicks; i++) {
      const value = minValue + (maxValue - minValue) * (i / numYTicks);
      const y = getY(value);
      
      ctx.fillText(
        new Intl.NumberFormat('en-IN', { 
          style: 'currency', 
          currency: 'INR',
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value), 
        chartLeft - 5, 
        y
      );
      
      ctx.strokeStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartLeft + chartWidth, y);
      ctx.stroke();
    }
    
    // Draw X-axis labels (years)
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const years = new Set(data.map(point => point.date.getFullYear()));
    const yearArray = Array.from(years).sort();
    
    yearArray.forEach(year => {
      const index = data.findIndex(point => point.date.getFullYear() === year);
      if (index === -1) return;
      
      const x = getX(index);
      
      if (year % 3 === 0) {
        ctx.fillText(year.toString(), x, chartTop + chartHeight + 5);
      }
      
      ctx.strokeStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(x, chartTop);
      ctx.lineTo(x, chartTop + chartHeight);
      ctx.stroke();
    });
    
    // Draw Lump Sum line
    if (lumpSumEnabled) {
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let firstDataPointDrawn = false;
      
      data.forEach((point, index) => {
        if (point.lumpSumValue !== undefined) {
          const x = getX(index);
          const y = getY(point.lumpSumValue);
          
          if (!firstDataPointDrawn) {
            ctx.moveTo(x, y);
            firstDataPointDrawn = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      
      ctx.stroke();
    }
    
    // Draw DCA line (only where values exist)
    if (dcaEnabled) {
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let firstPoint = true;
      
      data.forEach((point, index) => {
        if (point.dcaValue !== undefined && point.dcaValue !== null) {
          const x = getX(index);
          const y = getY(point.dcaValue);
          
          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      
      ctx.stroke();
    }
    
    // Configure mouse interaction for tooltips
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (x >= chartLeft && x <= chartLeft + chartWidth &&
          y >= chartTop && y <= chartTop + chartHeight) {
        
        let minDistance = Infinity;
        let closestIndex = -1;
        
        data.forEach((point, index) => {
          const pointX = getX(index);
          const distance = Math.abs(pointX - x);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });
        
        if (closestIndex !== -1) {
          const point = data[closestIndex];
          
          // Only show tooltip for points where we have values
          const hasLumpSumValue = lumpSumEnabled && point.lumpSumValue !== undefined;
          const hasDCAValue = dcaEnabled && point.dcaValue !== undefined && point.dcaValue !== null;
          
          if (hasLumpSumValue || hasDCAValue) {
            let tooltipY = y - 10;
            
            // If we have both values, get the higher one for tooltip positioning
            if (hasLumpSumValue && hasDCAValue) {
              tooltipY = Math.min(
                getY(point.lumpSumValue!),
                getY(point.dcaValue!)
              ) - 10;
            } else if (hasLumpSumValue) {
              tooltipY = getY(point.lumpSumValue!) - 10;
            } else if (hasDCAValue) {
              tooltipY = getY(point.dcaValue!) - 10;
            }
            
            setTooltipData({
              visible: true,
              x: getX(closestIndex),
              y: tooltipY,
              date: point.date.toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              }),
              lumpSumValue: hasLumpSumValue ? new Intl.NumberFormat('en-IN', { 
                style: 'currency', 
                currency: 'INR' 
              }).format(point.lumpSumValue || 0) : "N/A",
              dcaValue: hasDCAValue ? new Intl.NumberFormat('en-IN', { 
                style: 'currency', 
                currency: 'INR' 
              }).format(point.dcaValue || 0) : "N/A"
            });
          } else {
            setTooltipData({ ...tooltipData, visible: false });
          }
        }
      } else {
        setTooltipData({ ...tooltipData, visible: false });
      }
    };
    
    canvas.onmouseleave = () => {
      setTooltipData({ ...tooltipData, visible: false });
    };
    
    // Handle click events for mobile compatibility
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      
      let minDistance = Infinity;
      let closestIndex = -1;
      
      data.forEach((point, index) => {
        const pointX = getX(index) * dpr;
        const distance = Math.abs(pointX - x);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      if (closestIndex !== -1 && minDistance < 50) {
        const point = data[closestIndex];
        
        // Only show tooltip for points where we have values
        const hasLumpSumValue = lumpSumEnabled && point.lumpSumValue !== undefined;
        const hasDCAValue = dcaEnabled && point.dcaValue !== undefined && point.dcaValue !== null;
        
        if (hasLumpSumValue || hasDCAValue) {
          let tooltipY = chartTop;
          
          // If we have both values, get the higher one for tooltip positioning
          if (hasLumpSumValue && hasDCAValue) {
            tooltipY = Math.min(
              getY(point.lumpSumValue!),
              getY(point.dcaValue!)
            ) - 10;
          } else if (hasLumpSumValue) {
            tooltipY = getY(point.lumpSumValue!) - 10;
          } else if (hasDCAValue) {
            tooltipY = getY(point.dcaValue!) - 10;
          }
          
          setTooltipData({
            visible: true,
            x: getX(closestIndex),
            y: tooltipY,
            date: point.date.toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }),
            lumpSumValue: hasLumpSumValue ? new Intl.NumberFormat('en-IN', { 
              style: 'currency', 
              currency: 'INR' 
            }).format(point.lumpSumValue || 0) : "N/A",
            dcaValue: hasDCAValue ? new Intl.NumberFormat('en-IN', { 
              style: 'currency', 
              currency: 'INR' 
            }).format(point.dcaValue || 0) : "N/A"
          });
        } else {
          setTooltipData({ ...tooltipData, visible: false });
        }
      } else {
        setTooltipData({ ...tooltipData, visible: false });
      }
    };
  };
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(drawChart, 500);
      return () => clearTimeout(timer);
    }
  }, [data, lumpSumEnabled, dcaEnabled, isVisible]);
  
  useEffect(() => {
    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, lumpSumEnabled, dcaEnabled]);
  
  return (
    <div className={`card-container h-80 transition-all duration-500 ${
      isVisible 
        ? 'translate-y-0 opacity-100' 
        : 'translate-y-4 opacity-0'
    }`}>
      <h3 className="text-lg font-semibold mb-4">Portfolio Value Over Time</h3>
      
      <div className="absolute top-4 right-4 flex items-center space-x-4 text-xs">
        {lumpSumEnabled && (
          <div className="flex items-center">
            <span className="w-3 h-3 inline-block rounded-full bg-blue-600 mr-1"></span>
            <span>Lump Sum</span>
          </div>
        )}
        {dcaEnabled && (
          <div className="flex items-center">
            <span className="w-3 h-3 inline-block rounded-full bg-rose-600 mr-1"></span>
            <span>DCA</span>
          </div>
        )}
      </div>
      
      <div ref={containerRef} className="relative w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />
        
        {tooltipData.visible && (
          <div 
            className="absolute z-10 bg-white dark:bg-gray-800/95 shadow-lg rounded-lg p-2 text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltipData.x,
              top: tooltipData.y
            }}
          >
            <div className="font-semibold text-black dark:text-white">{tooltipData.date}</div>
            {lumpSumEnabled && tooltipData.lumpSumValue !== "N/A" && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-300">Lump Sum:</span>
                <span className="font-medium text-black dark:text-white">{tooltipData.lumpSumValue}</span>
              </div>
            )}
            {dcaEnabled && tooltipData.dcaValue !== "N/A" && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-300">DCA:</span>
                <span className="font-medium text-black dark:text-white">{tooltipData.dcaValue}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonChart;
