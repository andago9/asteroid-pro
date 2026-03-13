import { CheckSquare, Plus, Zap, CalendarIcon, Pencil, ArrowRight } from "lucide-react";
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
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useSystemUsers } from "@/hooks/useSystemUsers";
import { toast } from "sonner";

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

type TaskFormData = {
  name: string;
  status: TaskStatus;
  assignee: string;
  assignedBy: string;
  project: string;
  projectId: string;
  clientName: string;
  dueDate: Date | undefined;
  points: number;
};

const emptyForm = (): TaskFormData => ({
  name: "", status: "Pendiente", assignee: "", assignedBy: "",
  project: "", projectId: "", clientName: "", dueDate: undefined, points: 10,
});

export default function Tareas() {
  const { tasks, isLoading, create, updateTask, updateStatus } = useTasks();
  const { projects } = useProjects();
  const { clients } = useClients();
  const { users } = useSystemUsers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormData>(emptyForm());

  const openCreate = () => {
    setEditingTask(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      name: task.name,
      status: task.status,
      assignee: task.assignee === "Sin asignar" ? "" : task.assignee,
      assignedBy: task.assignedBy,
      project: task.project === "Sin proyecto" ? "" : task.project,
      projectId: task.projectId,
      clientName: task.clientName,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      points: task.points,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name,
      status: form.status,
      assignee: form.assignee || "Sin asignar",
      assignedBy: form.assignedBy,
      project: form.project || "Sin proyecto",
      projectId: form.projectId,
      clientName: form.clientName,
      dueDate: form.dueDate ? format(form.dueDate, "yyyy-MM-dd") : "",
      points: form.points,
    };
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data: payload });
      toast.success("Tarea actualizada");
    } else {
      create.mutate(payload);
      toast.success("Tarea creada");
    }
    setForm(emptyForm());
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateStatus.mutate({ id: taskId, status: newStatus });
    toast.success(`Estado actualizado a ${newStatus}`);
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ["Pendiente", "En progreso", "En revisión", "Completada"];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando tareas...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" /> Tareas
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">Vista Kanban · {tasks.length} tareas</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Nueva Tarea
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className={`space-y-3 border-t-2 ${col.color} pt-3`}>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.status}</h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              {colTasks.map((task) => {
                const nextStatus = getNextStatus(task.status);
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-lg p-4 hover:glow-primary transition-all cursor-pointer group"
                    onClick={() => openEdit(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors flex-1 min-w-0 truncate">{task.name}</p>
                      <div className="flex items-center gap-1 text-xs font-mono text-secondary shrink-0 ml-2">
                        <Zap className="h-3 w-3" />
                        {task.points}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`h-2 w-2 rounded-full ${statusDot[task.status]}`} />
                      <span>{task.assignee}</span>
                    </div>
                    {task.clientName && (
                      <p className="text-[10px] text-muted-foreground mt-1">Cliente: {task.clientName}</p>
                    )}
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      {task.project} {task.dueDate && `· Vence: ${task.dueDate}`}
                    </p>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(task)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-2.5 w-2.5" /> Editar
                      </button>
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusChange(task.id, nextStatus)}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <ArrowRight className="h-2.5 w-2.5" /> {nextStatus}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Dialog Crear/Editar Tarea */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) { setDialogOpen(false); setEditingTask(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> {editingTask ? "Editar Tarea" : "Nueva Tarea"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input placeholder="Nombre de la tarea" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as TaskStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={form.assignee || "__none__"} onValueChange={(v) => setForm((p) => ({ ...p, assignee: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin asignar</SelectItem>
                    {users.map((u) => <SelectItem key={u.id} value={u.full_name}>{u.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Asignado por</Label>
                <Select value={form.assignedBy || "__none__"} onValueChange={(v) => setForm((p) => ({ ...p, assignedBy: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin especificar</SelectItem>
                    {users.map((u) => <SelectItem key={u.id} value={u.full_name}>{u.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proyecto</Label>
                <Select
                  value={form.projectId || "__none__"}
                  onValueChange={(v) => {
                    if (v === "__none__") {
                      setForm((p) => ({ ...p, project: "", projectId: "" }));
                    } else {
                      const proj = projects.find((pr) => pr.id === v);
                      setForm((p) => ({ ...p, project: proj?.name ?? "", projectId: v }));
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin proyecto</SelectItem>
                    {projects.map((pr) => <SelectItem key={pr.id} value={pr.id}>{pr.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={form.clientName || "__none__"} onValueChange={(v) => setForm((p) => ({ ...p, clientName: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin cliente</SelectItem>
                    {clients.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de entrega</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.dueDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.dueDate ? format(form.dueDate, "dd/MM/yyyy") : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.dueDate} onSelect={(d) => setForm((p) => ({ ...p, dueDate: d }))} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Puntaje</Label>
                <Input type="number" min={0} value={form.points} onChange={(e) => setForm((p) => ({ ...p, points: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setEditingTask(null); }}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>{editingTask ? "Guardar cambios" : "Crear Tarea"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
