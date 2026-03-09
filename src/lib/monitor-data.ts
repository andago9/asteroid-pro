// ── Types ──────────────────────────────────────────────
export type ResourceType = "Aplicación" | "Servicio" | "Web" | "Servidor";
export type ResourceStatus = "online" | "degraded" | "offline";
export type MonitorFrequency = "30s" | "1m" | "5m" | "15m" | "30m";
export type IncidentEvent = "caído" | "recuperado" | "degradado" | "mantenimiento";

export interface LatencyPoint {
  time: string;
  latency: number;
}

export interface Incident {
  id: string;
  date: string;
  event: IncidentEvent;
  note: string;
}

export interface MonitorResource {
  id: string;
  name: string;
  type: ResourceType;
  url: string;
  port: string;
  frequency: MonitorFrequency;
  description: string;
  status: ResourceStatus;
  latency: number; // ms, -1 if offline
  lastCheck: string; // ISO date
  uptime: number; // percentage
  latencyHistory: LatencyPoint[];
  incidents: Incident[];
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────
export const RESOURCE_TYPES: ResourceType[] = ["Aplicación", "Servicio", "Web", "Servidor"];
export const RESOURCE_STATUSES: ResourceStatus[] = ["online", "degraded", "offline"];
export const MONITOR_FREQUENCIES: { value: MonitorFrequency; label: string }[] = [
  { value: "30s", label: "Cada 30 seg" },
  { value: "1m", label: "Cada 1 min" },
  { value: "5m", label: "Cada 5 min" },
  { value: "15m", label: "Cada 15 min" },
  { value: "30m", label: "Cada 30 min" },
];

export const STATUS_CONFIG: Record<ResourceStatus, { color: string; bg: string; label: string }> = {
  online: { color: "text-success", bg: "bg-success/10", label: "Online" },
  degraded: { color: "text-warning", bg: "bg-warning/10", label: "Degradado" },
  offline: { color: "text-destructive", bg: "bg-destructive/10", label: "Offline" },
};

// ── Helper: generate latency history ───────────────────
function generateLatencyHistory(baseLatency: number, status: ResourceStatus): LatencyPoint[] {
  const points: LatencyPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    const hour = t.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
    let lat = baseLatency + Math.round((Math.random() - 0.5) * baseLatency * 0.6);
    if (status === "offline" && i < 2) lat = 0;
    if (status === "degraded" && i < 3) lat = baseLatency * 4 + Math.round(Math.random() * 500);
    points.push({ time: hour, latency: Math.max(0, lat) });
  }
  return points;
}

// ── Mock data ──────────────────────────────────────────
export const MOCK_RESOURCES: MonitorResource[] = [
  {
    id: "r1", name: "API Principal", type: "Servicio", url: "api.pami.dev", port: "443",
    frequency: "30s", description: "API REST principal del sistema",
    status: "online", latency: 45, lastCheck: new Date(Date.now() - 120000).toISOString(),
    uptime: 99.98, latencyHistory: generateLatencyHistory(45, "online"),
    incidents: [
      { id: "inc1", date: new Date(Date.now() - 86400000 * 3).toISOString(), event: "caído", note: "Timeout en base de datos" },
      { id: "inc2", date: new Date(Date.now() - 86400000 * 3 + 180000).toISOString(), event: "recuperado", note: "Reinicio de conexión DB" },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "r2", name: "Portal Web", type: "Web", url: "app.pami.dev", port: "443",
    frequency: "1m", description: "Aplicación web principal",
    status: "online", latency: 120, lastCheck: new Date(Date.now() - 60000).toISOString(),
    uptime: 99.95, latencyHistory: generateLatencyHistory(120, "online"),
    incidents: [], createdAt: "2024-01-15",
  },
  {
    id: "r3", name: "Base de Datos", type: "Servicio", url: "db.pami.dev", port: "5432",
    frequency: "30s", description: "PostgreSQL principal",
    status: "online", latency: 12, lastCheck: new Date(Date.now() - 180000).toISOString(),
    uptime: 100, latencyHistory: generateLatencyHistory(12, "online"),
    incidents: [], createdAt: "2024-02-01",
  },
  {
    id: "r4", name: "CDN Assets", type: "Servicio", url: "cdn.pami.dev", port: "443",
    frequency: "5m", description: "Red de distribución de contenido",
    status: "online", latency: 28, lastCheck: new Date(Date.now() - 60000).toISOString(),
    uptime: 99.99, latencyHistory: generateLatencyHistory(28, "online"),
    incidents: [], createdAt: "2024-01-20",
  },
  {
    id: "r5", name: "Servidor Email", type: "Servicio", url: "mail.pami.dev", port: "587",
    frequency: "5m", description: "Servidor SMTP para correos transaccionales",
    status: "degraded", latency: 2100, lastCheck: new Date(Date.now() - 300000).toISOString(),
    uptime: 98.5, latencyHistory: generateLatencyHistory(350, "degraded"),
    incidents: [
      { id: "inc3", date: new Date(Date.now() - 7200000).toISOString(), event: "degradado", note: "Latencia alta detectada" },
    ],
    createdAt: "2024-03-10",
  },
  {
    id: "r6", name: "Servidor Staging", type: "Servidor", url: "staging.pami.dev", port: "22",
    frequency: "5m", description: "Servidor de pruebas",
    status: "offline", latency: -1, lastCheck: new Date(Date.now() - 900000).toISOString(),
    uptime: 95.2, latencyHistory: generateLatencyHistory(80, "offline"),
    incidents: [
      { id: "inc4", date: new Date(Date.now() - 900000).toISOString(), event: "caído", note: "Sin respuesta del servidor" },
    ],
    createdAt: "2024-04-05",
  },
  {
    id: "r7", name: "App Móvil Backend", type: "Aplicación", url: "mobile-api.pami.dev", port: "443",
    frequency: "1m", description: "Backend para la aplicación móvil",
    status: "online", latency: 67, lastCheck: new Date(Date.now() - 45000).toISOString(),
    uptime: 99.92, latencyHistory: generateLatencyHistory(67, "online"),
    incidents: [], createdAt: "2024-05-15",
  },
  {
    id: "r8", name: "Landing Page", type: "Web", url: "www.pami.dev", port: "443",
    frequency: "5m", description: "Página de aterrizaje corporativa",
    status: "online", latency: 95, lastCheck: new Date(Date.now() - 240000).toISOString(),
    uptime: 99.97, latencyHistory: generateLatencyHistory(95, "online"),
    incidents: [], createdAt: "2024-06-01",
  },
  {
    id: "r9", name: "Servidor Producción", type: "Servidor", url: "prod-01.pami.dev", port: "22",
    frequency: "30s", description: "Servidor principal de producción",
    status: "online", latency: 15, lastCheck: new Date(Date.now() - 30000).toISOString(),
    uptime: 99.99, latencyHistory: generateLatencyHistory(15, "online"),
    incidents: [], createdAt: "2024-01-10",
  },
  {
    id: "r10", name: "CRM API", type: "Aplicación", url: "crm-api.pami.dev", port: "443",
    frequency: "1m", description: "API del módulo CRM",
    status: "online", latency: 52, lastCheck: new Date(Date.now() - 55000).toISOString(),
    uptime: 99.88, latencyHistory: generateLatencyHistory(52, "online"),
    incidents: [
      { id: "inc5", date: new Date(Date.now() - 86400000).toISOString(), event: "degradado", note: "Pico de tráfico" },
      { id: "inc6", date: new Date(Date.now() - 86400000 + 600000).toISOString(), event: "recuperado", note: "Auto-scaling activado" },
    ],
    createdAt: "2024-07-20",
  },
];

// ── Helpers ────────────────────────────────────────────
export function formatLatency(ms: number): string {
  if (ms < 0) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `Hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  return `Hace ${hours}h`;
}

export function emptyResource(): Omit<MonitorResource, "id" | "createdAt" | "latencyHistory" | "incidents" | "status" | "latency" | "lastCheck" | "uptime"> {
  return {
    name: "", type: "Servicio", url: "", port: "", frequency: "1m", description: "",
  };
}
