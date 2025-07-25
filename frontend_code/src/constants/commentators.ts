export interface Commentator {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface CommentaryMessage {
  speaker: string;
  text: string;
}

export const COMMENTATORS: Commentator[] = [
  { id: 'bear', name: 'Bear', avatarUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901' },
  { id: 'bull', name: 'Bull', avatarUrl: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1' },
  { id: 'analyst', name: 'Analyst', avatarUrl: 'https://images.unsplash.com/photo-1501286353178-1ec881214838' },
  { id: 'trader', name: 'Trader', avatarUrl: 'https://images.unsplash.com/photo-1441057206919-63d19fac2369' }
];

export const COMMENTARY_MESSAGES: CommentaryMessage[] = [
  { speaker: 'bear', text: 'I see weakness in these rallies, prepare for a pullback.' },
  { speaker: 'bull', text: 'The momentum is strong here, expecting higher prices ahead!' },
  { speaker: 'analyst', text: 'Technical indicators suggest a breakout is imminent.' },
  { speaker: 'trader', text: 'Volume is picking up, this could be the move we have been waiting for.' },
  { speaker: 'bear', text: 'Resistance levels are holding firm, sellers are stepping in.' },
  { speaker: 'bull', text: 'Market sentiment is shifting positive, buy the dip!' },
  { speaker: 'analyst', text: 'RSI divergence spotted, watch for potential reversal.' },
  { speaker: 'trader', text: 'Stop losses are being triggered, volatility increasing.' }
];