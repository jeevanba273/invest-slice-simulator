
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FrequencyType, StrategyType } from '@/hooks/useSimulation';

interface SimulationFormProps {
  onSubmit: (params: {
    investmentAmount: number;
    frequency: FrequencyType;
    strategyType: StrategyType;
  }) => void;
  loading: boolean;
}

const SimulationForm: React.FC<SimulationFormProps> = ({ onSubmit, loading }) => {
  const { toast } = useToast();
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [strategyType, setStrategyType] = useState<StrategyType>('both');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (investmentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive investment amount",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
      investmentAmount,
      frequency,
      strategyType
    });
  };
  
  return (
    <div className="glass-card p-8 max-w-2xl w-full mx-auto animate-fade-in">
      <h3 className="text-2xl font-semibold mb-6 text-center">Configure Your Simulation</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Investment Amount */}
        <div className="space-y-2">
          <label htmlFor="investmentAmount" className="block text-sm font-medium text-foreground/80">
            Investment Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60">₹</span>
            <input
              id="investmentAmount"
              type="number"
              className="input-field pl-8"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              placeholder="100000"
              min="1000"
              step="1000"
              required
            />
          </div>
          <p className="text-xs text-foreground/60 pl-1">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(investmentAmount)}
          </p>
        </div>
        
        {/* Strategy Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground/80">
            Strategy Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['lumpSum', 'dca', 'both'] as const).map((strategy) => (
              <button
                key={strategy}
                type="button"
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  strategyType === strategy 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                onClick={() => setStrategyType(strategy)}
              >
                {strategy === 'lumpSum' ? 'Lump Sum' : 
                 strategy === 'dca' ? 'DCA' : 'Compare Both'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Frequency (only if DCA is selected) */}
        {(strategyType === 'dca' || strategyType === 'both') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/80">
              Investment Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['monthly', 'quarterly', 'yearly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    frequency === freq 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  onClick={() => setFrequency(freq)}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Time Frame (fixed to Jan 2010 - Jan 2025) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground/80">
            Time Frame
          </label>
          <div className="flex items-center space-x-2 bg-secondary p-3 rounded-lg text-sm text-foreground/80">
            <span className="flex-1">January 1, 2010</span>
            <span className="text-foreground/40">to</span>
            <span className="flex-1">January 1, 2025</span>
          </div>
          <p className="text-xs text-foreground/60 pl-1">
            Fixed 15-year period using historical NIFTY 50 data
          </p>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="button-primary w-full py-3"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Simulation...
            </span>
          ) : (
            "Run Simulation"
          )}
        </button>
      </form>
    </div>
  );
};

export default SimulationForm;
