import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import type { Participant } from '@/data/participants';

interface TraderCardProps {
  participant: Participant;
  onClick?: () => void;
  onFollowClick?: () => void;
  isAuthenticated?: boolean;
}

const TraderCard: React.FC<TraderCardProps> = ({ 
  participant, 
  onClick, 
  onFollowClick,
  isAuthenticated = false 
}) => {
  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onFollowClick?.();
  };

  return (
    <motion.div 
      className="bg-card border border-border rounded-lg p-3 h-[140px] flex flex-col cursor-pointer hover:border-primary/50 hover:shadow-md hover:shadow-primary/20 transition-all duration-200 relative"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
      layout
    >
      {/* Follow Button */}
      <div className="absolute top-2 right-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleFollowClick}
          className="h-6 w-6 p-0 hover:bg-primary/10"
          title={isAuthenticated ? "Follow trader" : "Register or log in to follow"}
        >
          <UserPlus className="w-3 h-3" />
        </Button>
      </div>

      {/* Top row: Rank and P&L */}
      <div className="flex justify-between items-center mb-3 pr-8">
        <span className="text-xs font-bold text-foreground">#{participant.rank}</span>
        <div className={`font-bold text-xs px-2 py-1 rounded ${
          participant.pnlValue >= 0 
            ? 'text-green-600 bg-green-600/10' 
            : 'text-red-600 bg-red-600/10'
        }`}>
          {participant.pnl}
        </div>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-3">
        <Avatar className="w-10 h-10 flex-shrink-0 border border-border/50">
          <img 
            src={participant.avatar} 
            alt={participant.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            style={{ display: 'none' }}
          >
            <span className="text-primary font-semibold text-xs">
              {participant.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </Avatar>
      </div>

      {/* Name and Handle */}
      <div className="text-center flex-1 flex flex-col justify-end">
        <h3 className="font-medium text-foreground text-xs leading-tight mb-1 truncate px-1">
          {participant.name}
        </h3>
        <p className="text-muted-foreground text-[10px] leading-tight truncate px-1">
          {participant.handle}
        </p>
      </div>
    </motion.div>
  );
};

export default TraderCard;