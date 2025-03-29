
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import SimulationForm from '@/components/SimulationForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { useSimulation, FrequencyType, StrategyType } from '@/hooks/useSimulation';
import { SimulationResult } from '@/utils/simulationUtils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Github, Linkedin } from "lucide-react";

const Index = () => {
  const [simulationParams, setSimulationParams] = useState<{
    investmentAmount: number;
    dcaAmount?: number;
    frequency: FrequencyType;
    strategyType: StrategyType;
    startDate: Date;
    endDate: Date;
  } | null>(null);
  
  const { result, loading, error, runSimulationWithParams } = useSimulation();
  const { toast } = useToast();
  
  const handleFormSubmit = (params: {
    investmentAmount: number;
    dcaAmount?: number;
    frequency: FrequencyType;
    strategyType: StrategyType;
    startDate: Date;
    endDate: Date;
  }) => {
    setSimulationParams(params);
    runSimulationWithParams(params);
  };
  
  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Simulation Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <Hero />
      
      <section id="simulation" className="bg-secondary/30 py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              Investment Simulator
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Compare Investment Strategies
            </h2>
            <p className="text-foreground/70 mt-4">
              See how Lump Sum and Dollar-Cost Averaging strategies would have performed with historical NIFTY 50 data.
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}. The simulation will use simulated data instead.
              </AlertDescription>
            </Alert>
          )}
          
          <SimulationForm onSubmit={handleFormSubmit} loading={loading} />
          
          {result && simulationParams && (
            <div className="mt-12">
              <ResultsDisplay 
                result={result}
                strategyType={simulationParams.strategyType}
                frequency={simulationParams.frequency}
                investmentAmount={simulationParams.investmentAmount}
                dcaAmount={simulationParams.dcaAmount}
                startDate={simulationParams.startDate}
                endDate={simulationParams.endDate}
              />
            </div>
          )}
        </div>
      </section>
      
      <section id="about" className="py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              About
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Understanding Investment Strategies
            </h2>
            <p className="text-foreground/70">
              Learn more about different investment approaches and make informed decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-container">
              <h3 className="text-xl font-semibold mb-3">Lump Sum Investing</h3>
              <p className="text-foreground/70 mb-4">
                Lump Sum investing involves making a single, large investment at once. The entire capital is deployed immediately, maximizing exposure to potential market growth from day one.
              </p>
              <ul className="space-y-2 pl-5 list-disc text-foreground/70">
                <li>Maximizes time in the market</li>
                <li>Potentially higher returns in consistently rising markets</li>
                <li>Simplicity - a one-time transaction</li>
                <li>No timing decisions after the initial investment</li>
              </ul>
            </div>
            
            <div className="card-container">
              <h3 className="text-xl font-semibold mb-3">Dollar-Cost Averaging (DCA)</h3>
              <p className="text-foreground/70 mb-4">
                Dollar-Cost Averaging involves regularly investing fixed amounts over time, regardless of market conditions. This approach can help reduce the impact of market volatility.
              </p>
              <ul className="space-y-2 pl-5 list-disc text-foreground/70">
                <li>Reduces impact of market timing</li>
                <li>Buys more units when prices are low</li>
                <li>Potentially less psychological stress during market downturns</li>
                <li>Disciplined approach that encourages regular investing</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 glass-card p-8">
            <h3 className="text-xl font-semibold mb-4 text-center">Which Strategy Is Right For You?</h3>
            <p className="text-foreground/70 mb-6 text-center max-w-3xl mx-auto">
              The best strategy depends on your personal circumstances, risk tolerance, and market outlook. This simulator helps visualize the historical performance of each approach with NIFTY 50 data.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-medium mb-2">Risk Tolerance</h4>
                <p className="text-sm text-foreground/70">Consider your comfort with market volatility before choosing</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-medium mb-2">Time Horizon</h4>
                <p className="text-sm text-foreground/70">Long-term investors may benefit differently than short-term</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-medium mb-2">Market Conditions</h4>
                <p className="text-sm text-foreground/70">Bull markets favor different strategies than bear markets</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-medium mb-2">Personal Discipline</h4>
                <p className="text-sm text-foreground/70">Consider which approach you'll stick with consistently</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-secondary/50 py-12">
        <div className="section-container">
          <div className="text-center">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
              InvestSlice
            </h2>
            <p className="text-sm text-foreground/60 mb-6">
              A powerful investment strategy comparison tool for the Indian market
            </p>
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#home" className="text-sm text-foreground/70 hover:text-foreground">Home</a>
              <a href="#simulation" className="text-sm text-foreground/70 hover:text-foreground">Simulation</a>
              <a href="#about" className="text-sm text-foreground/70 hover:text-foreground">About</a>
            </div>
            
            {/* Social Media Links */}
            <div className="flex justify-center space-x-4 mb-6">
              <a 
                href="https://github.com/jeevanba273" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
              >
                <Github className="h-6 w-6 text-foreground/70 hover:text-primary transition-all duration-300 transform hover:scale-110 hover:-translate-y-1" />
              </a>
              <a 
                href="https://www.linkedin.com/in/jeevanba273/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
              >
                <Linkedin className="h-6 w-6 text-foreground/70 hover:text-primary transition-all duration-300 transform hover:scale-110 hover:-translate-y-1" />
              </a>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-xs text-foreground/50">
                {new Date().getFullYear()} InvestSlice. All historical data is simulated for educational purposes.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
