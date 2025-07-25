import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Users, Eye, Share2, QrCode } from 'lucide-react';

const PlayerProfile: React.FC = React.memo(() => {
  const avatarUrls = [
    'https://images.unsplash.com/photo-1494790108755-2616b612b586?w=32&h=32&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=32&h=32&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=32&h=32&fit=crop&crop=face'
  ];

  return (
    <Card className="bg-metric-card border-border p-4 h-full w-full">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-profit/30">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
              alt="Profile avatar"
              className="w-full h-full object-cover rounded-full"
              loading="lazy"
            />
          </Avatar>
          <div>
            <h3 className="text-sm font-bold text-foreground">@igie</h3>
            <p className="text-xs text-muted-foreground">dayra.de/igie</p>
          </div>
        </div>
        
        {/* QR Code - Now properly sized and visible */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 p-2 bg-background rounded-lg border border-border shadow-sm">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white"/>
              
              {/* Corner squares */}
              <rect x="0" y="0" width="20" height="20" fill="black"/>
              <rect x="2" y="2" width="16" height="16" fill="white"/>
              <rect x="6" y="6" width="8" height="8" fill="black"/>
              
              <rect x="80" y="0" width="20" height="20" fill="black"/>
              <rect x="82" y="2" width="16" height="16" fill="white"/>
              <rect x="86" y="6" width="8" height="8" fill="black"/>
              
              <rect x="0" y="80" width="20" height="20" fill="black"/>
              <rect x="2" y="82" width="16" height="16" fill="white"/>
              <rect x="6" y="86" width="8" height="8" fill="black"/>
              
              {/* Data pattern */}
              <rect x="24" y="24" width="4" height="4" fill="black"/>
              <rect x="32" y="24" width="4" height="4" fill="black"/>
              <rect x="40" y="32" width="4" height="4" fill="black"/>
              <rect x="48" y="24" width="4" height="4" fill="black"/>
              <rect x="56" y="32" width="4" height="4" fill="black"/>
              <rect x="64" y="24" width="4" height="4" fill="black"/>
              <rect x="72" y="32" width="4" height="4" fill="black"/>
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <QrCode className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Scan</span>
          </div>
        </div>
      </div>
      
      {/* Community Section */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Community</span>
        </div>
        <div className="flex space-x-1">
          {avatarUrls.map((url, i) => (
            <Avatar key={`avatar-${i}`} className="w-6 h-6 border border-border/50 hover:border-profit transition-colors">
              <img 
                src={url} 
                alt={`Community member ${i + 1}`}
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
              />
            </Avatar>
          ))}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 bg-background/50 rounded-lg">
          <div className="text-sm font-bold text-profit">600</div>
          <div className="text-[10px] text-muted-foreground">Following</div>
        </div>
        <div className="text-center p-2 bg-background/50 rounded-lg">
          <div className="text-sm font-bold text-foreground">320</div>
          <div className="text-[10px] text-muted-foreground">Followers</div>
        </div>
        <div className="text-center p-2 bg-background/50 rounded-lg">
          <div className="text-sm font-bold text-foreground">1.2k</div>
          <div className="text-[10px] text-muted-foreground">Visits</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button className="flex-1 bg-profit text-background hover:bg-profit/90 h-8 text-xs font-medium">
          Follow
        </Button>
        <Button variant="outline" className="h-8 px-3 text-xs">
          <Share2 className="w-3 h-3 mr-1" />
          Share
        </Button>
      </div>
    </Card>
  );
});

PlayerProfile.displayName = 'PlayerProfile';

export default PlayerProfile;