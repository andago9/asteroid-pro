import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";
import { format, parseISO, subHours, subDays, subMinutes } from "date-fns";
import { es } from "date-fns/locale";

export type NotificationModule = "tareas" | "helpdesk" | "ventas" | "facturacion" | "monitor" | "calendario" | "proyectos" | "sistema";
export type NotificationStatus = "unread" | "read";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  module: NotificationModule;
  status: NotificationStatus;
  createdAt: string; // ISO
  link?: string; // route to navigate
}

export interface NotificationPreferences {
  tareas: { system: boolean; email: boolean };
  helpdesk: { system: boolean; email: boolean };
  ventas: { system: boolean; email: boolean };
  facturacion: { system: boolean; email: boolean };
  monitor: { system: boolean; email: boolean };
  calendario: { system: boolean; email: boolean };
  proyectos: { system: boolean; email: boolean };
}

export const MODULE_LABELS: Record<NotificationModule, string> = {
  tareas: "Tareas",
  helpdesk: "Helpdesk",
  ventas: "Ventas",
  facturacion: "Facturación",
  monitor: "Monitor",
  calendario: "Calendario",
  proyectos: "Proyectos",
  sistema: "Sistema",
};

export const MODULE_COLORS: Record<NotificationModule, string> = {
  tareas: "bg-chart-4/20 text-chart-4",
  helpdesk: "bg-warning/20 text-warning",
  ventas: "bg-primary/20 text-primary",
  facturacion: "bg-secondary/20 text-secondary",
  monitor: "bg-destructive/20 text-destructive",
  calendario: "bg-info/20 text-info",
  proyectos: "bg-chart-3/20 text-chart-3",
  sistema: "bg-muted text-muted-foreground",
};

const now = new Date();

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1", title: "Nueva tarea asignada", message: "Se te asignó la tarea 'Deploy servidor staging'",
    module: "tareas", status: "unread", createdAt: subMinutes(now, 12).toISOString(), link: "/tareas",
  },
  {
    id: "n-2", title: "Ticket #1042 escalado", message: "El ticket de soporte ha sido escalado a prioridad alta",
    module: "helpdesk", status: "unread", createdAt: subMinutes(now, 35).toISOString(), link: "/helpdesk",
  },
  {
    id: "n-3", title: "Cotización aprobada", message: "La cotización COT-003 de Gamma Solutions fue aprobada",
    module: "ventas", status: "unread", createdAt: subHours(now, 1).toISOString(), link: "/ventas",
  },
  {
    id: "n-4", title: "Factura vencida", message: "La factura FAC-002 de Beta Industries está vencida",
    module: "facturacion", status: "unread", createdAt: subHours(now, 3).toISOString(), link: "/facturacion",
  },
  {
    id: "n-5", title: "Servidor caído", message: "El servidor DB-Primary no responde desde hace 15 minutos",
    module: "monitor", status: "unread", createdAt: subHours(now, 2).toISOString(), link: "/monitor",
  },
  {
    id: "n-6", title: "Reunión en 30 min", message: "Reunión con Acme Corp — Revisión de avance del proyecto",
    module: "calendario", status: "read", createdAt: subHours(now, 5).toISOString(), link: "/calendario",
  },
  {
    id: "n-7", title: "Proyecto actualizado", message: "El proyecto 'Portal Web' cambió a estado 'En progreso'",
    module: "proyectos", status: "read", createdAt: subDays(now, 1).toISOString(), link: "/proyectos",
  },
  {
    id: "n-8", title: "Ticket resuelto", message: "El ticket #1040 fue marcado como resuelto por Ana R.",
    module: "helpdesk", status: "read", createdAt: subDays(now, 1).toISOString(), link: "/helpdesk",
  },
  {
    id: "n-9", title: "Pago registrado", message: "Se registró un pago de $15,000 en la factura FAC-001",
    module: "facturacion", status: "read", createdAt: subDays(now, 2).toISOString(), link: "/facturacion",
  },
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
  tareas: { system: true, email: true },
  helpdesk: { system: true, email: true },
  ventas: { system: true, email: false },
  facturacion: { system: true, email: true },
  monitor: { system: true, email: true },
  calendario: { system: true, email: false },
  proyectos: { system: true, email: false },
};

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "status">) => void;
  updatePreferences: (prefs: NotificationPreferences) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

let _nId = 200;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const unreadCount = useMemo(() => notifications.filter(n => n.status === "unread").length, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "read" as const } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, status: "read" as const })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "createdAt" | "status">) => {
    setNotifications(prev => [{ ...n, id: `n-${++_nId}`, createdAt: new Date().toISOString(), status: "unread" }, ...prev]);
  }, []);

  const updatePreferences = useCallback((prefs: NotificationPreferences) => setPreferences(prefs), []);

  const value = useMemo(() => ({
    notifications, unreadCount, preferences, markAsRead, markAllAsRead, deleteNotification, addNotification, updatePreferences,
  }), [notifications, unreadCount, preferences, markAsRead, markAllAsRead, deleteNotification, addNotification, updatePreferences]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}

export function formatNotificationTime(iso: string) {
  try {
    const d = parseISO(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    return format(d, "dd MMM", { locale: es });
  } catch { return ""; }
}
