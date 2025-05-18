
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { useEffect } from "react";
import Index from "./pages/Index";
import ViewerMode from "./pages/ViewerMode";
import NotFound from "./pages/NotFound";
import { createGoogleFontUrl } from "./config/fonts";

// Add Google Fonts to document head
const addGoogleFonts = () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = createGoogleFontUrl();
  document.head.appendChild(link);
};

// Executed once when app loads
addGoogleFonts();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/view" element={<ViewerMode />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
