export interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  country: string;
  countryCode: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  previous: string;
  forecast: string;
  actual?: string;
  currency: string;
  description: string;
  methodology: string;
  marketImpact: string;
  historicalData: Array<{ date: string; value: number }>;
  relatedEvents: string[];
  sourceUrl?: string;
  nextRelease?: string;
}

export const mockEconomicEvents: EconomicEvent[] = [
  {
    id: '1',
    date: '2025-07-10',
    time: '08:30',
    country: 'United States',
    countryCode: 'US',
    event: 'Consumer Price Index (CPI)',
    impact: 'high',
    previous: '3.2%',
    forecast: '3.1%',
    currency: 'USD',
    description: 'The Consumer Price Index measures the average change in prices paid by consumers for goods and services. It is a key indicator of inflation and is closely watched by the Federal Reserve for monetary policy decisions.',
    methodology: 'Based on a market basket of goods and services purchased by urban consumers, representing approximately 93% of the total U.S. population.',
    marketImpact: 'High impact on USD, bond yields, and equity markets. Higher than expected readings typically strengthen USD and increase bond yields.',
    historicalData: [
      { date: '2025-04-10', value: 3.5 },
      { date: '2025-05-10', value: 3.3 },
      { date: '2025-06-10', value: 3.2 }
    ],
    relatedEvents: ['Core CPI', 'Producer Price Index', 'Federal Reserve Meeting'],
    sourceUrl: 'https://www.bls.gov',
    nextRelease: '2025-08-10'
  },
  {
    id: '2',
    date: '2025-07-10',
    time: '10:00',
    country: 'Germany',
    countryCode: 'DE',
    event: 'Industrial Production',
    impact: 'medium',
    previous: '1.5%',
    forecast: '1.2%',
    currency: 'EUR',
    description: 'Industrial Production measures the change in the total inflation-adjusted value of output produced by manufacturers, mines, and utilities.',
    methodology: 'Monthly data collected from manufacturers across key industrial sectors including automotive, machinery, and chemicals.',
    marketImpact: 'Moderate impact on EUR. Strong readings indicate economic growth and can support the Euro against other currencies.',
    historicalData: [
      { date: '2025-04-10', value: 0.8 },
      { date: '2025-05-10', value: 1.2 },
      { date: '2025-06-10', value: 1.5 }
    ],
    relatedEvents: ['GDP Growth', 'Manufacturing PMI', 'Export Data'],
    sourceUrl: 'https://www.destatis.de',
    nextRelease: '2025-08-10'
  },
  {
    id: '3',
    date: '2025-07-10',
    time: '14:00',
    country: 'United States',
    countryCode: 'US',
    event: 'Federal Reserve Interest Rate Decision',
    impact: 'high',
    previous: '5.25%',
    forecast: '5.25%',
    currency: 'USD',
    description: 'The Federal Open Market Committee (FOMC) sets the federal funds rate, which influences short-term interest rates and overall monetary policy.',
    methodology: 'Decision made by the 12-member FOMC based on economic data, inflation targets, and employment levels.',
    marketImpact: 'Extremely high impact across all markets. Rate changes directly affect USD strength, bond yields, and equity valuations.',
    historicalData: [
      { date: '2025-03-10', value: 5.25 },
      { date: '2025-05-10', value: 5.25 },
      { date: '2025-06-10', value: 5.25 }
    ],
    relatedEvents: ['FOMC Statement', 'Fed Chair Press Conference', 'Economic Projections'],
    sourceUrl: 'https://www.federalreserve.gov',
    nextRelease: '2025-09-10'
  },
  {
    id: '4',
    date: '2025-07-11',
    time: '09:30',
    country: 'United Kingdom',
    countryCode: 'GB',
    event: 'GDP Growth Rate',
    impact: 'high',
    previous: '0.6%',
    forecast: '0.4%',
    currency: 'GBP',
    description: 'Gross Domestic Product measures the total value of goods and services produced within the UK economy.',
    methodology: 'Quarterly data compiled from production, income, and expenditure approaches by the Office for National Statistics.',
    marketImpact: 'High impact on GBP. Strong GDP growth typically strengthens the Pound and influences Bank of England policy decisions.',
    historicalData: [
      { date: '2025-04-11', value: 0.2 },
      { date: '2025-05-11', value: 0.4 },
      { date: '2025-06-11', value: 0.6 }
    ],
    relatedEvents: ['Manufacturing PMI', 'Services PMI', 'Employment Data'],
    sourceUrl: 'https://www.ons.gov.uk',
    nextRelease: '2025-10-11'
  },
  {
    id: '5',
    date: '2025-07-11',
    time: '12:00',
    country: 'Japan',
    countryCode: 'JP',
    event: 'Bank of Japan Policy Meeting',
    impact: 'high',
    previous: '-0.1%',
    forecast: '-0.1%',
    currency: 'JPY',
    description: 'The Bank of Japan policy meeting determines monetary policy including interest rates and quantitative easing measures.',
    methodology: 'Decision made by the 9-member Policy Board based on economic outlook and price stability targets.',
    marketImpact: 'Very high impact on JPY and Japanese markets. Policy changes can significantly affect carry trades and global risk sentiment.',
    historicalData: [
      { date: '2025-03-11', value: -0.1 },
      { date: '2025-05-11', value: -0.1 },
      { date: '2025-06-11', value: -0.1 }
    ],
    relatedEvents: ['BOJ Statement', 'Economic Outlook Report', 'Governor Press Conference'],
    sourceUrl: 'https://www.boj.or.jp',
    nextRelease: '2025-09-11'
  },
  {
    id: '6',
    date: '2025-07-11',
    time: '08:30',
    country: 'United States',
    countryCode: 'US',
    event: 'Unemployment Rate',
    impact: 'medium',
    previous: '3.7%',
    forecast: '3.6%',
    currency: 'USD',
    description: 'The unemployment rate represents the percentage of the labor force that is unemployed and actively seeking employment.',
    methodology: 'Monthly survey of approximately 60,000 households conducted by the Bureau of Labor Statistics.',
    marketImpact: 'Moderate to high impact on USD. Lower unemployment typically supports USD strength and can influence Fed policy.',
    historicalData: [
      { date: '2025-04-11', value: 3.9 },
      { date: '2025-05-11', value: 3.8 },
      { date: '2025-06-11', value: 3.7 }
    ],
    relatedEvents: ['Non-Farm Payrolls', 'Job Openings', 'Average Hourly Earnings'],
    sourceUrl: 'https://www.bls.gov',
    nextRelease: '2025-08-11'
  },
  {
    id: '7',
    date: '2025-07-12',
    time: '10:00',
    country: 'Eurozone',
    countryCode: 'EU',
    event: 'ECB Interest Rate Decision',
    impact: 'high',
    previous: '4.50%',
    forecast: '4.25%',
    currency: 'EUR',
    description: 'The European Central Bank sets the main refinancing rate and other key interest rates for the Eurozone.',
    methodology: 'Decision made by the 25-member Governing Council based on price stability mandate and economic conditions.',
    marketImpact: 'Very high impact on EUR and European markets. Rate changes affect borrowing costs and economic activity across the Eurozone.',
    historicalData: [
      { date: '2025-03-12', value: 4.75 },
      { date: '2025-05-12', value: 4.50 },
      { date: '2025-06-12', value: 4.50 }
    ],
    relatedEvents: ['ECB Press Conference', 'Economic Bulletin', 'Inflation Projections'],
    sourceUrl: 'https://www.ecb.europa.eu',
    nextRelease: '2025-09-12'
  },
  {
    id: '8',
    date: '2025-07-12',
    time: '08:30',
    country: 'Canada',
    countryCode: 'CA',
    event: 'Retail Sales',
    impact: 'medium',
    previous: '0.8%',
    forecast: '0.6%',
    currency: 'CAD',
    description: 'Retail Sales measures the change in the total value of sales at the retail level, indicating consumer spending patterns.',
    methodology: 'Monthly survey of retail establishments across Canada conducted by Statistics Canada.',
    marketImpact: 'Moderate impact on CAD. Strong retail sales indicate healthy consumer spending and economic growth.',
    historicalData: [
      { date: '2025-04-12', value: 0.3 },
      { date: '2025-05-12', value: 0.5 },
      { date: '2025-06-12', value: 0.8 }
    ],
    relatedEvents: ['Consumer Price Index', 'Employment Data', 'GDP Growth'],
    sourceUrl: 'https://www.statcan.gc.ca',
    nextRelease: '2025-08-12'
  },
  {
    id: '9',
    date: '2025-07-12',
    time: '15:30',
    country: 'Australia',
    countryCode: 'AU',
    event: 'Employment Change',
    impact: 'medium',
    previous: '64.1K',
    forecast: '45.0K',
    currency: 'AUD',
    description: 'Employment Change measures the change in the number of employed people during the previous month.',
    methodology: 'Monthly Labour Force Survey conducted by the Australian Bureau of Statistics covering approximately 26,000 dwellings.',
    marketImpact: 'Moderate to high impact on AUD. Strong employment growth supports AUD strength and RBA policy expectations.',
    historicalData: [
      { date: '2025-04-12', value: 38.5 },
      { date: '2025-05-12', value: 52.3 },
      { date: '2025-06-12', value: 64.1 }
    ],
    relatedEvents: ['Unemployment Rate', 'Participation Rate', 'RBA Meeting'],
    sourceUrl: 'https://www.abs.gov.au',
    nextRelease: '2025-08-12'
  },
  {
    id: '10',
    date: '2025-07-13',
    time: '09:00',
    country: 'China',
    countryCode: 'CN',
    event: 'Trade Balance',
    impact: 'medium',
    previous: '$75.34B',
    forecast: '$72.00B',
    currency: 'CNY',
    description: 'Trade Balance measures the difference between the value of exports and imports, indicating the country\'s trade competitiveness.',
    methodology: 'Monthly data compiled by China\'s General Administration of Customs covering all international trade transactions.',
    marketImpact: 'Moderate impact on CNY and global markets. Strong trade surplus typically supports CNY and indicates economic strength.',
    historicalData: [
      { date: '2025-04-13', value: 68.9 },
      { date: '2025-05-13', value: 72.4 },
      { date: '2025-06-13', value: 75.34 }
    ],
    relatedEvents: ['Export Growth', 'Import Growth', 'Manufacturing PMI'],
    sourceUrl: 'http://english.customs.gov.cn',
    nextRelease: '2025-08-13'
  }
];