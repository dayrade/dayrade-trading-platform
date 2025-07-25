import React, { useState } from 'react';
import { memo, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatPanelProps {
  isExpanded: boolean;
  onSendMessage?: (message: string) => void;
  onRegisterClick?: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = memo(({ 
  isExpanded, 
  onSendMessage,
  onRegisterClick 
}) => {
  const initialMessages = useMemo(() => [
    { user: "Roland", message: "Who was that philosopher you shared with me recently?", time: "2:14 PM", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
    { user: "Sarah", message: "I think you mean Marcus Aurelius? His Meditations are incredible.", time: "2:15 PM", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612c4b0?w=32&h=32&fit=crop&crop=face" },
    { user: "Roland", message: "That's him!", time: "2:16 PM", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
    { user: "Mike", message: "Just saw the latest P&L numbers. Looking great this quarter!", time: "2:17 PM", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
    { user: "User", message: "What was his vision statement?", time: "2:18 PM", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" },
    { user: "Emma", message: "The trading activity today has been intense. Anyone else seeing unusual patterns?", time: "2:19 PM", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" },
    { user: "Alex", message: "Yeah, lots of volatility in tech stocks", time: "2:20 PM", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=32&h=32&fit=crop&crop=face" },
    { user: "Roland", message: "Check this https://dribbble.com", time: "2:21 PM", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
    { user: "Sarah", message: "Great resource! Thanks for sharing.", time: "2:22 PM", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612c4b0?w=32&h=32&fit=crop&crop=face" },
    { user: "Mike", message: "The USD balance looks solid. Good diversification strategy.", time: "2:23 PM", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
    { user: "Emma", message: "Agreed. The unrealized P&L is particularly strong today.", time: "2:24 PM", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" },
    { user: "Alex", message: "Should we consider taking some profits before market close?", time: "2:25 PM", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=32&h=32&fit=crop&crop=face" }
  ], []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate WebSocket connection
  useEffect(() => {
    const connectToChat = () => {
      setIsConnected(true);
      console.log('Connected to chat WebSocket');
    };
    
    const timeout = setTimeout(connectToChat, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (messageInput.trim()) {
      const newMessage = {
        user: "You",
        message: messageInput.trim(),
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      setMessages(prev => [...prev, newMessage]);
      onSendMessage?.(messageInput.trim());
      setMessageInput('');
    }
  }, [messageInput, onSendMessage]);

  const handleRegister = useCallback(() => {
    onRegisterClick?.();
    setIsLoggedIn(true);
  }, [onRegisterClick]);

  // Simulate real-time message updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected && Math.random() > 0.8) { // 20% chance every 8 seconds
        const randomUsers = ['Emma', 'Alex', 'Mike', 'Sarah', 'Roland'];
        const randomMessages = [
          'Great trade on AAPL!',
          'Market volatility is intense today',
          'Anyone else seeing this volume spike?',
          'Nice P&L movement in the last hour',
          'This tournament is getting exciting!',
          'Volume is picking up significantly',
          'Strong momentum in tech sector',
          'Seeing some weakness in these rallies'
        ];
        
        const newMessage = {
          user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
          message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=32&h=32&fit=crop&crop=face`,
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
        
        setMessages(prev => [...prev.slice(-20), newMessage]); // Keep last 20 messages
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <motion.div
      className="border border-border bg-metric-card rounded-lg overflow-hidden flex flex-col z-10 h-full"
      animate={{ 
        width: isExpanded ? '0px' : '320px',
        opacity: isExpanded ? 0 : 1
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ 
        minWidth: isExpanded ? '0px' : '320px',
        display: isExpanded ? 'none' : 'flex'
      }}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Chat</span>
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
        {messages.map((chat, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6 border border-border/50">
                <img 
                  src={chat.avatar} 
                  alt={`${chat.user} avatar`}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-full h-full bg-gradient-to-br from-profit/40 to-profit/20 rounded-full flex items-center justify-center"
                  style={{ display: 'none' }}
                >
                  <span className="text-profit font-semibold text-xs">
                    {chat.user.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </Avatar>
              <span className="text-sm font-medium">{chat.user}</span>
              <span className="text-xs text-muted-foreground">{chat.time}</span>
            </div>
            <p className="text-sm ml-8">{chat.message}</p>
          </div>
        ))}
      </div>

      {/* Bottom section - either register button or chat input */}
      <div className="p-4 border-t border-border">
        {!isLoggedIn ? (
          <Button 
            className="w-full bg-profit text-background hover:bg-profit/90"
            onClick={handleRegister}
          >
            Register to chat
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              className="bg-profit text-background hover:bg-profit/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatPanel.displayName = 'ChatPanel';

export default ChatPanel;