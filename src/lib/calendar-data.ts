import { format, addDays, addHours, startOfWeek, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export type EventType = "reunión" | "tarea" | "soporte" | "recordatorio" | "general";
export type EventPriority = "alta" | "media" | "baja";
export type CalendarView = "day" | "week" | "month";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string; // ISO
  end: string;   // ISO
  type: EventType;
  priority: EventPriority;
  responsible: string;
  clientId?: string;
  clientName?: string;
  projectName?: string;
  ticketId?: string;
  taskName?: string;
  reminder?: string;
}

export const EVENT_TYPES: EventType[] = ["reunión", "tarea", "soporte", "recordatorio", "general"];
export const EVENT_PRIORITIES: EventPriority[] = ["alta", "media", "baja"];
export const RESPONSIBLES = ["Carlos M.", "Ana R.", "Pedro S.", "Laura G.", "Miguel T."];

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  "reunión": "bg-primary/80 border-primary text-primary-foreground",
  "tarea": "bg-chart-4/80 border-chart-4 text-success-foreground",
  "soporte": "bg-warning/80 border-warning text-warning-foreground",
  "recordatorio": "bg-chart-3/60 border-chart-3 text-foreground",
  "general": "bg-accent border-accent-foreground/20 text-accent-foreground",
};

export const EVENT_TYPE_DOTS: Record<EventType, string> = {
  "reunión": "bg-primary",
  "tarea": "bg-chart-4",
  "soporte": "bg-warning",
  "recordatorio": "bg-chart-3",
  "general": "bg-muted-foreground",
};

export const PRIORITY_STYLES: Record<EventPriority, string> = {
  alta: "text-destructive",
  media: "text-warning",
  baja: "text-muted-foreground",
};

const now = new Date();
const today = format(now, "yyyy-MM-dd");

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "ev-1", title: "Reunión con Acme Corp", description: "Revisión de avance del proyecto",
    start: `${today}T09:00:00`, end: `${today}T10:00:00`, type: "reunión", priority: "alta",
    responsible: "Carlos M.", clientName: "Acme Corp", projectName: "Portal Web",
  },
  {
    id: "ev-2", title: "Deploy servidor staging", description: "Subir nueva versión",
    start: `${today}T14:00:00`, end: `${today}T15:00:00`, type: "tarea", priority: "media",
    responsible: "Pedro S.", projectName: "Portal Web",
  },
  {
    id: "ev-3", title: "Soporte: Ticket #1042", description: "Error en módulo de pagos",
    start: `${today}T11:00:00`, end: `${today}T12:00:00`, type: "soporte", priority: "alta",
    responsible: "Ana R.", ticketId: "TK-1042", clientName: "Beta Industries",
  },
  {
    id: "ev-4", title: "Renovación licencia AWS", description: "Verificar contrato",
    start: format(addDays(now, 1), "yyyy-MM-dd") + "T10:00:00",
    end: format(addDays(now, 1), "yyyy-MM-dd") + "T10:30:00",
    type: "recordatorio", priority: "media", responsible: "Miguel T.",
  },
  {
    id: "ev-5", title: "Demo cliente Gamma", description: "Presentación de prototipo",
    start: format(addDays(now, 2), "yyyy-MM-dd") + "T16:00:00",
    end: format(addDays(now, 2), "yyyy-MM-dd") + "T17:30:00",
    type: "reunión", priority: "alta", responsible: "Laura G.", clientName: "Gamma Solutions",
  },
  {
    id: "ev-6", title: "Planning semanal", description: "Sprint planning del equipo",
    start: format(addDays(now, -1), "yyyy-MM-dd") + "T09:00:00",
    end: format(addDays(now, -1), "yyyy-MM-dd") + "T10:00:00",
    type: "general", priority: "baja", responsible: "Carlos M.",
  },
  {
    id: "ev-7", title: "Revisión tickets pendientes", description: "Triage de tickets nuevos",
    start: format(addDays(now, 3), "yyyy-MM-dd") + "T08:00:00",
    end: format(addDays(now, 3), "yyyy-MM-dd") + "T09:00:00",
    type: "soporte", priority: "media", responsible: "Ana R.",
  },
  {
    id: "ev-8", title: "Entrega de reporte mensual", description: "Enviar reporte a dirección",
    start: format(addDays(now, 4), "yyyy-MM-dd") + "T12:00:00",
    end: format(addDays(now, 4), "yyyy-MM-dd") + "T13:00:00",
    type: "tarea", priority: "alta", responsible: "Laura G.", projectName: "Reportes internos",
  },
];

export function emptyEvent(): Omit<CalendarEvent, "id"> {
  const s = new Date();
  s.setMinutes(0, 0, 0);
  s.setHours(s.getHours() + 1);
  const e = addHours(s, 1);
  return {
    title: "", description: "",
    start: s.toISOString().slice(0, 16), end: e.toISOString().slice(0, 16),
    type: "general", priority: "media", responsible: RESPONSIBLES[0],
  };
}

let _evId = 100;
export const nextEventId = () => `ev-${++_evId}`;

export function formatEventTime(iso: string) {
  try { return format(parseISO(iso), "HH:mm"); } catch { return ""; }
}

export function formatEventDate(iso: string) {
  try { return format(parseISO(iso), "dd MMM yyyy", { locale: es }); } catch { return ""; }
}

export function getMonthDays(date: Date) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end: addDays(start, 6) });
}

export function getEventsForDay(events: CalendarEvent[], day: Date) {
  return events.filter(ev => isSameDay(parseISO(ev.start), day));
}

export function getHourSlots() {
  return Array.from({ length: 24 }, (_, i) => i);
}
