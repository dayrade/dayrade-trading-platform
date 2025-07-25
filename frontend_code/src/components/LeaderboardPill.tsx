import React from 'react';
import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';

interface Trader {
  id: string;
  name: string;
  pnl: string;
  avatar: string;
}

interface LeaderboardPillProps {
  trader: Trader;
  isActive: boolean;
  onClick: () => void;
}

const LeaderboardPill: React.FC<LeaderboardPillProps> = memo(({ trader, isActive, onClick }) => {
  const pnlColor = useMemo(() => {
    return trader.pnl.startsWith('+') ? 'text-profit' : 'text-loss';
  }, [trader.pnl]);

  const animationProps = useMemo(() => ({
    width: isActive ? '254px' : '56px',
    height: '56px',
    borderRadius: isActive ? '28px' : '50%',
    boxShadow: isActive ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
    border: '1px solid hsl(var(--profit) / 0.3)',
  }), [isActive]);

  const styleProps = useMemo(() => ({
    backgroundColor: isActive ? 'hsl(145 100% 55% / 0.1)' : 'transparent',
    minWidth: '56px',
    paddingRight: isActive ? '16px' : '0px',
    paddingLeft: '0px',
  }), [isActive]);

  const getPnlColor = (pnl: string) => {
    return pnl.startsWith('+') ? 'text-profit' : 'text-loss';
  };

  return (
    <motion.div
      layout
      className={`relative flex items-center cursor-pointer ${
        isActive ? 'z-10' : 'z-0'
      }`}
      onClick={onClick}
      initial={false}
      animate={{
        ...animationProps,
      }}
      style={{
        ...styleProps,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.4
      }}
    >
      <div className="flex items-center justify-center w-14 h-14">
        <Avatar className="w-12 h-12 flex-shrink-0 overflow-hidden border border-profit/30">
          <img 
            src={trader.avatar} 
            alt={trader.name}
            className="w-12 h-12 object-cover rounded-full"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className="w-12 h-12 bg-gradient-to-br from-profit/20 to-profit/5 rounded-full flex items-center justify-center"
            style={{ display: 'none' }}
          >
            <span className="text-profit font-semibold text-sm">
              {trader.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </Avatar>
      </div>
      
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            className="ml-3 flex flex-col justify-center whitespace-nowrap"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="font-bold text-foreground text-sm leading-tight mb-1">
              {trader.name}
            </div>
            <div className={`font-medium text-sm leading-tight ${pnlColor}`}>
              {trader.pnl}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

LeaderboardPill.displayName = 'LeaderboardPill';

export default LeaderboardPill;