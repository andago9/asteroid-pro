import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  DollarSign,
  Activity,
  Headphones,
  BarChart3,
  CalendarDays,
  Settings,
  Rocket,
  Trophy,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-pami.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tareas", url: "/tareas", icon: CheckSquare },
  { title: "Proyectos", url: "/proyectos", icon: FolderKanban },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Productos", url: "/productos", icon: Package },
  { title: "Ventas", url: "/ventas", icon: ShoppingCart },
];

const operationsItems = [
  { title: "Facturación", url: "/facturacion", icon: Receipt },
  { title: "Finanzas", url: "/finanzas", icon: DollarSign },
  { title: "Monitor", url: "/monitor", icon: Activity },
  { title: "Helpdesk", url: "/helpdesk", icon: Headphones },
  { title: "Reportes", url: "/reportes", icon: BarChart3 },
  { title: "Calendario", url: "/calendario", icon: CalendarDays },
];

const systemItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, user } = useAuth();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const renderItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink
              to={item.url}
              end={item.url === "/"}
              className="transition-all duration-200"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="PAMI" className="h-8 w-8 shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-accent-foreground tracking-wider">
                PAMI
              </span>
              <span className="text-[10px] font-mono text-sidebar-foreground/50 tracking-widest uppercase">
                Asteroid
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(operationsItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(systemItems)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="glass-card rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-secondary" />
              <span className="text-xs font-semibold text-sidebar-accent-foreground">Nivel 7</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-sidebar-accent overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-secondary transition-all" />
            </div>
            <p className="text-[10px] text-sidebar-foreground/50 mt-1.5 font-mono">
              <Rocket className="inline h-3 w-3 mr-1" />
              2,450 XP — Próximo: 3,000
            </p>
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors mt-2"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        {!collapsed && user && (
          <p className="text-[10px] text-sidebar-foreground/40 font-mono truncate mt-1 px-3">
            {user.email}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
