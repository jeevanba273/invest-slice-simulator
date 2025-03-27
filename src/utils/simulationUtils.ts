
// Data types
import { fetchHistoricalData, getSimulatedHistoricalData } from '@/services/yahooFinanceService';

export interface DataPoint {
  date: Date;
  close: number;
  lumpSumValue?: number;
  dcaValue?: number;
}

export interface SimulationResult {
  data: DataPoint[];
  lumpSum: {
    finalValue: number;
    totalUnits: number;
    cagr: number;
  };
  dca: {
    finalValue: number;
    totalUnits: number;
    cagr: number;
    periodicAmount: number;
  };
}

// Calculate CAGR (Compound Annual Growth Rate)
const calculateCAGR = (initialValue: number, finalValue: number, years: number): number => {
  if (years <= 0 || initialValue <= 0 || finalValue <= 0) return 0;
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
};

// Simulate Lump Sum investing
const simulateLumpSum = (data: DataPoint[], investmentAmount: number): DataPoint[] => {
  const initialPrice = data[0].close;
  const units = investmentAmount / initialPrice;
  
  return data.map(point => ({
    ...point,
    lumpSumValue: point.close * units
  }));
};

// Simulate Dollar-Cost Averaging (DCA)
const simulateDCA = (
  data: DataPoint[], 
  dcaAmount: number, // Fixed amount invested each period
  frequency: 'monthly' | 'quarterly' | 'yearly'
): DataPoint[] => {
  // Determine investment intervals based on frequency
  let interval: number;
  if (frequency === 'monthly') interval = 1;
  else if (frequency === 'quarterly') interval = 3;
  else interval = 12;
  
  // Organize data by year and month
  const dataByMonth: { [key: string]: DataPoint } = {};
  data.forEach(point => {
    const year = point.date.getFullYear();
    const month = point.date.getMonth();
    const key = `${year}-${month}`;
    
    // Keep only the last trading day of each month
    if (!dataByMonth[key] || point.date > dataByMonth[key].date) {
      dataByMonth[key] = point;
    }
  });
  
  // Convert back to array and sort by date
  const monthlyData = Object.values(dataByMonth).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  
  // Filter based on frequency
  const investmentDates: DataPoint[] = [];
  for (let i = 0; i < monthlyData.length; i++) {
    if (i % interval === 0) {
      investmentDates.push(monthlyData[i]);
    }
  }
  
  // Simulate DCA investment using the fixed dcaAmount each period
  let totalUnits = 0;
  const resultMap = new Map<string, number>();
  
  investmentDates.forEach(point => {
    const unitsAcquired = dcaAmount / point.close;
    totalUnits += unitsAcquired;
    
    // Set portfolio value for this date and all future dates
    const dateKey = point.date.toISOString();
    resultMap.set(dateKey, totalUnits);
  });
  
  // Apply portfolio values to all data points
  return data.map(point => {
    const dateKey = point.date.toISOString();
    let accumulatedUnits = 0;
    
    // Find the most recent investment date
    for (const [investDate, units] of resultMap.entries()) {
      if (investDate <= dateKey) {
        accumulatedUnits = units;
      }
    }
    
    return {
      ...point,
      dcaValue: accumulatedUnits * point.close
    };
  });
};

// Helper function to get investment dates
function getInvestmentDates(data: DataPoint[], frequency: 'monthly' | 'quarterly' | 'yearly'): DataPoint[] {
  // Determine investment intervals based on frequency
  let interval: number;
  if (frequency === 'monthly') interval = 1;
  else if (frequency === 'quarterly') interval = 3;
  else interval = 12;
  
  // Organize data by year and month
  const dataByMonth: { [key: string]: DataPoint } = {};
  data.forEach(point => {
    const year = point.date.getFullYear();
    const month = point.date.getMonth();
    const key = `${year}-${month}`;
    
    // Keep only the last trading day of each month
    if (!dataByMonth[key] || point.date > dataByMonth[key].date) {
      dataByMonth[key] = point;
    }
  });
  
  // Convert back to array and sort by date
  const monthlyData = Object.values(dataByMonth).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  
  // Filter based on frequency
  const investmentDates: DataPoint[] = [];
  for (let i = 0; i < monthlyData.length; i++) {
    if (i % interval === 0) {
      investmentDates.push(monthlyData[i]);
    }
  }
  
  return investmentDates;
}

// Main simulation function
export const runSimulation = async (
  lumpSumAmount: number,
  dcaAmount: number,
  frequency: 'monthly' | 'quarterly' | 'yearly',
  startDate: Date,
  endDate: Date
): Promise<SimulationResult> => {
  try {
    // Always get simulated data first so we have a fallback
    const fallbackData = getSimulatedHistoricalData(startDate, endDate);
    console.log(`Generated ${fallbackData.length} simulated data points as fallback`);
    
    // Try to get real data from Yahoo Finance API
    let marketData;
    try {
      marketData = await fetchHistoricalData("^NSEI", startDate, endDate);
      console.log(`Fetched ${marketData.length} data points from Yahoo Finance API`);
      
      // If API returns insufficient data, use simulated data with consistent seed
      if (marketData.length < 10) {
        console.warn("Insufficient data from API, using simulated data");
        marketData = fallbackData;
      }
    } catch (error) {
      console.warn("Failed to fetch real data, using simulated data", error);
      marketData = fallbackData;
    }
    
    // Run Lump Sum simulation
    let processedData = simulateLumpSum(marketData, lumpSumAmount);
    
    // Run DCA simulation
    processedData = simulateDCA(processedData, dcaAmount, frequency);
    
    // Calculate performance metrics
    const initialLumpSumValue = lumpSumAmount;
    
    const years = (processedData[processedData.length - 1].date.getTime() - processedData[0].date.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    const lumpSumFinalValue = processedData[processedData.length - 1].lumpSumValue || 0;
    const dcaFinalValue = processedData[processedData.length - 1].dcaValue || 0;
    
    const lumpSumCAGR = calculateCAGR(initialLumpSumValue, lumpSumFinalValue, years);
    
    // For DCA, calculate the total amount invested
    const investmentDates = getInvestmentDates(processedData, frequency);
    const totalInvestments = investmentDates.length;
    const totalDCAInvestment = dcaAmount * totalInvestments;
    
    // Calculate proper CAGR for DCA using total amount invested
    const dcaCAGR = calculateCAGR(totalDCAInvestment, dcaFinalValue, years);
    
    const lumpSumUnits = lumpSumAmount / processedData[0].close;
    
    // Calculate total DCA units based on final value and closing price
    const dcaUnits = dcaFinalValue / processedData[processedData.length - 1].close;
    
    return {
      data: processedData,
      lumpSum: {
        finalValue: lumpSumFinalValue,
        totalUnits: lumpSumUnits,
        cagr: lumpSumCAGR
      },
      dca: {
        finalValue: dcaFinalValue,
        totalUnits: dcaUnits,
        cagr: dcaCAGR,
        periodicAmount: dcaAmount
      }
    };
  } catch (error) {
    console.error("Error in simulation:", error);
    
    // Even if everything fails, return simulated data so the app doesn't break
    const backupData = getSimulatedHistoricalData(startDate, endDate);
    const lumpSumSimulated = simulateLumpSum(backupData, lumpSumAmount);
    const dcaSimulated = simulateDCA(lumpSumSimulated, dcaAmount, frequency);
    
    // Calculate some basic metrics from the simulated data
    const years = (dcaSimulated[dcaSimulated.length - 1].date.getTime() - dcaSimulated[0].date.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Calculate proper CAGR for fallback data
    const lumpSumFinalValue = dcaSimulated[dcaSimulated.length - 1].lumpSumValue || 0;
    const dcaFinalValue = dcaSimulated[dcaSimulated.length - 1].dcaValue || 0;
    const lumpSumCAGR = calculateCAGR(lumpSumAmount, lumpSumFinalValue, years);
    
    // For DCA in fallback, calculate approximate investment dates
    const approxTotalInvestments = Math.floor(years * (frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1));
    const totalDCAInvestment = dcaAmount * approxTotalInvestments;
    const dcaCAGR = calculateCAGR(totalDCAInvestment, dcaFinalValue, years);
    
    return {
      data: dcaSimulated,
      lumpSum: {
        finalValue: lumpSumFinalValue,
        totalUnits: lumpSumAmount / dcaSimulated[0].close,
        cagr: lumpSumCAGR
      },
      dca: {
        finalValue: dcaFinalValue,
        totalUnits: dcaFinalValue / dcaSimulated[dcaSimulated.length - 1].close,
        cagr: dcaCAGR,
        periodicAmount: dcaAmount
      }
    };
  }
};
