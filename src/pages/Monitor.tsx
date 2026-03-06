import { Activity, CheckCircle, XCircle, Clock, Wifi } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { name: "API Principal", url: "api.pami.dev", status: "online", response: "45ms", lastCheck: "Hace 2 min", uptime: "99.98%" },
  { name: "Portal Web", url: "app.pami.dev", status: "online", response: "120ms", lastCheck: "Hace 1 min", uptime: "99.95%" },
  { name: "Base de Datos", url: "db.pami.dev", status: "online", response: "12ms", lastCheck: "Hace 3 min", uptime: "100%" },
  { name: "CDN Assets", url: "cdn.pami.dev", status: "online", response: "28ms", lastCheck: "Hace 1 min", uptime: "99.99%" },
  { name: "Servidor Email", url: "mail.pami.dev", status: "degraded", response: "2100ms", lastCheck: "Hace 5 min", uptime: "98.5%" },
  { name: "Servidor Staging", url: "staging.pami.dev", status: "offline", response: "—", lastCheck: "Hace 15 min", uptime: "95.2%" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  online: { icon: CheckCircle, color: "text-success", label: "Online" },
  degraded: { icon: Clock, color: "text-warning", label: "Degradado" },
  offline: { icon: XCircle, color: "text-destructive", label: "Offline" },
};

export default function Monitor() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" /> Monitor
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s, i) => {
          const cfg = statusConfig[s.status];
          const StatusIcon = cfg.icon;
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{s.name}</h3>
                <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-3">{s.url}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">Estado</p>
                  <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Respuesta</p>
                  <p className="text-xs font-mono font-semibold">{s.response}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Uptime</p>
                  <p className="text-xs font-mono font-semibold">{s.uptime}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
                <Wifi className="h-3 w-3" /> {s.lastCheck}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
