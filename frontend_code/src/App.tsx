import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Participants from "./pages/Participants";
import EconomicCalendar from "./pages/EconomicCalendar";
import CompareTraders from "./pages/CompareTraders";
import TournamentCalendar from "./pages/TournamentCalendar";
import Settings from "./pages/Settings";
import Winners from "./pages/Winners";
import FAQ from "./pages/FAQ";
import AdminDashboard from "./pages/AdminDashboard";
import Calendar from "./pages/Calendar";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/participants" element={<Participants />} />
                <Route path="/economic" element={<EconomicCalendar />} />
                <Route path="/compare" element={<CompareTraders />} />
                <Route path="/calendar" element={<TournamentCalendar />} />
                <Route path="/winners" element={<Winners />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;