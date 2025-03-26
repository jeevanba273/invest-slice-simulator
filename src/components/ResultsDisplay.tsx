
import React, { useState, useEffect } from 'react';
import ComparisonChart from './ComparisonChart';
import MetricsCard from './MetricsCard';
import { SimulationResult } from '@/utils/simulationUtils';
import { FrequencyType, StrategyType } from '@/hooks/useSimulation';
import { format } from 'date-fns';

interface ResultsDisplayProps {
  result: SimulationResult;
  strategyType: StrategyType;
  frequency: FrequencyType;
  investmentAmount: number;
  dcaAmount?: number;
  startDate: Date;
  endDate: Date;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  result, 
  strategyType,
  frequency,
  investmentAmount,
  dcaAmount = 0,
  startDate,
  endDate
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState('full'); // 'full', '5y', '1y'
  
  // Determine which strategies to show
  const showLumpSum = strategyType === 'lumpSum' || strategyType === 'both';
  const showDCA = strategyType === 'dca' || strategyType === 'both';
  
  // Show results with animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter data based on active timeframe
  const getFilteredData = () => {
    if (activeTimeframe === 'full') {
      return result.data;
    }
    
    const now = result.data[result.data.length - 1].date;
    let cutoffDate: Date;
    
    if (activeTimeframe === '5y') {
      cutoffDate = new Date(now);
      cutoffDate.setFullYear(now.getFullYear() - 5);
    } else if (activeTimeframe === '1y') {
      cutoffDate = new Date(now);
      cutoffDate.setFullYear(now.getFullYear() - 1);
    } else {
      return result.data;
    }
    
    return result.data.filter(point => point.date >= cutoffDate);
  };
  
  const filteredData = getFilteredData();
  
  // Calculate total DCA investment
  const totalInvestmentPeriods = Math.floor(
    (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
    (endDate.getMonth() - startDate.getMonth())
  ) / (frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 : 12);
  
  const totalDCAInvestment = dcaAmount * totalInvestmentPeriods;
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Simulation Results</h2>
        
        <div className="flex space-x-2">
          {['full', '5y', '1y'].map((timeframe) => (
            <button
              key={timeframe}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                activeTimeframe === timeframe
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              onClick={() => setActiveTimeframe(timeframe)}
            >
              {timeframe === 'full' ? 'Full Period' : 
               timeframe === '5y' ? '5 Years' : 
               '1 Year'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="glass-card p-4 mb-2">
        <p className="text-sm text-foreground/70">
          Simulating from <strong>{format(startDate, "MMMM d, yyyy")}</strong> to <strong>{format(endDate, "MMMM d, yyyy")}</strong>
          {showDCA && <> · {frequency} DCA of <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dcaAmount)}</strong></>}
        </p>
      </div>
      
      <ComparisonChart 
        data={filteredData}
        lumpSumEnabled={showLumpSum}
        dcaEnabled={showDCA}
        isVisible={isVisible}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lump Sum Metrics */}
        {showLumpSum && (
          <>
            <MetricsCard
              title="Lump Sum Final Value"
              value={result.lumpSum.finalValue}
              format="currency"
              isVisible={isVisible}
              comparison={showDCA ? {
                value: result.dca.finalValue,
                label: "DCA"
              } : undefined}
            />
            
            <MetricsCard
              title="Lump Sum CAGR"
              value={result.lumpSum.cagr}
              format="percentage"
              isVisible={isVisible}
              comparison={showDCA ? {
                value: result.dca.cagr,
                label: "DCA"
              } : undefined}
            />
            
            <MetricsCard
              title="Lump Sum Units"
              value={result.lumpSum.totalUnits}
              format="number"
              subtitle="units"
              isVisible={isVisible}
              comparison={showDCA ? {
                value: result.dca.totalUnits,
                label: "DCA"
              } : undefined}
            />
          </>
        )}
        
        {/* DCA Metrics */}
        {showDCA && !showLumpSum && (
          <>
            <MetricsCard
              title="DCA Final Value"
              value={result.dca.finalValue}
              format="currency"
              isVisible={isVisible}
            />
            
            <MetricsCard
              title="DCA CAGR"
              value={result.dca.cagr}
              format="percentage"
              isVisible={isVisible}
            />
            
            <MetricsCard
              title="DCA Units"
              value={result.dca.totalUnits}
              format="number"
              subtitle="units"
              isVisible={isVisible}
            />
          </>
        )}
        
        {/* Additional Comparison Metrics */}
        {showDCA && (
          <MetricsCard
            title="Total DCA Investment"
            value={totalDCAInvestment}
            format="currency"
            isVisible={isVisible}
          />
        )}
        
        {showLumpSum && showDCA && (
          <MetricsCard
            title="ROI Difference"
            value={(result.lumpSum.finalValue / investmentAmount) - (result.dca.finalValue / totalDCAInvestment)}
            format="number"
            subtitle="x"
            isVisible={isVisible}
          />
        )}
      </div>
      
      <div className={`glass-card p-6 transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <h3 className="text-lg font-semibold mb-3">Key Insights</h3>
        <ul className="space-y-2 text-sm text-foreground/80">
          {showLumpSum && showDCA && (
            <>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                {result.lumpSum.finalValue > result.dca.finalValue ? (
                  <span>
                    Lump Sum investing outperformed DCA by {' '}
                    <strong>
                      {new Intl.NumberFormat('en-IN', { 
                        style: 'currency', 
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(result.lumpSum.finalValue - result.dca.finalValue)}
                    </strong>
                    {' '} ({((result.lumpSum.finalValue / result.dca.finalValue - 1) * 100).toFixed(2)}%).
                  </span>
                ) : (
                  <span>
                    DCA outperformed Lump Sum investing by {' '}
                    <strong>
                      {new Intl.NumberFormat('en-IN', { 
                        style: 'currency', 
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(result.dca.finalValue - result.lumpSum.finalValue)}
                    </strong>
                    {' '} ({((result.dca.finalValue / result.lumpSum.finalValue - 1) * 100).toFixed(2)}%).
                  </span>
                )}
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>
                  The Lump Sum strategy purchased <strong>{result.lumpSum.totalUnits.toFixed(2)}</strong> units, 
                  while DCA accumulated <strong>{result.dca.totalUnits.toFixed(2)}</strong> units over time.
                </span>
              </li>
            </>
          )}
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>
              {showLumpSum && `Lump Sum investing produced a CAGR of ${result.lumpSum.cagr.toFixed(2)}%, `}
              {showLumpSum && showDCA && 'while '}
              {showDCA && `DCA produced a CAGR of ${result.dca.cagr.toFixed(2)}%.`}
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>
              {showDCA && `With ${frequency} investments of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dcaAmount)}, DCA spreads out risk over time, potentially reducing the impact of market volatility.`}
              {showLumpSum && `Lump Sum investing benefits more when markets trend upward over long periods.`}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ResultsDisplay;
