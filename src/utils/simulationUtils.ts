// Data types
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

// Mock historical data for NIFTY 50 (^NSEI)
// In a real implementation, this would be fetched from an API
const generateMockHistoricalData = (startDate: Date, endDate: Date): DataPoint[] => {
  const data: DataPoint[] = [];
  
  // Generate daily data points (excluding weekends for simplicity)
  let currentDate = new Date(startDate);
  let price = 5000; // Starting price around Jan 2010
  
  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Random daily change between -1.5% and 1.5% with slight upward bias
      // to achieve approximately 12% CAGR over longer periods
      const dailyChange = (Math.random() * 3 - 1.3) / 100;
      price = price * (1 + dailyChange);
      
      data.push({
        date: new Date(currentDate),
        close: parseFloat(price.toFixed(2))
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
};

// Calculate CAGR (Compound Annual Growth Rate)
const calculateCAGR = (initialValue: number, finalValue: number, years: number): number => {
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
function investmentDates(data: DataPoint[], frequency: 'monthly' | 'quarterly' | 'yearly'): DataPoint[] {
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
export const runSimulation = (
  lumpSumAmount: number,
  dcaAmount: number,
  frequency: 'monthly' | 'quarterly' | 'yearly',
  startDate: Date,
  endDate: Date
): SimulationResult => {
  // Get historical data (mock for now)
  let data = generateMockHistoricalData(startDate, endDate);
  
  // Run Lump Sum simulation
  data = simulateLumpSum(data, lumpSumAmount);
  
  // Run DCA simulation
  data = simulateDCA(data, dcaAmount, frequency);
  
  // Calculate performance metrics
  const initialLumpSumValue = lumpSumAmount;
  // DCA doesn't have a single initial value since it's invested over time
  
  const years = (data[data.length - 1].date.getTime() - data[0].date.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  const lumpSumFinalValue = data[data.length - 1].lumpSumValue || 0;
  const dcaFinalValue = data[data.length - 1].dcaValue || 0;
  
  const lumpSumCAGR = calculateCAGR(initialLumpSumValue, lumpSumFinalValue, years);
  
  // For DCA CAGR, we need to calculate the total amount invested
  const totalInvestments = investmentDates(data, frequency).length;
  const totalDCAInvestment = dcaAmount * totalInvestments;
  
  // Calculate the weighted average time of investment for DCA
  // Simple approximation: assuming investments are evenly distributed over time
  const dcaWeightedYears = years / 2;
  const dcaCAGR = calculateCAGR(totalDCAInvestment, dcaFinalValue, dcaWeightedYears);
  
  const lumpSumUnits = lumpSumAmount / data[0].close;
  
  // Calculate total DCA units (sum of all periodic purchases)
  const dcaUnits = data[data.length - 1].dcaValue! / data[data.length - 1].close;
  
  return {
    data,
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
};
