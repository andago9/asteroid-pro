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
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { user } = useAuth();
  const { profile } = useProfile();
  const { projects, isLoading: loadingProjects } = useProjects();
  const { tasks, isLoading: loadingTasks } = useTasks();
  const { clients, isLoading: loadingClients } = useClients();

  const isLoading = loadingProjects || loadingTasks || loadingClients;

  const activeProjects = useMemo(() => projects.filter(p => p.status === "En progreso" || p.status === "Planeación"), [projects]);
  const pendingTasks = useMemo(() => tasks.filter(t => t.status !== "Completada"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === "Completada"), [tasks]);
  const activeClients = useMemo(() => clients.filter(c => c.status === "Cliente activo"), [clients]);
  const totalPoints = useMemo(() => tasks.reduce((sum, t) => sum + (t.points || 0), 0), [tasks]);
  const completedPoints = useMemo(() => completedTasks.reduce((sum, t) => sum + (t.points || 0), 0), [completedTasks]);

  const productivity = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }, [tasks, completedTasks]);

  // Build weekly activity from tasks by due_date
  const weeklyActivity = useMemo(() => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const counts = Array(7).fill(0);
    tasks.forEach(t => {
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (!isNaN(d.getTime())) counts[d.getDay()]++;
      }
    });
    // Reorder Mon-Sun
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.map(i => ({ day: days[i], tasks: counts[i] }));
  }, [tasks]);

  // Top project radar data
  const topProject = useMemo(() => {
    if (projects.length === 0) return null;
    const sorted = [...projects].sort((a, b) => {
      const avg = (p: typeof a) => {
        const s = p.scores;
        return (s.retorno + s.factibilidad + s.reconocimiento + s.capital + s.tiempo + s.riesgo) / 6;
      };
      return avg(b) - avg(a);
    });
    return sorted[0];
  }, [projects]);

  const radarData = useMemo(() => {
    if (!topProject) return [];
    const s = topProject.scores;
    return [
      { criteria: "Retorno", value: s.retorno },
      { criteria: "Riesgo", value: s.riesgo },
      { criteria: "Factibilidad", value: s.factibilidad },
      { criteria: "Reconocimiento", value: s.reconocimiento },
      { criteria: "Capital", value: s.capital },
      { criteria: "Tiempo", value: s.tiempo },
    ];
  }, [topProject]);

  const topAvg = useMemo(() => {
    if (!topProject) return 0;
    const s = topProject.scores;
    return ((s.retorno + s.factibilidad + s.reconocimiento + s.capital + s.tiempo + s.riesgo) / 6).toFixed(1);
  }, [topProject]);

  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);
  const recentProjects = useMemo(() => projects.slice(0, 3), [projects]);

  // Alerts: tasks due within 3 days
  const urgentAlerts = useMemo(() => {
    const now = new Date();
    const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return pendingTasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= now && d <= soon;
    }).slice(0, 3);
  }, [pendingTasks]);

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Comandante";
  const xpLevel = useMemo(() => {
    const level = Math.floor(totalPoints / 500) + 1;
    return { xp: totalPoints, level };
  }, [totalPoints]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido, <span className="gradient-text">{userName}</span>
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            <Rocket className="inline h-3.5 w-3.5 mr-1" />
            Misión del día: {pendingTasks.length} tareas pendientes · {urgentAlerts.length} alertas
          </p>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
          <Trophy className="h-4 w-4 text-secondary" />
          <span className="text-sm font-bold">{xpLevel.xp.toLocaleString()} XP</span>
          <span className="text-xs text-muted-foreground">Nivel {xpLevel.level}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Proyectos Activos"
          value={activeProjects.length}
          icon={FolderKanban}
          variant="primary"
          trend={{ value: `${projects.length} total`, positive: true }}
        />
        <StatCard
          title="Tareas Pendientes"
          value={pendingTasks.length}
          icon={CheckSquare}
          variant="secondary"
          trend={{ value: `${urgentAlerts.length} urgentes`, positive: urgentAlerts.length === 0 }}
        />
        <StatCard
          title="Clientes Activos"
          value={activeClients.length}
          icon={Users}
          variant="success"
          trend={{ value: `${clients.length} total`, positive: true }}
        />
        <StatCard
          title="Productividad"
          value={`${productivity}%`}
          icon={TrendingUp}
          variant="default"
          trend={{ value: `${completedTasks.length}/${tasks.length} completadas`, positive: productivity >= 50 }}
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
              <p className="text-xs text-muted-foreground font-mono">Tareas por día de la semana</p>
            </div>
            <Zap className="h-4 w-4 text-secondary" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(207, 72%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(207, 72%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 18%, 18%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }} allowDecimals={false} />
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
              <p className="text-xs text-muted-foreground font-mono truncate">{topProject?.name ?? "Sin proyectos"}</p>
            </div>
            <span className="text-lg font-bold text-secondary">{topAvg}</span>
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(222, 18%, 18%)" />
                <PolarAngleAxis dataKey="criteria" tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }} />
                <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="hsl(207, 72%, 50%)" fill="hsl(207, 72%, 50%)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
              Sin datos de proyectos
            </div>
          )}
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
            {recentTasks.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Sin tareas registradas</p>
            )}
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[task.status] ?? "bg-muted text-muted-foreground"}`}>
                      {task.status}
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
            {recentProjects.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Sin proyectos registrados</p>
            )}
            {recentProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{project.progress}%</span>
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
          {urgentAlerts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">Alertas</h4>
              </div>
              <div className="space-y-2">
                {urgentAlerts.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-warning/5">
                    <Clock className="h-3.5 w-3.5 text-warning shrink-0" />
                    <span>"{t.name}" vence pronto</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
