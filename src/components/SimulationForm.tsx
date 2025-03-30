
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FrequencyType, StrategyType } from '@/hooks/useSimulation';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SimulationFormProps {
  onSubmit: (params: {
    investmentAmount: number;
    dcaAmount?: number;
    frequency: FrequencyType;
    strategyType: StrategyType;
    startDate: Date;
    endDate: Date;
  }) => void;
  loading: boolean;
}

const SimulationForm: React.FC<SimulationFormProps> = ({ onSubmit, loading }) => {
  const { toast } = useToast();
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [dcaAmount, setDcaAmount] = useState<number>(10000);
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [strategyType, setStrategyType] = useState<StrategyType>('both');
  const [startDate, setStartDate] = useState<Date>(new Date(2010, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date(2025, 0, 1));
  
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
    
    if ((strategyType === 'dca' || strategyType === 'both') && dcaAmount <= 0) {
      toast({
        title: "Invalid DCA Amount",
        description: "Please enter a positive DCA amount",
        variant: "destructive"
      });
      return;
    }
    
    if (startDate >= endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
      investmentAmount,
      dcaAmount,
      frequency,
      strategyType,
      startDate,
      endDate
    });
  };
  
  return (
    <div className="glass-card p-8 max-w-2xl w-full mx-auto animate-fade-in">
      <h3 className="text-2xl font-semibold mb-6 text-center">Configure Your Simulation</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
        
        {/* Lump Sum Investment Amount */}
        {(strategyType === 'lumpSum' || strategyType === 'both') && (
          <div className="space-y-2">
            <label htmlFor="investmentAmount" className="block text-sm font-medium text-foreground/80">
              {strategyType === 'both' ? 'Lump Sum Amount (₹)' : 'Investment Amount (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 z-10">₹</span>
              <Input
                id="investmentAmount"
                type="number"
                className="pl-8"
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
        )}
        
        {/* DCA Investment Amount - New field */}
        {(strategyType === 'dca' || strategyType === 'both') && (
          <div className="space-y-2">
            <label htmlFor="dcaAmount" className="block text-sm font-medium text-foreground/80">
              DCA Amount Per Period (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 z-10">₹</span>
              <Input
                id="dcaAmount"
                type="number"
                className="pl-8"
                value={dcaAmount}
                onChange={(e) => setDcaAmount(Number(e.target.value))}
                placeholder="10000"
                min="1000"
                step="1000"
                required
              />
            </div>
            <p className="text-xs text-foreground/60 pl-1">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dcaAmount)} 
              per {frequency.toLowerCase()}
            </p>
          </div>
        )}
        
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
        
        {/* Date Range - Start Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground/80">
            Start Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm justify-between items-center"
              >
                {format(startDate, "MMMM d, yyyy")}
                <CalendarIcon className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                disabled={(date) => date > endDate || date > new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Date Range - End Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground/80">
            End Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm justify-between items-center"
              >
                {format(endDate, "MMMM d, yyyy")}
                <CalendarIcon className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                disabled={(date) => date < startDate || date > new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
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
