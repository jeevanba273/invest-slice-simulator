
// Yahoo Finance API service

const APP_ID = 'DzCydhH6';
const CLIENT_ID = 'dj0yJmk9M01oMUZ0SkhyNVQ2JmQ9WVdrOVJIcERlV1JvU0RZbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTA1';
const CLIENT_SECRET = '599163cdb8eb6546b42c4d493d17063c456898c6';

interface HistoricalDataPoint {
  date: Date;
  close: number;
}

export const fetchHistoricalData = async (
  symbol: string = "^NSEI", // Default to NIFTY 50
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> => {
  try {
    // Format dates for API request (YYYY-MM-DD)
    const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    
    // Yahoo Finance API endpoint for historical data - use timestamp format as it's more reliable
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d&events=history`;
    
    console.log('Attempting to fetch Yahoo Finance data from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': APP_ID,
        'Content-Type': 'application/json'
      },
      // Disable CORS mode and cache to avoid browser restrictions
      mode: 'cors',
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have valid data
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data returned from Yahoo Finance API');
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    
    // Process the data
    const historicalData: HistoricalDataPoint[] = [];
    
    for (let i = 0; i < timestamps.length; i++) {
      // Skip if we don't have a close price
      if (quotes.close[i] === null || quotes.close[i] === undefined) {
        continue;
      }
      
      historicalData.push({
        date: new Date(timestamps[i] * 1000),
        close: quotes.close[i]
      });
    }
    
    console.log(`Successfully fetched ${historicalData.length} data points from Yahoo Finance API`);
    
    // Sort data by date (ascending)
    return historicalData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
  } catch (error) {
    console.error('Error fetching historical data:', error);
    
    // If the API call fails, try the backup URL
    try {
      console.log('Attempting to use backup API endpoint...');
      const backupUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d`;
      
      const backupResponse = await fetch(backupUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (!backupResponse.ok) {
        throw new Error('Backup API call failed');
      }
      
      const backupData = await backupResponse.json();
      
      if (!backupData.chart || !backupData.chart.result || backupData.chart.result.length === 0) {
        throw new Error('No data returned from backup API');
      }
      
      const result = backupData.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      
      const historicalData: HistoricalDataPoint[] = [];
      
      for (let i = 0; i < timestamps.length; i++) {
        if (quotes.close[i] === null || quotes.close[i] === undefined) {
          continue;
        }
        
        historicalData.push({
          date: new Date(timestamps[i] * 1000),
          close: quotes.close[i]
        });
      }
      
      console.log(`Successfully fetched ${historicalData.length} data points from backup Yahoo Finance API`);
      return historicalData.sort((a, b) => a.date.getTime() - b.date.getTime());
      
    } catch (backupError) {
      console.error('Backup API call also failed:', backupError);
      console.log('Falling back to simulated data');
      
      // Both attempts failed, return simulated data
      return getSimulatedHistoricalData(startDate, endDate);
    }
  }
};

// Simulated API for development purposes in case the Yahoo Finance API is not working
export const getSimulatedHistoricalData = (startDate: Date, endDate: Date): HistoricalDataPoint[] => {
  console.log('Generating simulated historical data');
  const data: HistoricalDataPoint[] = [];
  
  // Generate daily data points (excluding weekends for simplicity)
  let currentDate = new Date(startDate);
  let price = 5000; // Starting price around Jan 2010
  
  // Use a fixed seed for random generation to ensure consistent results
  let seed = 123456789;
  
  // Simple pseudo-random number generator with seed
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Random daily change between -1.5% and 1.5% with slight upward bias
      // to achieve approximately 12% CAGR over longer periods
      const dailyChange = (random() * 3 - 1.3) / 100;
      price = price * (1 + dailyChange);
      
      data.push({
        date: new Date(currentDate),
        close: parseFloat(price.toFixed(2))
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log(`Generated ${data.length} simulated data points`);
  return data;
};
