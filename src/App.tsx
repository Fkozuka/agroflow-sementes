
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Producao from "./pages/Producao";
import Armazenamento from "./pages/Armazenamento";
import Energia from "./pages/Energia";
import EnergiaHistorico from "./pages/EnergiaHistorico";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { AuthProvider } from "./hooks/use-auth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Producao />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/producao" 
              element={
                <ProtectedRoute>
                  <Producao />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/armazenamento" 
              element={
                <ProtectedRoute>
                  <Armazenamento />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/energia" 
              element={
                <ProtectedRoute>
                  <Energia />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/energia-historico"
              element={
                <ProtectedRoute>
                  <EnergiaHistorico />
                </ProtectedRoute>
              }
            />
            <Route
              path="/energia-historico/:maquinaId"
              element={
                <ProtectedRoute>
                  <EnergiaHistorico />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
