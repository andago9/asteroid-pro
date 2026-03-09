import { CheckSquare, Plus, Filter, Zap, CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTasks, type TaskStatus, type Task } from "@/hooks/useTasks";

const columns: { status: TaskStatus; color: string; dotColor: string }[] = [
  { status: "Pendiente", color: "border-muted-foreground/50", dotColor: "bg-muted-foreground" },
  { status: "En progreso", color: "border-info/50", dotColor: "bg-info" },
  { status: "En revisión", color: "border-warning/50", dotColor: "bg-warning" },
  { status: "Completada", color: "border-success/50", dotColor: "bg-success" },
];

const statusDot: Record<TaskStatus, string> = {
  Pendiente: "bg-muted-foreground",
  "En progreso": "bg-info",
  "En revisión": "bg-warning",
  Completada: "bg-success",
};

export default function Tareas() {
  const [tasks, setTasks] = useState(mockTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    status: "Pendiente" as TaskStatus,
    assignee: "",
    project: "",
    dueDate: undefined as Date | undefined,
    points: 10,
  });

  const handleCreate = () => {
    if (!newTask.name.trim()) return;
    const task: Task = {
      id: String(Date.now()),
      name: newTask.name,
      status: newTask.status,
      assignee: newTask.assignee || "Sin asignar",
      project: newTask.project || "Sin proyecto",
      dueDate: newTask.dueDate ? format(newTask.dueDate, "yyyy-MM-dd") : "",
      points: newTask.points,
    };
    setTasks((prev) => [...prev, task]);
    setNewTask({ name: "", status: "Pendiente", assignee: "", project: "", dueDate: undefined, points: 10 });
    setDialogOpen(false);
  };

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
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
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
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.status}
                  </h3>
                </div>
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
                    <span className={`h-2 w-2 rounded-full ${statusDot[task.status]}`} />
                    <span>{task.status}</span>
                    <span className="text-border">·</span>
                    <span>{task.assignee}</span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground mt-2">
                    {task.project} {task.dueDate && `· Vence: ${task.dueDate}`}
                  </p>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Dialog Nueva Tarea */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Nueva Tarea
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Nombre de la tarea"
                value={newTask.name}
                onChange={(e) => setNewTask((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={newTask.status} onValueChange={(v) => setNewTask((p) => ({ ...p, status: v as TaskStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (
                    <SelectItem key={c.status} value={c.status}>
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${c.dotColor}`} />
                        {c.status}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsable</Label>
                <Input
                  placeholder="Nombre"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask((p) => ({ ...p, assignee: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Proyecto</Label>
                <Input
                  placeholder="Proyecto"
                  value={newTask.project}
                  onChange={(e) => setNewTask((p) => ({ ...p, project: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de entrega</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !newTask.dueDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.dueDate ? format(newTask.dueDate, "dd/MM/yyyy") : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate}
                      onSelect={(d) => setNewTask((p) => ({ ...p, dueDate: d }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Puntaje</Label>
                <Input
                  type="number"
                  min={0}
                  value={newTask.points}
                  onChange={(e) => setNewTask((p) => ({ ...p, points: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!newTask.name.trim()}>Crear Tarea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
