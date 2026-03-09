import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Tareas from "./pages/Tareas";
import Proyectos from "./pages/Proyectos";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Finanzas from "./pages/Finanzas";
import Ventas from "./pages/Ventas";
import Monitor from "./pages/Monitor";
import Helpdesk from "./pages/Helpdesk";
import Reportes from "./pages/Reportes";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="dark">
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/tareas" element={<Tareas />} />
              <Route path="/proyectos" element={<Proyectos />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/finanzas" element={<Finanzas />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/monitor" element={<Monitor />} />
              <Route path="/helpdesk" element={<Helpdesk />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
