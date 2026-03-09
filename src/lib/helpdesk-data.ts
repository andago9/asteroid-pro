import { format } from "date-fns";
import { es } from "date-fns/locale";

// ── Types ──────────────────────────────────────────────
export type TicketStatus = "Abierto" | "En proceso" | "Pendiente" | "Resuelto" | "Cerrado";
export type TicketPriority = "Baja" | "Media" | "Alta" | "Crítica";
export type TicketType = "Incidente" | "Soporte" | "Consulta" | "Mejora";

export interface TicketMessage {
  id: string;
  author: string;
  role: "agent" | "user";
  date: string;
  message: string;
}

export interface TicketActivity {
  id: string;
  date: string;
  user: string;
  action: string;
}

export interface Ticket {
  id: string;
  ticketId: string; // HD-001
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  client: string;
  requester: string;
  agent: string;
  department: string;
  messages: TicketMessage[];
  activity: TicketActivity[];
  createdAt: string;
  updatedAt: string;
}

// ── Constants ──────────────────────────────────────────
export const TICKET_STATUSES: TicketStatus[] = ["Abierto", "En proceso", "Pendiente", "Resuelto", "Cerrado"];
export const TICKET_PRIORITIES: TicketPriority[] = ["Baja", "Media", "Alta", "Crítica"];
export const TICKET_TYPES: TicketType[] = ["Incidente", "Soporte", "Consulta", "Mejora"];

export const AGENTS = ["Carlos M.", "Ana R.", "María P.", "Jorge L.", "Sin asignar"];
export const DEPARTMENTS = ["Desarrollo", "Infraestructura", "Soporte", "Comercial"];

export const STATUS_STYLES: Record<TicketStatus, string> = {
  Abierto: "bg-destructive/10 text-destructive",
  "En proceso": "bg-warning/10 text-warning",
  Pendiente: "bg-info/10 text-info",
  Resuelto: "bg-success/10 text-success",
  Cerrado: "bg-muted text-muted-foreground",
};

export const PRIORITY_STYLES: Record<TicketPriority, string> = {
  Crítica: "bg-destructive/10 text-destructive",
  Alta: "bg-warning/10 text-warning",
  Media: "bg-info/10 text-info",
  Baja: "bg-muted text-muted-foreground",
};

// ── Empty ticket factory ───────────────────────────────
export function emptyTicket(): Omit<Ticket, "id" | "ticketId" | "messages" | "activity" | "createdAt" | "updatedAt"> {
  return {
    title: "",
    description: "",
    type: "Soporte",
    priority: "Media",
    status: "Abierto",
    client: "",
    requester: "",
    agent: "Sin asignar",
    department: "Soporte",
  };
}

// ── Mock data ──────────────────────────────────────────
let ticketCounter = 6;
export function nextTicketId() {
  return `HD-${String(ticketCounter++).padStart(3, "0")}`;
}

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "t1", ticketId: "HD-001",
    title: "Error en módulo de pagos",
    description: "Al intentar procesar un pago con tarjeta de crédito, el sistema muestra un error 500 y no completa la transacción. El problema ocurre desde las 10:00 AM de hoy.",
    type: "Incidente", priority: "Alta", status: "Abierto",
    client: "TechCorp Solutions", requester: "Laura Méndez",
    agent: "Carlos M.", department: "Desarrollo",
    messages: [
      { id: "msg1", author: "Laura Méndez", role: "user", date: "2025-03-05T10:30:00", message: "Buenos días, estamos teniendo problemas con el módulo de pagos. Los clientes no pueden completar compras." },
      { id: "msg2", author: "Carlos M.", role: "agent", date: "2025-03-05T10:45:00", message: "Hola Laura, ya estamos revisando el problema. ¿Podrías indicarme con qué tipo de tarjeta ocurre el error?" },
      { id: "msg3", author: "Laura Méndez", role: "user", date: "2025-03-05T11:00:00", message: "Ocurre con Visa y Mastercard. Con PayPal funciona correctamente." },
    ],
    activity: [
      { id: "a1", date: "2025-03-05T10:30:00", user: "Sistema", action: "Ticket creado" },
      { id: "a2", date: "2025-03-05T10:35:00", user: "Sistema", action: "Ticket asignado a Carlos M." },
      { id: "a3", date: "2025-03-05T10:45:00", user: "Carlos M.", action: "Respuesta agregada" },
    ],
    createdAt: "2025-03-05T10:30:00", updatedAt: "2025-03-05T11:00:00",
  },
  {
    id: "t2", ticketId: "HD-002",
    title: "Solicitud de nueva funcionalidad de reportes",
    description: "El cliente solicita agregar un nuevo reporte de ventas por región con filtros avanzados y exportación a Excel.",
    type: "Mejora", priority: "Media", status: "En proceso",
    client: "GreenEnergy MX", requester: "Roberto Salinas",
    agent: "Ana R.", department: "Desarrollo",
    messages: [
      { id: "msg4", author: "Roberto Salinas", role: "user", date: "2025-03-04T14:00:00", message: "Necesitamos un reporte que muestre ventas por zona geográfica. ¿Es posible incluirlo en el próximo sprint?" },
      { id: "msg5", author: "Ana R.", role: "agent", date: "2025-03-04T15:30:00", message: "Hola Roberto, sí es viable. Lo estamos incluyendo en el backlog del próximo sprint. Te enviaré un mockup esta semana." },
    ],
    activity: [
      { id: "a4", date: "2025-03-04T14:00:00", user: "Sistema", action: "Ticket creado" },
      { id: "a5", date: "2025-03-04T14:10:00", user: "Sistema", action: "Ticket asignado a Ana R." },
      { id: "a6", date: "2025-03-04T15:30:00", user: "Ana R.", action: "Estado cambiado a En proceso" },
    ],
    createdAt: "2025-03-04T14:00:00", updatedAt: "2025-03-04T15:30:00",
  },
  {
    id: "t3", ticketId: "HD-003",
    title: "Problema de rendimiento en dashboard",
    description: "El dashboard principal tarda más de 15 segundos en cargar. Los gráficos se congelan al aplicar filtros de fecha.",
    type: "Incidente", priority: "Crítica", status: "En proceso",
    client: "Digital Minds", requester: "Sofía Castro",
    agent: "Carlos M.", department: "Desarrollo",
    messages: [
      { id: "msg6", author: "Sofía Castro", role: "user", date: "2025-03-04T09:00:00", message: "El dashboard está extremadamente lento desde ayer. Adjunto captura del tiempo de carga." },
      { id: "msg7", author: "Carlos M.", role: "agent", date: "2025-03-04T09:30:00", message: "Estamos investigando. Parece un problema con las queries de agregación. Actualizaré en las próximas horas." },
    ],
    activity: [
      { id: "a7", date: "2025-03-04T09:00:00", user: "Sistema", action: "Ticket creado" },
      { id: "a8", date: "2025-03-04T09:15:00", user: "Sistema", action: "Ticket asignado a Carlos M." },
      { id: "a9", date: "2025-03-04T09:30:00", user: "Carlos M.", action: "Estado cambiado a En proceso" },
    ],
    createdAt: "2025-03-04T09:00:00", updatedAt: "2025-03-04T09:30:00",
  },
  {
    id: "t4", ticketId: "HD-004",
    title: "Consulta sobre integración API REST",
    description: "El equipo técnico del cliente necesita documentación sobre cómo consumir la API de inventario.",
    type: "Consulta", priority: "Baja", status: "Pendiente",
    client: "EduPlat", requester: "Carmen Vega",
    agent: "María P.", department: "Soporte",
    messages: [
      { id: "msg8", author: "Carmen Vega", role: "user", date: "2025-03-03T16:00:00", message: "¿Podrían compartir la documentación de la API de inventario? Estamos evaluando una integración." },
      { id: "msg9", author: "María P.", role: "agent", date: "2025-03-03T17:00:00", message: "Hola Carmen, estamos preparando la documentación actualizada. La tendremos lista para el viernes." },
    ],
    activity: [
      { id: "a10", date: "2025-03-03T16:00:00", user: "Sistema", action: "Ticket creado" },
      { id: "a11", date: "2025-03-03T16:30:00", user: "Sistema", action: "Ticket asignado a María P." },
      { id: "a12", date: "2025-03-03T17:00:00", user: "María P.", action: "Estado cambiado a Pendiente" },
    ],
    createdAt: "2025-03-03T16:00:00", updatedAt: "2025-03-03T17:00:00",
  },
  {
    id: "t5", ticketId: "HD-005",
    title: "Actualización de certificados SSL",
    description: "Los certificados SSL del ambiente de staging vencen en 5 días. Se requiere renovación urgente.",
    type: "Soporte", priority: "Alta", status: "Resuelto",
    client: "Innovatech Labs", requester: "Pedro Ruiz",
    agent: "Jorge L.", department: "Infraestructura",
    messages: [
      { id: "msg10", author: "Pedro Ruiz", role: "user", date: "2025-03-01T08:00:00", message: "Los certificados están por vencer. ¿Pueden renovarlos antes del viernes?" },
      { id: "msg11", author: "Jorge L.", role: "agent", date: "2025-03-01T09:00:00", message: "Ya iniciamos el proceso de renovación. Estará listo hoy." },
      { id: "msg12", author: "Jorge L.", role: "agent", date: "2025-03-01T14:00:00", message: "Certificados renovados y desplegados exitosamente. Todo funcionando correctamente." },
    ],
    activity: [
      { id: "a13", date: "2025-03-01T08:00:00", user: "Sistema", action: "Ticket creado" },
      { id: "a14", date: "2025-03-01T08:30:00", user: "Sistema", action: "Ticket asignado a Jorge L." },
      { id: "a15", date: "2025-03-01T14:00:00", user: "Jorge L.", action: "Estado cambiado a Resuelto" },
      { id: "a16", date: "2025-03-01T14:00:00", user: "Jorge L.", action: "Ticket cerrado" },
    ],
    createdAt: "2025-03-01T08:00:00", updatedAt: "2025-03-01T14:00:00",
  },
];

// ── Helpers ────────────────────────────────────────────
export function formatTicketDate(d: string) {
  try {
    return format(new Date(d), "dd MMM yyyy", { locale: es });
  } catch {
    return d;
  }
}

export function formatTicketDateTime(d: string) {
  try {
    return format(new Date(d), "dd MMM HH:mm", { locale: es });
  } catch {
    return d;
  }
}

export function timeAgoTicket(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}
