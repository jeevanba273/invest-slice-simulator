
import { useState } from 'react';
import { runSimulation, SimulationResult } from '@/utils/simulationUtils';
import { useToast } from '@/hooks/use-toast';

export type FrequencyType = 'monthly' | 'quarterly' | 'yearly';
export type StrategyType = 'lumpSum' | 'dca' | 'both';

interface SimulationParams {
  investmentAmount: number;
  dcaAmount?: number;
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
  const { toast } = useToast();
  
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
      
      // Run simulation with real data
      runSimulation(
        params.investmentAmount,
        params.dcaAmount || 0,
        params.frequency,
        params.startDate,
        params.endDate
      )
        .then(simulationResult => {
          setResult(simulationResult);
          setLoading(false);
          toast({
            title: "Simulation Complete",
            description: "Data has been loaded successfully",
            variant: "default"
          });
        })
        .catch(err => {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred while running the simulation';
          setError(errorMessage);
          setLoading(false);
          toast({
            title: "Simulation Error",
            description: errorMessage,
            variant: "destructive"
          });
        });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      toast({
        title: "Simulation Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  return {
    result,
    loading,
    error,
    runSimulationWithParams
  };
};
