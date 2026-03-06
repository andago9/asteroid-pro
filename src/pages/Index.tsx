import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  Trophy,
  Rocket,
  Zap,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const productivityData = [
  { day: "Lun", tasks: 5, points: 120 },
  { day: "Mar", tasks: 8, points: 200 },
  { day: "Mié", tasks: 6, points: 150 },
  { day: "Jue", tasks: 10, points: 280 },
  { day: "Vie", tasks: 7, points: 180 },
  { day: "Sáb", tasks: 3, points: 80 },
  { day: "Dom", tasks: 1, points: 30 },
];

const radarData = [
  { criteria: "Retorno", value: 4.2 },
  { criteria: "Riesgo", value: 3.8 },
  { criteria: "Factibilidad", value: 4.5 },
  { criteria: "Alineación", value: 4.0 },
  { criteria: "Capital", value: 3.5 },
  { criteria: "Tiempo", value: 3.2 },
];

const recentTasks = [
  { name: "Diseño landing page", status: "En progreso", priority: "Alta", points: 50 },
  { name: "API integración pagos", status: "Pendiente", priority: "Crítica", points: 100 },
  { name: "Review UX dashboard", status: "En revisión", priority: "Media", points: 30 },
  { name: "Deploy producción v2.1", status: "Pendiente", priority: "Alta", points: 80 },
  { name: "Documentación técnica", status: "En progreso", priority: "Baja", points: 20 },
];

const recentProjects = [
  { name: "Portal E-Commerce", score: 4.2, status: "En desarrollo", progress: 65 },
  { name: "App Móvil Fintech", score: 3.8, status: "Planeación", progress: 20 },
  { name: "Dashboard Analytics", score: 4.5, status: "En desarrollo", progress: 80 },
];

const statusColors: Record<string, string> = {
  "En progreso": "bg-info/10 text-info",
  Pendiente: "bg-warning/10 text-warning",
  "En revisión": "bg-secondary/10 text-secondary",
  Completada: "bg-success/10 text-success",
};

const priorityColors: Record<string, string> = {
  Crítica: "bg-destructive/10 text-destructive",
  Alta: "bg-warning/10 text-warning",
  Media: "bg-info/10 text-info",
  Baja: "bg-muted text-muted-foreground",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function Index() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido, <span className="gradient-text">Comandante</span>
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            <Rocket className="inline h-3.5 w-3.5 mr-1" />
            Misión del día: 4 tareas pendientes · 2 alertas
          </p>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
          <Trophy className="h-4 w-4 text-secondary" />
          <span className="text-sm font-bold">2,450 XP</span>
          <span className="text-xs text-muted-foreground">Nivel 7</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Proyectos Activos"
          value={12}
          icon={FolderKanban}
          variant="primary"
          trend={{ value: "+2 este mes", positive: true }}
        />
        <StatCard
          title="Tareas Pendientes"
          value={24}
          icon={CheckSquare}
          variant="secondary"
          trend={{ value: "8 urgentes", positive: false }}
        />
        <StatCard
          title="Clientes Activos"
          value={38}
          icon={Users}
          variant="success"
          trend={{ value: "+5 este mes", positive: true }}
        />
        <StatCard
          title="Productividad"
          value="87%"
          icon={TrendingUp}
          variant="default"
          trend={{ value: "+12% vs semana pasada", positive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Productivity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Actividad Semanal</h3>
              <p className="text-xs text-muted-foreground font-mono">Tareas completadas & puntos</p>
            </div>
            <Zap className="h-4 w-4 text-secondary" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(207, 72%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(207, 72%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 18%, 18%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 22%, 11%)",
                  border: "1px solid hsl(222, 18%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="tasks" stroke="hsl(207, 72%, 50%)" fill="url(#colorTasks)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Top Proyecto</h3>
              <p className="text-xs text-muted-foreground font-mono">Dashboard Analytics</p>
            </div>
            <span className="text-lg font-bold text-secondary">4.5</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222, 18%, 18%)" />
              <PolarAngleAxis dataKey="criteria" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="hsl(207, 72%, 50%)" fill="hsl(207, 72%, 50%)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Tareas Recientes</h3>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[task.status]}`}>
                      {task.status}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-secondary">
                  <Zap className="h-3 w-3" />
                  {task.points}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Projects */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Proyectos Recientes</h3>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{project.progress}%</span>
                    <span className="text-sm font-bold text-primary">{project.score}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="mt-6 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">Alertas</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-warning/5">
                <Clock className="h-3.5 w-3.5 text-warning shrink-0" />
                <span>Entrega "App Fintech" vence en 3 días</span>
              </div>
              <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-destructive/5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                <span>Servidor API con alta latencia (&gt;2s)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
