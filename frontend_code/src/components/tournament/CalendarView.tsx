import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tournament, getDivisionColor } from '@/data/tournaments';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarViewProps {
  tournaments: Tournament[];
  onTournamentClick: (tournament: Tournament) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tournaments,
  onTournamentClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get tournaments for current month
  const monthTournaments = tournaments.filter(tournament => {
    const start = tournament.startDate;
    const end = tournament.endDate;
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    return (start <= monthEnd && end >= monthStart);
  });

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get tournaments for a specific day
  const getTournamentsForDay = (day: number) => {
    const targetDate = new Date(currentYear, currentMonth, day);
    return monthTournaments.filter(tournament => {
      return targetDate >= tournament.startDate && targetDate <= tournament.endDate;
    });
  };

  // Check if a tournament starts on a specific day
  const tournamentStartsOnDay = (tournament: Tournament, day: number) => {
    const targetDate = new Date(currentYear, currentMonth, day);
    return tournament.startDate.toDateString() === targetDate.toDateString();
  };

  // Calculate tournament span width in days for the current month view
  const getTournamentSpan = (tournament: Tournament, startDay: number) => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    const actualStart = new Date(Math.max(tournament.startDate.getTime(), monthStart.getTime()));
    const actualEnd = new Date(Math.min(tournament.endDate.getTime(), monthEnd.getTime()));
    
    const startDate = Math.max(startDay, actualStart.getDate());
    const endDate = actualEnd.getDate();
    
    return endDate - startDate + 1;
  };

  const today = new Date();
  const isToday = (day: number) => {
    const targetDate = new Date(currentYear, currentMonth, day);
    return targetDate.toDateString() === today.toDateString();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button variant="outline" size="sm" onClick={goToToday}>
              <Calendar size={16} className="mr-1" />
              Today
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* Weekday Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-28 p-2 bg-background relative flex flex-col ${
                day && isToday(day) ? 'bg-primary/5' : ''
              }`}
            >
              {day && (
                <>
                  {/* Day Number */}
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(day) ? 'text-primary font-bold' : 'text-foreground'
                  }`}>
                    {day}
                  </div>

                  {/* Tournament Bars */}
                  <div className="space-y-1">
                    {getTournamentsForDay(day)
                      .filter(tournament => tournamentStartsOnDay(tournament, day))
                      .slice(0, 3) // Limit to 3 tournaments per day for visibility
                      .map(tournament => {
                        const span = getTournamentSpan(tournament, day);
                        return (
                          <Tooltip key={tournament.id}>
                            <TooltipTrigger asChild>
                              <div
                                className="text-xs px-1 py-0.5 rounded cursor-pointer truncate hover:opacity-80 transition-opacity"
                                style={{
                                  backgroundColor: getDivisionColor(tournament.division),
                                  color: 'white',
                                  width: span > 1 ? `${span * 100}%` : '100%',
                                  position: span > 1 ? 'absolute' : 'relative',
                                  zIndex: 10
                                }}
                                onClick={() => onTournamentClick(tournament)}
                              >
                                {tournament.division}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-sm">
                              <div className="space-y-2">
                                <div className="font-medium">{tournament.name}</div>
                                <div className="text-sm">
                                  <div>Type: {tournament.type}</div>
                                  <div>
                                    Dates: {tournament.startDate.toLocaleDateString()} - {tournament.endDate.toLocaleDateString()}
                                  </div>
                                  <div>Prize: {tournament.prizePool}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {tournament.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    
                    {/* Show "..." if more than 3 tournaments */}
                    {getTournamentsForDay(day).length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{getTournamentsForDay(day).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: getDivisionColor('Raider') }}
            />
            <span>Raider (Real Money)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: getDivisionColor('Crusader') }}
            />
            <span>Crusader (SIM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: getDivisionColor('Elevator') }}
            />
            <span>Elevator (SIM)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;