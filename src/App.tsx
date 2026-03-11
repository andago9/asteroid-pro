import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { NotificationProvider } from "@/lib/notifications-data";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import Tareas from "./pages/Tareas";
import Proyectos from "./pages/Proyectos";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Finanzas from "./pages/Finanzas";
import Ventas from "./pages/Ventas";
import Facturacion from "./pages/Facturacion";
import Monitor from "./pages/Monitor";
import Helpdesk from "./pages/Helpdesk";
import Reportes from "./pages/Reportes";
import Calendario from "./pages/Calendario";
import Notificaciones from "./pages/Notificaciones";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="dark min-h-screen w-full">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Index />} />
                  <Route path="/tareas" element={<Tareas />} />
                  <Route path="/proyectos" element={<Proyectos />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/finanzas" element={<Finanzas />} />
                  <Route path="/ventas" element={<Ventas />} />
                  <Route path="/facturacion" element={<Facturacion />} />
                  <Route path="/monitor" element={<Monitor />} />
                  <Route path="/helpdesk" element={<Helpdesk />} />
                  <Route path="/reportes" element={<Reportes />} />
                  <Route path="/calendario" element={<Calendario />} />
                  <Route path="/notificaciones" element={<Notificaciones />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
