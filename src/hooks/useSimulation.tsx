
import { useState } from 'react';
import { runSimulation, SimulationResult } from '@/utils/simulationUtils';

export type FrequencyType = 'monthly' | 'quarterly' | 'yearly';
export type StrategyType = 'lumpSum' | 'dca' | 'both';

interface SimulationParams {
  investmentAmount: number;
  frequency: FrequencyType;
  strategyType: StrategyType;
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
      
      // Run simulation (with artificial delay to show loading state)
      setTimeout(() => {
        const simulationResult = runSimulation(params.investmentAmount, params.frequency);
        setResult(simulationResult);
        setLoading(false);
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
