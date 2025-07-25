import React from 'react';
import { memo, useMemo } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { Commentator } from '@/constants/commentators';
interface CommentaryBarProps {
  currentSpeaker: string;
  commentText: string;
  commentators: Commentator[];
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  isAuthenticated?: boolean;
}
const CommentaryBar: React.FC<CommentaryBarProps> = memo(({
  currentSpeaker,
  commentText,
  commentators,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  isAuthenticated = false
}) => {
  const currentSpeakerName = useMemo(() => {
    const speaker = commentators.find(c => c.id === currentSpeaker);
    return speaker?.name || 'Unknown';
  }, [commentators, currentSpeaker]);
  return <div className="h-12 bg-metric-card border border-border rounded-lg flex items-center px-[16px] mx-[8px]">
      <div className="flex items-center space-x-3 w-full">
        {/* Commentator Avatars */}
        <div className="flex items-center space-x-1">
          {commentators.map(commentator => {
          const isCurrentSpeaker = commentator.id === currentSpeaker;
          return <Avatar key={commentator.id} className={`w-8 h-8 border-2 transition-all duration-300 ${isCurrentSpeaker ? 'border-profit shadow-lg shadow-profit/50 scale-110' : 'border-border opacity-60'}`}>
                <img src={commentator.avatarUrl} alt={commentator.name} className="w-full h-full object-cover rounded-full" />
              </Avatar>;
        })}
        </div>

        {/* Commentary Content */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span className="font-bold text-foreground whitespace-nowrap">
            {currentSpeakerName}:
          </span>
          <span className="text-foreground truncate">
            {commentText}
          </span>
        </div>

        {/* Volume Controls - Only show if authenticated */}
        {isAuthenticated && (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onMuteToggle} className="p-2 hover:bg-accent">
              {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-foreground" />}
            </Button>
            
            <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={e => onVolumeChange(parseInt(e.target.value))} className="w-16 h-1 bg-border rounded-lg appearance-none slider" disabled={isMuted} />
          </div>
        )}
      </div>
    </div>;
});

CommentaryBar.displayName = 'CommentaryBar';
export default CommentaryBar;