import { X, Globe, Server, Cpu, Zap, Clock, Activity, AlertTriangle, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  MonitorResource, STATUS_CONFIG, formatLatency, timeAgo,
} from "@/lib/monitor-data";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  resource: MonitorResource | null;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, typeof Globe> = {
  Aplicación: Cpu,
  Servicio: Zap,
  Web: Globe,
  Servidor: Server,
};

const INCIDENT_STYLES: Record<string, string> = {
  caído: "text-destructive",
  recuperado: "text-success",
  degradado: "text-warning",
  mantenimiento: "text-info",
};

export function ResourceDetail({ resource, onClose }: Props) {
  if (!resource) return null;

  const cfg = STATUS_CONFIG[resource.status];
  const TypeIcon = TYPE_ICONS[resource.type] || Globe;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-background border-l border-border z-50 overflow-y-auto shadow-2xl"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${cfg.bg}`}>
                <TypeIcon className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold">{resource.name}</h2>
                <p className="text-xs text-muted-foreground font-mono">{resource.url}{resource.port ? `:${resource.port}` : ""}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>

          {/* Status & Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`rounded-lg p-3 ${cfg.bg}`}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado</p>
              <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
            </div>
            <div className="rounded-lg p-3 bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Latencia</p>
              <p className="text-sm font-bold font-mono">{formatLatency(resource.latency)}</p>
            </div>
            <div className="rounded-lg p-3 bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uptime</p>
              <p className="text-sm font-bold font-mono">{resource.uptime}%</p>
            </div>
            <div className="rounded-lg p-3 bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Última rev.</p>
              <p className="text-sm font-bold">{timeAgo(resource.lastCheck)}</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Información General</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[11px] text-muted-foreground">Tipo</p>
                <p className="font-medium">{resource.type}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Frecuencia</p>
                <p className="font-medium">{resource.frequency}</p>
              </div>
              {resource.description && (
                <div className="col-span-2">
                  <p className="text-[11px] text-muted-foreground">Descripción</p>
                  <p className="font-medium">{resource.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Latency Chart */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Latencia — Últimas 24h</h3>
            <div className="glass-card rounded-xl p-4">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={resource.latencyHistory}>
                  <defs>
                    <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={3} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))",
                      borderRadius: "8px", fontSize: "11px", color: "hsl(var(--foreground))",
                    }}
                    formatter={(v: number) => [`${v}ms`, "Latencia"]}
                  />
                  <Area type="monotone" dataKey="latency" stroke="hsl(var(--primary))" fill="url(#latGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Availability bar */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disponibilidad</h3>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Uptime</span>
                <span className="text-xs font-bold font-mono">{resource.uptime}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    resource.uptime >= 99.5 ? "bg-success" : resource.uptime >= 97 ? "bg-warning" : "bg-destructive"
                  }`}
                  style={{ width: `${resource.uptime}%` }}
                />
              </div>
            </div>
          </div>

          {/* Incidents */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial de Incidentes</h3>
            {resource.incidents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin incidentes registrados</p>
            ) : (
              <div className="space-y-2">
                {resource.incidents.map(inc => (
                  <div key={inc.id} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                    <div className={`mt-0.5 ${INCIDENT_STYLES[inc.event] || "text-muted-foreground"}`}>
                      {inc.event === "caído" ? <AlertTriangle className="h-4 w-4" /> :
                       inc.event === "recuperado" ? <ArrowUpRight className="h-4 w-4" /> :
                       <Activity className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] capitalize">{inc.event}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {format(new Date(inc.date), "dd MMM HH:mm", { locale: es })}
                        </span>
                      </div>
                      <p className="text-xs mt-1">{inc.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
