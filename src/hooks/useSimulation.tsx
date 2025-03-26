
import { useState } from 'react';
import { runSimulation, SimulationResult } from '@/utils/simulationUtils';

export type FrequencyType = 'monthly' | 'quarterly' | 'yearly';
export type StrategyType = 'lumpSum' | 'dca' | 'both';

interface SimulationParams {
  investmentAmount: number;
  dcaAmount?: number; // New parameter for the periodic DCA investment amount
  frequency: FrequencyType;
  strategyType: StrategyType;
  startDate: Date;
  endDate: Date;
}

interface UseSimulationReturn {
  result: SimulationResult | null;
  loading: boolean;
  error: string | null;
  runSimulationWithParams: (params: SimulationParams) => void;
}

export const useSimulation = (): UseSimulationReturn => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const runSimulationWithParams = (params: SimulationParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate investment amount
      if (params.investmentAmount <= 0) {
        throw new Error('Investment amount must be greater than zero');
      }
      
      // Validate DCA amount if DCA strategy is selected
      if ((params.strategyType === 'dca' || params.strategyType === 'both') && 
          (!params.dcaAmount || params.dcaAmount <= 0)) {
        throw new Error('DCA amount must be greater than zero');
      }
      
      // Validate date range
      if (params.startDate >= params.endDate) {
        throw new Error('Start date must be before end date');
      }
      
      // Run simulation (with artificial delay to show loading state)
      setTimeout(() => {
        try {
          const simulationResult = runSimulation(
            params.investmentAmount,
            params.dcaAmount || 0,
            params.frequency,
            params.startDate,
            params.endDate
          );
          setResult(simulationResult);
          setLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred while running the simulation');
          setLoading(false);
        }
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };
  
  return {
    result,
    loading,
    error,
    runSimulationWithParams
  };
};
