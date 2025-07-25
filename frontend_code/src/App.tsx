import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Participants from './pages/Participants';
import EconomicCalendar from './pages/EconomicCalendar';
import CompareTraders from './pages/CompareTraders';
import TournamentCalendar from './pages/TournamentCalendar';
import AdminDashboard from './pages/AdminDashboard';
import Calendar from './pages/Calendar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/economic" element={<EconomicCalendar />} />
          <Route path="/compare" element={<CompareTraders />} />
          <Route path="/calendar" element={<TournamentCalendar />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/events" element={<Calendar />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;