export interface HistoricalData {
  timestamp: string;
  pnl: number;
  maxDrawdown: number;
  avgTradeSize: number;
  roi: number;
  sharpeRatio: number;
  numTrades: number;
  volatility: number;
}

export interface Participant {
  id: string;
  name: string;
  handle: string;
  pnl: string;
  pnlValue: number;
  avatar: string;
  rank: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  country: string;
  nationality: string;
  countryCode: string;
  historicalData: {
    '1D': HistoricalData[];
    '1W': HistoricalData[];
    '1M': HistoricalData[];
  };
}

const generateHistoricalData = (timeframe: '1D' | '1W' | '1M', basePnl: number): HistoricalData[] => {
  const periods = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
  const data: HistoricalData[] = [];
  let currentPnl = basePnl * 0.3; // Start at 30% of final PnL
  
  for (let i = 0; i < periods; i++) {
    const volatility = 0.02 + Math.random() * 0.08; // 2-10%
    const change = (Math.random() - 0.5) * basePnl * 0.1;
    currentPnl += change;
    
    const timestamp = timeframe === '1D' 
      ? new Date(Date.now() - (periods - 1 - i) * 60 * 60 * 1000).toISOString()
      : timeframe === '1W'
      ? new Date(Date.now() - (periods - 1 - i) * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() - (periods - 1 - i) * 24 * 60 * 60 * 1000).toISOString();
    
    data.push({
      timestamp,
      pnl: currentPnl,
      maxDrawdown: Math.abs(Math.random() * 20), // 0-20%
      avgTradeSize: 500 + Math.random() * 9500, // $500-$10k
      roi: (currentPnl / 10000) * 100, // ROI based on $10k starting capital
      sharpeRatio: -1 + Math.random() * 4, // -1 to 3
      numTrades: Math.floor(5 + Math.random() * 20), // 5-25 trades
      volatility: volatility * 100
    });
  }
  
  return data;
};

const countries = [
  { name: 'Ireland', nationality: 'Irish', code: 'IE' },
  { name: 'United States', nationality: 'American', code: 'US' },
  { name: 'United Kingdom', nationality: 'British', code: 'GB' },
  { name: 'Germany', nationality: 'German', code: 'DE' },
  { name: 'France', nationality: 'French', code: 'FR' },
  { name: 'Italy', nationality: 'Italian', code: 'IT' },
  { name: 'Spain', nationality: 'Spanish', code: 'ES' },
  { name: 'Netherlands', nationality: 'Dutch', code: 'NL' },
  { name: 'Canada', nationality: 'Canadian', code: 'CA' },
  { name: 'Australia', nationality: 'Australian', code: 'AU' },
  { name: 'Japan', nationality: 'Japanese', code: 'JP' },
  { name: 'South Korea', nationality: 'Korean', code: 'KR' },
  { name: 'Singapore', nationality: 'Singaporean', code: 'SG' },
  { name: 'Switzerland', nationality: 'Swiss', code: 'CH' },
  { name: 'Sweden', nationality: 'Swedish', code: 'SE' }
];

export const generateParticipants = (): Participant[] => {
  const names = [
    'Alex Chen', 'Sarah Kim', 'Mike Johnson', 'Emily Davis', 'Frank Whitaker', 'Lisa Wang', 'David Smith', 'Anna Lee', 'Tom Brown', 'Jessica Martinez',
    'Ryan Thompson', 'Nicole Chang', 'Kevin Liu', 'Amanda Rodriguez', 'Chris Wilson', 'Sophia Garcia', 'Daniel Park', 'Michelle Foster', 'Brandon Lee', 'Rachel Green',
    'Justin Taylor', 'Olivia Anderson', 'Tyler Moore', 'Hannah White', 'Jordan Clark', 'Samantha Harris', 'Austin Young', 'Victoria Lopez', 'Ethan King', 'Megan Wright',
    'Noah Hill', 'Chloe Scott', 'Mason Adams', 'Grace Turner', 'Logan Mitchell', 'Zoe Campbell', 'Lucas Martinez', 'Lily Parker', 'Hunter Davis', 'Aria Wilson',
    'Carter Rodriguez', 'Maya Johnson', 'Blake Thompson', 'Nora Garcia', 'Owen Anderson', 'Ella Martinez', 'Wyatt Taylor', 'Scarlett Brown', 'Grayson Moore', 'Violet Jones',
    'Leo Williams', 'Hazel Davis', 'Hudson Miller', 'Aurora Wilson', 'Axel Garcia', 'Luna Rodriguez', 'Kai Johnson', 'Nova Thompson', 'Felix Anderson', 'Isla Taylor',
    'Asher Brown', 'Willow Jones', 'Jaxon Williams', 'Ivy Davis', 'Knox Miller', 'Ember Wilson', 'Rowan Garcia', 'Sage Rodriguez', 'Atlas Johnson', 'River Thompson',
    'Phoenix Anderson', 'Sky Taylor', 'Storm Brown', 'Rain Jones', 'Ocean Williams', 'Dawn Davis', 'Ridge Miller', 'Vale Wilson', 'Canyon Garcia', 'Brook Rodriguez',
    'Forest Johnson', 'Meadow Thompson', 'River Anderson', 'Lake Taylor', 'Summit Brown', 'Valley Jones', 'Peak Williams', 'Bay Davis', 'Cliff Miller', 'Shore Wilson',
    'Stone Garcia', 'Coral Rodriguez', 'Reef Johnson', 'Wave Thompson', 'Tide Anderson', 'Creek Taylor', 'Dune Brown', 'Oasis Jones', 'Grove Williams', 'Field Davis',
    'Marcus Johnson', 'Elena Rodriguez', 'James Wilson', 'Sofia Martinez', 'Lucas Anderson', 'Isabella Garcia', 'Mason Thompson', 'Ava Davis', 'Ethan Miller', 'Mia Brown'
  ];

  const avatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612c4b0?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f85?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=100&h=100&fit=crop&crop=face'
  ];

  const participants: Participant[] = [];

  for (let i = 0; i < 100; i++) {
    const rank = i + 1;
    let tier: 'S' | 'A' | 'B' | 'C' | 'D';
    let pnlValue: number;

    // Determine tier and PnL based on rank
    if (rank <= 10) {
      tier = 'S';
      pnlValue = Math.random() * 50000 + 20000; // $20k - $70k
    } else if (rank <= 25) {
      tier = 'A';
      pnlValue = Math.random() * 25000 + 10000; // $10k - $35k
    } else if (rank <= 50) {
      tier = 'B';
      pnlValue = Math.random() * 15000 + 2000; // $2k - $17k
    } else if (rank <= 75) {
      tier = 'C';
      pnlValue = Math.random() * 8000 - 2000; // -$2k - $6k
    } else {
      tier = 'D';
      pnlValue = Math.random() * -10000 - 1000; // -$1k - -$11k
    }

    // Add some randomness to make losses more realistic
    if (Math.random() < 0.3 && rank > 20) {
      pnlValue = -Math.abs(pnlValue * 0.3);
    }

    const name = names[i % names.length];
    const handle = `@${name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(Math.random() * 999)}`;
    const country = countries[i % countries.length];
    
    participants.push({
      id: `participant-${i + 1}`,
      name,
      handle,
      pnl: pnlValue >= 0 ? `+$${Math.floor(pnlValue).toLocaleString()}` : `-$${Math.floor(Math.abs(pnlValue)).toLocaleString()}`,
      pnlValue,
      avatar: avatars[i % avatars.length],
      rank,
      tier,
      country: country.name,
      nationality: country.nationality,
      countryCode: country.code,
      historicalData: {
        '1D': generateHistoricalData('1D', pnlValue),
        '1W': generateHistoricalData('1W', pnlValue),
        '1M': generateHistoricalData('1M', pnlValue)
      }
    });
  }

  // Sort by PnL value descending
  return participants.sort((a, b) => b.pnlValue - a.pnlValue);
};

export const mockParticipants = generateParticipants();