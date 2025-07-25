import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { tradingCalendarService, TradingEvent } from '@/services/tradingCalendarService';

interface CalendarProps {
  sidebarExpanded: boolean;
  onSidebarExpandedChange: (expanded: boolean) => void;
  isAuthenticated?: boolean;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  onAuthModalOpen?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  sidebarExpanded,
  onSidebarExpandedChange,
  isAuthenticated = false,
  onThemeToggle,
  isDarkMode = false,
  onAuthModalOpen
}) => {
  const [todaysEvents, setTodaysEvents] = useState<TradingEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<TradingEvent[]>([]);
  const [highImportanceEvents, setHighImportanceEvents] = useState<TradingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [todaysData, upcomingData, highImportanceData] = await Promise.all([
          tradingCalendarService.getTodaysEvents(),
          tradingCalendarService.getUpcomingEvents(),
          tradingCalendarService.getHighImportanceEvents()
        ]);

        setTodaysEvents(todaysData);
        setUpcomingEvents(upcomingData);
        setHighImportanceEvents(highImportanceData);
      } catch (err) {
        setError('Failed to load trading calendar data');
        console.error('Calendar data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  const getImportanceColor = (importance: number) => {
    if (importance >= 2) return 'bg-red-500/10 text-red-600 border-red-500/20';
    if (importance >= 1) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  const getImportanceLabel = (importance: number) => {
    if (importance >= 2) return 'High';
    if (importance >= 1) return 'Medium';
    return 'Low';
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const EventCard: React.FC<{ event: TradingEvent; showDate?: boolean }> = ({ event, showDate = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm mb-1">{event.title}</h3>
          <p className="text-xs text-muted-foreground mb-2">{event.indicator}</p>
          {event.comment && (
            <p className="text-xs text-muted-foreground/80 line-clamp-2">{event.comment}</p>
          )}
        </div>
        <Badge className={`ml-2 ${getImportanceColor(event.importance)}`}>
          {getImportanceLabel(event.importance)}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{showDate ? formatEventDate(event.date) : formatEventTime(event.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-muted-foreground">Source:</span>
            <span className="font-medium">{event.source}</span>
          </div>
        </div>
        {event.source_url && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
            <a href={event.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        )}
      </div>

      {(event.actual !== null || event.forecast !== null || event.previous !== null) && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {event.previous !== null && (
              <div>
                <span className="text-muted-foreground block">Previous</span>
                <span className="font-medium">{event.previous}{event.unit}</span>
              </div>
            )}
            {event.forecast !== null && (
              <div>
                <span className="text-muted-foreground block">Forecast</span>
                <span className="font-medium">{event.forecast}{event.unit}</span>
              </div>
            )}
            {event.actual !== null && (
              <div>
                <span className="text-muted-foreground block">Actual</span>
                <span className={`font-medium ${
                  event.forecast !== null 
                    ? event.actual > event.forecast 
                      ? 'text-green-600' 
                      : event.actual < event.forecast 
                        ? 'text-red-600' 
                        : 'text-foreground'
                    : 'text-foreground'
                }`}>
                  {event.actual}{event.unit}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <DashboardLayout
        sidebarExpanded={sidebarExpanded}
        onSidebarExpandedChange={onSidebarExpandedChange}
        isAuthenticated={isAuthenticated}
        onThemeToggle={onThemeToggle}
        isDarkMode={isDarkMode}
        onAuthModalOpen={onAuthModalOpen}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading US Equities Calendar...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        sidebarExpanded={sidebarExpanded}
        onSidebarToggle={() => setSidebarExpanded(!sidebarExpanded)}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Error loading calendar data</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarExpanded={sidebarExpanded}
      onSidebarToggle={() => setSidebarExpanded(!sidebarExpanded)}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">US Equities Trading Calendar</h1>
            <p className="text-muted-foreground">Economic events and market-moving data for US stock markets</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{todaysEvents.length}</div>
              <p className="text-xs text-muted-foreground">US market events today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">Events this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{highImportanceEvents.length}</div>
              <p className="text-xs text-muted-foreground">Market-moving events</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today's Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="high-impact">High Impact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-4">
            {todaysEvents.length > 0 ? (
              <div className="grid gap-4">
                {todaysEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No US market events scheduled for today</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.length > 0 ? (
              <div className="grid gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} showDate />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No upcoming US market events in the next 7 days</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="high-impact" className="space-y-4">
            {highImportanceEvents.length > 0 ? (
              <div className="grid gap-4">
                {highImportanceEvents.map((event) => (
                  <EventCard key={event.id} event={event} showDate />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No high-impact US market events currently scheduled</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;