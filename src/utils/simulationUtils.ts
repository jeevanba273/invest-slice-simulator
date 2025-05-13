
// Data types
import { fetchHistoricalData, getSimulatedHistoricalData } from '@/services/yahooFinanceService';

export interface DataPoint {
  date: Date;
  close: number;
  normalizedClose?: number;
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

// Normalize data relative to the first day's price
const normalizeData = (data: DataPoint[]): DataPoint[] => {
  if (data.length === 0) return [];
  
  const initialPrice = data[0].close;
  
  return data.map(point => ({
    ...point,
    normalizedClose: point.close / initialPrice
  }));
};

// Simulate Lump Sum investing
const simulateLumpSum = (data: DataPoint[], investmentAmount: number): DataPoint[] => {
  // For lump sum, invest all money on day one
  // Value on any day = investment amount * (current price / initial price)
  return data.map(point => ({
    ...point,
    lumpSumValue: investmentAmount * (point.normalizedClose || 1)
  }));
};

// Simulate Dollar-Cost Averaging (DCA)
const simulateDCA = (
  data: DataPoint[], 
  dcaAmount: number, 
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

  // Calculate DCA values
  // For each investment period, calculate how many units were purchased
  const investments: { units: number }[] = [];
  
  investmentDates.forEach(point => {
    if (point.normalizedClose && point.normalizedClose > 0) {
      // Units bought = amount / normalized price
      // Since normalized price represents the relative price where initial price = 1
      const unitsBought = dcaAmount / point.normalizedClose;
      investments.push({ units: unitsBought });
    }
  });
  
  return data.map(point => {
    if (point.normalizedClose === undefined) return point;
    
    // Calculate total units held
    const totalUnits = investments.reduce((sum, inv) => sum + inv.units, 0);
    
    // Value = total units * normalized price
    // This reflects how many units you own multiplied by their current normalized value
    const totalValue = totalUnits * point.normalizedClose;
    
    return {
      ...point,
      dcaValue: totalValue
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
    
    // First, normalize the data based on the first day's price
    const normalizedData = normalizeData(marketData);
    
    // Run Lump Sum simulation with normalized data
    let processedData = simulateLumpSum(normalizedData, lumpSumAmount);
    
    // Run DCA simulation with normalized data
    processedData = simulateDCA(processedData, dcaAmount, frequency);
    
    // Calculate years for CAGR calculation
    const years = (processedData[processedData.length - 1].date.getTime() - processedData[0].date.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Calculate investment dates for DCA
    const investmentDates = getInvestmentDates(processedData, frequency);
    const totalInvestments = investmentDates.length;
    const totalDCAAmount = dcaAmount * totalInvestments;
    
    // Get final values
    const lumpSumFinalValue = processedData[processedData.length - 1].lumpSumValue || 0;
    const dcaFinalValue = processedData[processedData.length - 1].dcaValue || 0;
    
    // Calculate CAGR
    const lumpSumCAGR = calculateCAGR(lumpSumAmount, lumpSumFinalValue, years);
    const dcaCAGR = calculateCAGR(totalDCAAmount, dcaFinalValue, years);
    
    // Calculate total units - for lump sum, it's just the investment amount divided by the initial price
    const initialPrice = processedData[0].close;
    const lumpSumUnits = lumpSumAmount / initialPrice;
    
    // For DCA, calculate the total units
    let dcaUnits = 0;
    let totalInvestedAmount = 0;
    
    for (let i = 0; i < investmentDates.length; i++) {
      const date = investmentDates[i];
      if (date.normalizedClose && date.normalizedClose > 0) {
        const unitsPurchased = dcaAmount / (initialPrice * date.normalizedClose);
        dcaUnits += unitsPurchased;
        totalInvestedAmount += dcaAmount;
      }
    }
    
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
    const normalizedBackup = normalizeData(backupData);
    const lumpSumSimulated = simulateLumpSum(normalizedBackup, lumpSumAmount);
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
    
    // Calculate units for the backup data
    const initialPrice = dcaSimulated[0].close;
    const lumpSumUnits = lumpSumAmount / initialPrice;
    
    // For DCA, approximate the units based on the average normalized price
    let dcaUnits = 0;
    for (let i = 0; i < approxTotalInvestments; i++) {
      // Use a simple average normalized price for the approximation
      const avgNormalizedPrice = 1 + (dcaSimulated[dcaSimulated.length - 1].normalizedClose || 1 - 1) / 2;
      dcaUnits += dcaAmount / (initialPrice * avgNormalizedPrice);
    }
    
    return {
      data: dcaSimulated,
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
  }
};
