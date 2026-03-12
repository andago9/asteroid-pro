import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

const STATUS_CONFIG = {
  disponible: { label: "Disponible", color: "bg-success", pulse: true },
  ocupado: { label: "Ocupado", color: "bg-warning", pulse: false },
  ausente: { label: "Ausente", color: "bg-muted-foreground", pulse: false },
} as const;

export function AppLayout() {
  const { profile, updateProfile } = useProfile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const currentStatus = profile?.status ?? "disponible";
  const statusInfo = STATUS_CONFIG[currentStatus];
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  const handleStatusChange = (newStatus: "disponible" | "ocupado" | "ausente") => {
    updateProfile.mutate({ status: newStatus });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-svh">
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30 px-4">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs font-mono text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none">
                    <span className={`h-2 w-2 rounded-full ${statusInfo.color} ${statusInfo.pulse ? "animate-pulse-glow" : ""}`} />
                    <span className="hidden sm:inline max-w-[120px] truncate text-foreground/80 font-medium">{displayName}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>{statusInfo.label}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((key) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => handleStatusChange(key)}
                      className="gap-2 cursor-pointer"
                    >
                      <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[key].color}`} />
                      {STATUS_CONFIG[key].label}
                      {currentStatus === key && <span className="ml-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/perfil")} className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Mi perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-background">
            <Outlet />
          </main>
        </div>
    </SidebarProvider>
  );
}
