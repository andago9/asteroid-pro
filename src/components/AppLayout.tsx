import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30 px-4">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs font-mono text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                Online
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto asteroid-grid">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
