import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseProvider } from "@/lib/providers/supabase-provider";
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
import SetPassword from './pages/SetPassword';
import VerifyEmail from './pages/VerifyEmail';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
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
                <Route path="/auth/set-password" element={<SetPassword />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}

export default App;