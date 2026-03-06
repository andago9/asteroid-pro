import { BarChart3, FileText } from "lucide-react";
import { motion } from "framer-motion";

const reports = [
  { name: "Reporte de Proyectos", description: "Estado, progreso y scoring de todos los proyectos", icon: "📊", available: true },
  { name: "Reporte Financiero", description: "Ingresos, gastos y flujo de caja mensual", icon: "💰", available: true },
  { name: "Reporte de Tareas", description: "Productividad, tareas completadas y tiempos", icon: "✅", available: true },
  { name: "Reporte de Clientes", description: "Actividad de clientes y cuentas por cobrar", icon: "👥", available: true },
  { name: "Reporte de Gamificación", description: "Ranking, puntos y niveles del equipo", icon: "🏆", available: false },
  { name: "Reporte de Infraestructura", description: "Uptime, rendimiento y alertas de servidores", icon: "🖥️", available: false },
];

export default function Reportes() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" /> Reportes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card rounded-xl p-5 cursor-pointer hover:glow-primary transition-all ${!r.available ? "opacity-50" : ""}`}
          >
            <div className="text-3xl mb-3">{r.icon}</div>
            <h3 className="text-sm font-semibold mb-1">{r.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
            {r.available ? (
              <button className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <FileText className="h-3.5 w-3.5" /> Generar Reporte
              </button>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">Próximamente</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
