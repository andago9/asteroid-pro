import { CheckSquare, Plus, Filter, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

type TaskStatus = "Pendiente" | "En progreso" | "En revisión" | "Completada";

interface Task {
  id: string;
  name: string;
  assignee: string;
  priority: "Crítica" | "Alta" | "Media" | "Baja";
  status: TaskStatus;
  dueDate: string;
  points: number;
}

const mockTasks: Task[] = [
  { id: "1", name: "Diseño landing page", assignee: "Ana G.", priority: "Alta", status: "En progreso", dueDate: "2026-03-10", points: 50 },
  { id: "2", name: "API integración pagos", assignee: "Carlos M.", priority: "Crítica", status: "Pendiente", dueDate: "2026-03-08", points: 100 },
  { id: "3", name: "Review UX dashboard", assignee: "María L.", priority: "Media", status: "En revisión", dueDate: "2026-03-12", points: 30 },
  { id: "4", name: "Deploy producción v2.1", assignee: "Jorge R.", priority: "Alta", status: "Pendiente", dueDate: "2026-03-09", points: 80 },
  { id: "5", name: "Documentación técnica", assignee: "Ana G.", priority: "Baja", status: "En progreso", dueDate: "2026-03-15", points: 20 },
  { id: "6", name: "Tests unitarios módulo auth", assignee: "Carlos M.", priority: "Media", status: "Completada", dueDate: "2026-03-05", points: 40 },
  { id: "7", name: "Optimización queries DB", assignee: "Jorge R.", priority: "Alta", status: "Pendiente", dueDate: "2026-03-11", points: 60 },
  { id: "8", name: "Diseño sistema de iconos", assignee: "María L.", priority: "Baja", status: "Completada", dueDate: "2026-03-04", points: 25 },
];

const columns: { status: TaskStatus; color: string }[] = [
  { status: "Pendiente", color: "border-warning/50" },
  { status: "En progreso", color: "border-info/50" },
  { status: "En revisión", color: "border-secondary/50" },
  { status: "Completada", color: "border-success/50" },
];

const priorityDot: Record<string, string> = {
  Crítica: "bg-destructive",
  Alta: "bg-warning",
  Media: "bg-info",
  Baja: "bg-muted-foreground",
};

export default function Tareas() {
  const [tasks] = useState(mockTasks);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" /> Tareas
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">Vista Kanban · {tasks.length} tareas</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
            <Filter className="h-3.5 w-3.5" /> Filtrar
          </button>
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Nueva Tarea
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className={`space-y-3 border-t-2 ${col.color} pt-3`}>
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {col.status}
                </h3>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              {colTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-lg p-4 hover:glow-primary transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{task.name}</p>
                    <div className="flex items-center gap-1 text-xs font-mono text-secondary">
                      <Zap className="h-3 w-3" />
                      {task.points}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${priorityDot[task.priority]}`} />
                    <span>{task.priority}</span>
                    <span className="text-border">·</span>
                    <span>{task.assignee}</span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground mt-2">Vence: {task.dueDate}</p>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
