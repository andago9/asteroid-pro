import { Headphones, Plus, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const tickets = [
  { id: "HD-001", client: "TechCorp Solutions", subject: "Error en módulo de pagos", priority: "Alta", status: "Abierto", category: "Bug", date: "Mar 5" },
  { id: "HD-002", client: "GreenEnergy MX", subject: "Solicitud de nueva funcionalidad", priority: "Media", status: "En progreso", category: "Feature", date: "Mar 4" },
  { id: "HD-003", client: "Digital Minds", subject: "Problema de rendimiento", priority: "Crítica", status: "Abierto", category: "Performance", date: "Mar 4" },
  { id: "HD-004", client: "EduPlat", subject: "Consulta sobre integración API", priority: "Baja", status: "En espera", category: "Consulta", date: "Mar 3" },
  { id: "HD-005", client: "Innovatech Labs", subject: "Actualización de certificados SSL", priority: "Media", status: "Cerrado", category: "Infraestructura", date: "Mar 1" },
];

const statusBadge: Record<string, string> = {
  Abierto: "bg-destructive/10 text-destructive",
  "En progreso": "bg-info/10 text-info",
  "En espera": "bg-warning/10 text-warning",
  Cerrado: "bg-muted text-muted-foreground",
};

const priorityBadge: Record<string, string> = {
  Crítica: "bg-destructive/10 text-destructive",
  Alta: "bg-warning/10 text-warning",
  Media: "bg-info/10 text-info",
  Baja: "bg-muted text-muted-foreground",
};

export default function Helpdesk() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Headphones className="h-6 w-6 text-primary" /> Helpdesk
        </h1>
        <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Nuevo Ticket
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Ticket</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Cliente</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Categoría</th>
              <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Prioridad</th>
              <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Estado</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors cursor-pointer">
                <td className="p-4">
                  <p className="font-mono text-xs text-primary font-semibold">{t.id}</p>
                  <p className="text-xs font-medium mt-0.5">{t.subject}</p>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{t.client}</td>
                <td className="p-4"><span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t.category}</span></td>
                <td className="p-4 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityBadge[t.priority]}`}>{t.priority}</span></td>
                <td className="p-4 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge[t.status]}`}>{t.status}</span></td>
                <td className="p-4 text-right text-xs font-mono text-muted-foreground">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
