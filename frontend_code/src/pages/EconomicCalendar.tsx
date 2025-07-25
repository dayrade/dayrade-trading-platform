import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Clock, TrendingUp, Search, ExternalLink, Info, BarChart3 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockEconomicEvents, EconomicEvent } from '@/data/economicEvents';

const EconomicCalendar: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');

  // Get unique countries for filter
  const countries = Array.from(new Set(mockEconomicEvents.map(event => event.country)));

  // Filter events
  const filteredEvents = mockEconomicEvents.filter(event => {
    const matchesSearch = event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || event.country === selectedCountry;
    const matchesImpact = selectedImpact === 'all' || event.impact === selectedImpact;
    const matchesDate = selectedDate === 'all' || event.date === selectedDate;
    
    return matchesSearch && matchesCountry && matchesImpact && matchesDate;
  });

  // Group events by date
  const eventsByDate = filteredEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, EconomicEvent[]>);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'low':
        return 'bg-muted/20 text-muted-foreground border-muted/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getCountryFlag = (countryCode: string) => {
    // Simple flag representation using Unicode regional indicator symbols
    const flags: Record<string, string> = {
      'US': '🇺🇸',
      'DE': '🇩🇪',
      'GB': '🇬🇧',
      'JP': '🇯🇵',
      'EU': '🇪🇺',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'CN': '🇨🇳'
    };
    return flags[countryCode] || '🏳️';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout
      sidebarExpanded={sidebarExpanded}
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={true}
    >
      <main className="flex flex-col h-full">
        <div className="sr-only">
          <h1>Economic Calendar and Market Events</h1>
          <p>Track important economic events and market indicators</p>
        </div>
        {/* Compact Header */}
        <div className="flex items-center justify-between flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border p-2">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Economic Calendar</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-48 h-7 bg-background/50 backdrop-blur-sm border-border/50 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedImpact} onValueChange={setSelectedImpact}>
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue placeholder="All Impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impact</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              <Filter className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">More</span>
            </Button>
          </div>
        </div>

        {/* Events Content */}
        <div className="flex-1 overflow-auto p-2 space-y-3">
          {Object.entries(eventsByDate).map(([date, events]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>{formatDate(date)}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {events.length} events
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pb-3">
                  <Accordion type="single" collapsible className="w-full">
                    {events.map((event) => (
                      <AccordionItem key={event.id} value={event.id} className="border border-border/50 rounded-lg mb-1">
                        <AccordionTrigger className="hover:no-underline px-2 py-1.5">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2 flex-1">
                              <div className="flex items-center space-x-1 min-w-0 w-12">
                                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs font-mono text-muted-foreground">
                                  {event.time}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1 min-w-0 w-16">
                                <span className="text-base">{getCountryFlag(event.countryCode)}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {event.currency}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-foreground truncate text-left">
                                  {event.event}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate text-left">
                                  {event.country}
                                </p>
                              </div>

                              <Badge className={`${getImpactColor(event.impact)} text-xs`} variant="outline">
                                {event.impact.toUpperCase()}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-2 text-xs ml-2">
                              <div className="text-center min-w-0 w-12">
                                <div className="text-muted-foreground text-xs">Prev</div>
                                <div className="font-mono text-xs">{event.previous}</div>
                              </div>
                              <div className="text-center min-w-0 w-12">
                                <div className="text-muted-foreground text-xs">Forecast</div>
                                <div className="font-mono text-xs">{event.forecast}</div>
                              </div>
                              <div className="text-center min-w-0 w-12">
                                <div className="text-muted-foreground text-xs">Actual</div>
                                <div className="font-mono text-xs">
                                  {event.actual || '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 pb-2">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                            {/* Event Description */}
                            <div className="space-y-2">
                              <div>
                                <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center">
                                  <Info className="w-4 h-4 mr-2" />
                                  Description
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {event.description}
                                </p>
                              </div>

                              <Separator className="my-1" />

                              <div>
                                <h4 className="font-semibold text-sm text-foreground mb-1">
                                  Methodology
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {event.methodology}
                                </p>
                              </div>

                              <Separator className="my-1" />

                              <div>
                                <h4 className="font-semibold text-sm text-foreground mb-1">
                                  Market Impact
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {event.marketImpact}
                                </p>
                              </div>

                              {/* Related Events */}
                              <div>
                                <h4 className="font-semibold text-sm text-foreground mb-1">
                                  Related Events
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {event.relatedEvents.map((relatedEvent, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {relatedEvent}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Next Release */}
                              {event.nextRelease && (
                                <div>
                                  <h4 className="font-semibold text-sm text-foreground mb-1">
                                    Next Release
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(event.nextRelease).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              )}

                              {/* Source Link */}
                              {event.sourceUrl && (
                                <div>
                                  <Button variant="outline" size="sm" className="mt-1 h-6 text-xs" asChild>
                                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Official Source
                                    </a>
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Historical Chart */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm text-foreground flex items-center">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Historical Trend
                              </h4>
                              <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={event.historicalData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis 
                                      dataKey="date" 
                                      tick={{ fontSize: 10 }}
                                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                                    />
                                    <YAxis 
                                      tick={{ fontSize: 10 }}
                                      tickFormatter={(value) => `${value}${event.currency === 'USD' && event.event.includes('Rate') ? '%' : ''}`}
                                    />
                                    <Tooltip 
                                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                      formatter={(value) => [
                                        `${value}${event.currency === 'USD' && event.event.includes('Rate') ? '%' : ''}`, 
                                        'Value'
                                      ]}
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="value" 
                                      stroke="hsl(var(--primary))" 
                                      strokeWidth={2}
                                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 1, r: 2 }}
                                      activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 1, fill: 'hsl(var(--background))' }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                              
                              {/* Current vs Previous vs Forecast comparison */}
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                <div className="text-center p-2 bg-muted/20 rounded-lg">
                                  <div className="text-xs text-muted-foreground mb-0.5">Previous</div>
                                  <div className="font-mono font-semibold text-xs">{event.previous}</div>
                                </div>
                                <div className="text-center p-2 bg-primary/10 rounded-lg">
                                  <div className="text-xs text-muted-foreground mb-0.5">Forecast</div>
                                  <div className="font-mono font-semibold text-xs text-primary">{event.forecast}</div>
                                </div>
                                <div className="text-center p-2 bg-muted/20 rounded-lg">
                                  <div className="text-xs text-muted-foreground mb-0.5">Actual</div>
                                  <div className="font-mono font-semibold text-xs">{event.actual || 'TBD'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-base font-semibold text-foreground mb-1">No events found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default EconomicCalendar;