export interface Tournament {
  id: string;
  name: string;
  type: 'Real Money' | 'SIM';
  division: 'Raider' | 'Crusader' | 'Elevator';
  startDate: Date;
  endDate: Date;
  prizePool: string;
  entryFee: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'Live Now' | 'Upcoming' | 'Sold Out' | 'Registration Open' | 'Completed';
  description: string;
  rules: string[];
  ticketSourceEventId?: string;
}

export const tournaments: Tournament[] = [
  // Current and Upcoming Tournaments (July 2024 onwards)
  {
    id: 'raider-july-2024',
    name: 'Raider Tournament - July 2024',
    type: 'Real Money',
    division: 'Raider',
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-19'),
    prizePool: '$50,000 + $250,000 Trading Account',
    entryFee: '$1,500',
    maxParticipants: 100,
    currentParticipants: 89,
    status: 'Registration Open',
    description: 'Professional 5-day real money trading tournament for experienced traders.',
    rules: [
      'Real money trading with live accounts',
      'Leverage: 1:20',
      'Maximum Loss: $10,000',
      'Maximum Daily Loss: $5,000'
    ],
    ticketSourceEventId: 'raider-july-2024'
  },
  {
    id: 'crusader-july-2024',
    name: 'Crusader Tournament - July 2024',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2024-07-22'),
    endDate: new Date('2024-07-24'),
    prizePool: '$10,000 Cash Prizes + Trading Accounts',
    entryFee: '$65',
    maxParticipants: 200,
    currentParticipants: 156,
    status: 'Registration Open',
    description: '3-day simulation tournament with real cash prizes.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 10 winners receive $1,000 Zimtra accounts'
    ],
    ticketSourceEventId: 'crusader-july-2024'
  },
  {
    id: 'elevator-july-2024',
    name: 'Elevator Tournament - July 2024',
    type: 'SIM',
    division: 'Elevator',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-31'),
    prizePool: 'Free Crusader Tournament Tickets',
    entryFee: '$65',
    maxParticipants: 500,
    currentParticipants: 423,
    status: 'Live Now',
    description: 'Month-long beginner tournament. Top 10% earn free Crusader tickets.',
    rules: [
      'Simulation trading for beginners',
      'Full month duration',
      'Top 10% advance to Crusader Tournament'
    ],
    ticketSourceEventId: 'elevator-july-2024'
  },
  
  // August 2024
  {
    id: 'raider-august-2024',
    name: 'Raider Tournament - August 2024',
    type: 'Real Money',
    division: 'Raider',
    startDate: new Date('2024-08-05'),
    endDate: new Date('2024-08-09'),
    prizePool: '$50,000 + $250,000 Trading Account',
    entryFee: '$1,500',
    maxParticipants: 100,
    currentParticipants: 34,
    status: 'Registration Open',
    description: 'Professional 5-day real money trading tournament for experienced traders.',
    rules: [
      'Real money trading with live accounts',
      'Leverage: 1:20',
      'Maximum Loss: $10,000',
      'Maximum Daily Loss: $5,000'
    ],
    ticketSourceEventId: 'raider-august-2024'
  },
  {
    id: 'crusader-august-2024',
    name: 'Crusader Tournament - August 2024',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2024-08-19'),
    endDate: new Date('2024-08-21'),
    prizePool: '$10,000 Cash Prizes + Trading Accounts',
    entryFee: '$65',
    maxParticipants: 200,
    currentParticipants: 67,
    status: 'Registration Open',
    description: '3-day simulation tournament with real cash prizes.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 10 winners receive $1,000 Zimtra accounts'
    ],
    ticketSourceEventId: 'crusader-august-2024'
  },
  {
    id: 'elevator-august-2024',
    name: 'Elevator Tournament - August 2024',
    type: 'SIM',
    division: 'Elevator',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-08-31'),
    prizePool: 'Free Crusader Tournament Tickets',
    entryFee: '$65',
    maxParticipants: 500,
    currentParticipants: 234,
    status: 'Registration Open',
    description: 'Month-long beginner tournament. Top 10% earn free Crusader tickets.',
    rules: [
      'Simulation trading for beginners',
      'Full month duration',
      'Top 10% advance to Crusader Tournament'
    ],
    ticketSourceEventId: 'elevator-august-2024'
  },
  
  // September 2024
  {
    id: 'raider-september-2024',
    name: 'Raider Tournament - September 2024',
    type: 'Real Money',
    division: 'Raider',
    startDate: new Date('2024-09-09'),
    endDate: new Date('2024-09-13'),
    prizePool: '$50,000 + $250,000 Trading Account',
    entryFee: '$1,500',
    maxParticipants: 100,
    currentParticipants: 12,
    status: 'Registration Open',
    description: 'Professional 5-day real money trading tournament for experienced traders.',
    rules: [
      'Real money trading with live accounts',
      'Leverage: 1:20',
      'Maximum Loss: $10,000',
      'Maximum Daily Loss: $5,000'
    ],
    ticketSourceEventId: 'raider-september-2024'
  },
  {
    id: 'crusader-september-2024',
    name: 'Crusader Tournament - September 2024',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2024-09-23'),
    endDate: new Date('2024-09-25'),
    prizePool: '$10,000 Cash Prizes + Trading Accounts',
    entryFee: '$65',
    maxParticipants: 200,
    currentParticipants: 45,
    status: 'Registration Open',
    description: '3-day simulation tournament with real cash prizes.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 10 winners receive $1,000 Zimtra accounts'
    ],
    ticketSourceEventId: 'crusader-september-2024'
  },
  {
    id: 'elevator-september-2024',
    name: 'Elevator Tournament - September 2024',
    type: 'SIM',
    division: 'Elevator',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-09-30'),
    prizePool: 'Free Crusader Tournament Tickets',
    entryFee: '$65',
    maxParticipants: 500,
    currentParticipants: 78,
    status: 'Upcoming',
    description: 'Month-long beginner tournament. Top 10% earn free Crusader tickets.',
    rules: [
      'Simulation trading for beginners',
      'Full month duration',
      'Top 10% advance to Crusader Tournament'
    ],
    ticketSourceEventId: 'elevator-september-2024'
  },
  
  // October 2024
  {
    id: 'raider-october-2024',
    name: 'Raider Tournament - October 2024',
    type: 'Real Money',
    division: 'Raider',
    startDate: new Date('2024-10-14'),
    endDate: new Date('2024-10-18'),
    prizePool: '$50,000 + $250,000 Trading Account',
    entryFee: '$1,500',
    maxParticipants: 100,
    currentParticipants: 8,
    status: 'Registration Open',
    description: 'Professional 5-day real money trading tournament for experienced traders.',
    rules: [
      'Real money trading with live accounts',
      'Leverage: 1:20',
      'Maximum Loss: $10,000',
      'Maximum Daily Loss: $5,000'
    ],
    ticketSourceEventId: 'raider-october-2024'
  },
  {
    id: 'crusader-mid-october-2024',
    name: 'Crusader Mid-Month Challenge - October',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2024-10-07'),
    endDate: new Date('2024-10-08'),
    prizePool: '$5,000 Cash Prizes',
    entryFee: '$35',
    maxParticipants: 150,
    currentParticipants: 23,
    status: 'Registration Open',
    description: '2-day simulation tournament with fast-paced trading.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 5 winners receive cash prizes'
    ],
    ticketSourceEventId: 'crusader-mid-october-2024'
  },
  {
    id: 'crusader-october-2024',
    name: 'Crusader Tournament - October 2024',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2024-10-28'),
    endDate: new Date('2024-10-30'),
    prizePool: '$10,000 Cash Prizes + Trading Accounts',
    entryFee: '$65',
    maxParticipants: 200,
    currentParticipants: 31,
    status: 'Registration Open',
    description: '3-day simulation tournament with real cash prizes.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 10 winners receive $1,000 Zimtra accounts'
    ],
    ticketSourceEventId: 'crusader-october-2024'
  },
  {
    id: 'elevator-october-2024',
    name: 'Elevator Tournament - October 2024',
    type: 'SIM',
    division: 'Elevator',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-10-31'),
    prizePool: 'Free Crusader Tournament Tickets',
    entryFee: '$65',
    maxParticipants: 500,
    currentParticipants: 15,
    status: 'Upcoming',
    description: 'Month-long beginner tournament. Top 10% earn free Crusader tickets.',
    rules: [
      'Simulation trading for beginners',
      'Full month duration',
      'Top 10% advance to Crusader Tournament'
    ],
    ticketSourceEventId: 'elevator-october-2024'
  },

  // 2025 Tournaments (keeping some future ones)
  {
    id: 'raider-jan-2025',
    name: 'Raider Tournament - January 2025',
    type: 'Real Money',
    division: 'Raider',
    startDate: new Date('2025-01-13'),
    endDate: new Date('2025-01-17'),
    prizePool: '$50,000 + $250,000 Trading Account',
    entryFee: '$1,500',
    maxParticipants: 100,
    currentParticipants: 67,
    status: 'Registration Open',
    description: 'Professional 5-day real money trading tournament for experienced traders.',
    rules: [
      'Real money trading with live accounts',
      'Leverage: 1:20',
      'Maximum Loss: $10,000',
      'Maximum Daily Loss: $5,000'
    ],
    ticketSourceEventId: 'raider-jan-2025'
  },
  {
    id: 'crusader-jan-2025',
    name: 'Crusader Tournament - January 2025',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-01-22'),
    prizePool: '$10,000 Cash Prizes + Trading Accounts',
    entryFee: '$65',
    maxParticipants: 200,
    currentParticipants: 143,
    status: 'Registration Open',
    description: '3-day simulation tournament with real cash prizes.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 10 winners receive $1,000 Zimtra accounts'
    ],
    ticketSourceEventId: 'crusader-jan-2025'
  },
  {
    id: 'elevator-jan-2025',
    name: 'Elevator Tournament - January 2025',
    type: 'SIM',
    division: 'Elevator',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31'),
    prizePool: 'Free Crusader Tournament Tickets',
    entryFee: '$65',
    maxParticipants: 500,
    currentParticipants: 312,
    status: 'Live Now',
    description: 'Month-long beginner tournament. Top 10% earn free Crusader tickets.',
    rules: [
      'Simulation trading for beginners',
      'Full month duration',
      'Top 10% advance to Crusader Tournament'
    ],
    ticketSourceEventId: 'elevator-jan-2025'
  },
  {
    id: 'crusader-feb-2025',
    name: 'Crusader Tournament - February 2025',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2025-02-17'),
    endDate: new Date('2025-02-19'),
    prizePool: '$10,000 Cash Prizes + Trading Accounts',
    entryFee: '$65',
    maxParticipants: 200,
    currentParticipants: 200,
    status: 'Sold Out',
    description: '3-day simulation tournament with real cash prizes.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 10 winners receive $1,000 Zimtra accounts'
    ],
    ticketSourceEventId: 'crusader-feb-2025'
  },
  {
    id: 'elevator-feb-2025',
    name: 'Elevator Tournament - February 2025',
    type: 'SIM',
    division: 'Elevator',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-02-28'),
    prizePool: 'Free Crusader Tournament Tickets',
    entryFee: '$65',
    maxParticipants: 500,
    currentParticipants: 0,
    status: 'Upcoming',
    description: 'Month-long beginner tournament. Top 10% earn free Crusader tickets.',
    rules: [
      'Simulation trading for beginners',
      'Full month duration',
      'Top 10% advance to Crusader Tournament'
    ],
    ticketSourceEventId: 'elevator-feb-2025'
  },
  {
    id: 'raider-jan-weekend',
    name: 'Raider Weekend Special',
    type: 'Real Money',
    division: 'Raider',
    startDate: new Date('2025-01-25'),
    endDate: new Date('2025-01-26'),
    prizePool: '$25,000 + $100,000 Trading Account',
    entryFee: '$750',
    maxParticipants: 50,
    currentParticipants: 35,
    status: 'Registration Open',
    description: 'Weekend intensive real money tournament.',
    rules: [
      'Real money trading with live accounts',
      'Leverage: 1:20',
      'Maximum Loss: $5,000',
      'Maximum Daily Loss: $2,500'
    ],
    ticketSourceEventId: 'raider-jan-weekend'
  },
  {
    id: 'crusader-jan-mid',
    name: 'Crusader Mid-Month Challenge',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-16'),
    prizePool: '$5,000 Cash Prizes',
    entryFee: '$35',
    maxParticipants: 150,
    currentParticipants: 89,
    status: 'Registration Open',
    description: '2-day simulation tournament with fast-paced trading.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 5 winners receive cash prizes'
    ],
    ticketSourceEventId: 'crusader-jan-mid'
  },
  {
    id: 'crusader-march-2025',
    name: 'Crusader Tournament - March 2025',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2025-03-10'),
    endDate: new Date('2025-03-12'),
    prizePool: '$10,000 Cash Prizes + Trading Accounts',
    entryFee: '$65',
    maxParticipants: 200,
    currentParticipants: 12,
    status: 'Registration Open',
    description: '3-day simulation tournament with real cash prizes.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 10 winners receive $1,000 Zimtra accounts'
    ],
    ticketSourceEventId: 'crusader-march-2025'
  },
  {
    id: 'elevator-march-2025',
    name: 'Elevator Tournament - March 2025',
    type: 'SIM',
    division: 'Elevator',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-03-31'),
    prizePool: 'Free Crusader Tournament Tickets',
    entryFee: '$65',
    maxParticipants: 500,
    currentParticipants: 0,
    status: 'Upcoming',
    description: 'Month-long beginner tournament. Top 10% earn free Crusader tickets.',
    rules: [
      'Simulation trading for beginners',
      'Full month duration',
      'Top 10% advance to Crusader Tournament'
    ],
    ticketSourceEventId: 'elevator-march-2025'
  },
  
  // Past Tournaments
  {
    id: 'raider-dec-2024',
    name: 'Raider Tournament - December 2024',
    type: 'Real Money',
    division: 'Raider',
    startDate: new Date('2024-12-09'),
    endDate: new Date('2024-12-13'),
    prizePool: '$50,000 + $250,000 Trading Account',
    entryFee: '$1,500',
    maxParticipants: 100,
    currentParticipants: 100,
    status: 'Completed',
    description: 'Professional 5-day real money trading tournament for experienced traders.',
    rules: [
      'Real money trading with live accounts',
      'Leverage: 1:20',
      'Maximum Loss: $10,000',
      'Maximum Daily Loss: $5,000'
    ]
  },
  {
    id: 'crusader-dec-2024',
    name: 'Crusader Tournament - December 2024',
    type: 'SIM',
    division: 'Crusader',
    startDate: new Date('2024-12-16'),
    endDate: new Date('2024-12-18'),
    prizePool: '$10,000 Cash Prizes + Trading Accounts',
    entryFee: '$65',
    maxParticipants: 200,
    currentParticipants: 195,
    status: 'Completed',
    description: '3-day simulation tournament with real cash prizes.',
    rules: [
      'Simulation trading environment',
      'Standard order types allowed',
      'Top 10 winners receive $1,000 Zimtra accounts'
    ]
  }
];

// Helper functions
export const getUpcomingTournaments = () => {
  const now = new Date();
  return tournaments
    .filter(t => t.endDate >= now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

export const getPastTournaments = () => {
  const now = new Date();
  return tournaments
    .filter(t => t.endDate < now)
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
};

export const getTournamentsByMonth = (year: number, month: number) => {
  return tournaments.filter(tournament => {
    const start = tournament.startDate;
    const end = tournament.endDate;
    const targetDate = new Date(year, month);
    const nextMonth = new Date(year, month + 1);
    
    return (start < nextMonth && end >= targetDate);
  });
};

export const getDivisionColor = (division: Tournament['division']) => {
  switch (division) {
    case 'Raider':
      return 'hsl(var(--destructive))';
    case 'Crusader':
      return 'hsl(var(--primary))';
    case 'Elevator':
      return 'hsl(var(--secondary))';
    default:
      return 'hsl(var(--muted))';
  }
};

export const getStatusColor = (status: Tournament['status']) => {
  switch (status) {
    case 'Live Now':
      return 'hsl(var(--destructive))';
    case 'Registration Open':
      return 'hsl(var(--primary))';
    case 'Upcoming':
      return 'hsl(var(--secondary))';
    case 'Sold Out':
      return 'hsl(var(--warning))';
    case 'Completed':
      return 'hsl(var(--muted))';
    default:
      return 'hsl(var(--muted))';
  }
};