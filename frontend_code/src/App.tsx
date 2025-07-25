import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => {
  console.log('APP IS RENDERING');
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
