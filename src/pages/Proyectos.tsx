import { useState } from "react";
import { FolderKanban, Plus, Star, Pencil, Trash2, X } from "lucide-react";
import { useProjects, type Project, PROJECT_STATUSES, PROJECT_STATUS_DISPLAY } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useSystemUsers } from "@/hooks/useSystemUsers";
import { motion } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const weights = {
  reconocimiento: 0.10, riesgo: 0.15, capital: 0.10, retorno: 0.20,
  factibilidad: 0.15, dificultad: 0.10, tiempo: 0.10, alineacion: 0.10,
};

const scoreLabels: Record<string, string> = {
  reconocimiento: "Reconocimiento", riesgo: "Riesgo", capital: "Capital requerido",
  retorno: "Retorno", factibilidad: "Factibilidad", dificultad: "Dificultad",
  tiempo: "Tiempo", alineacion: "Alineación",
};

function calcScore(scores: Project["scores"]) {
  return Object.entries(weights).reduce((acc, [key, w]) => acc + scores[key as keyof typeof scores] * w, 0);
}

const statusBadge: Record<string, string> = {
  Idea: "bg-muted text-muted-foreground",
  Planeación: "bg-info/10 text-info",
  "En progreso": "bg-primary/10 text-primary",
  Pausado: "bg-warning/10 text-warning",
  Cancelado: "bg-destructive/10 text-destructive",
  Completado: "bg-success/10 text-success",
};

const defaultScores = { reconocimiento: 3, riesgo: 3, capital: 3, retorno: 3, factibilidad: 3, dificultad: 3, tiempo: 3, alineacion: 3 };

type FormData = {
  name: string;
  description: string;
  responsable: string;
  cliente: string;
  status: string;
  progress: number;
  scores: typeof defaultScores;
};

const emptyForm = (): FormData => ({
  name: "", description: "", responsable: "", cliente: "", status: "Idea", progress: 0,
  scores: { ...defaultScores },
});

export default function Proyectos() {
  const { projects, isLoading, create, update, remove } = useProjects();
  const { clients } = useClients();
  const { users } = useSystemUsers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());

  const ranked = [...projects].sort((a, b) => calcScore(b.scores) - calcScore(a.scores));

  const openCreate = () => {
    setEditingProject(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setForm({
      name: p.name,
      description: p.description,
      responsable: p.responsable,
      cliente: p.cliente,
      status: p.status,
      progress: p.progress,
      scores: { ...p.scores },
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name,
      description: form.description,
      status: form.status,
      progress: form.progress,
      responsable: form.responsable,
      cliente: form.cliente,
      scores: form.scores,
    };
    if (editingProject) {
      update.mutate({ id: editingProject.id, data: payload });
    } else {
      create.mutate(payload);
    }
    setForm(emptyForm());
    setDialogOpen(false);
    setEditingProject(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    remove.mutate(deleteId);
    setDeleteId(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" /> Proyectos
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{projects.length} proyectos · Ranking por score</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Nuevo Proyecto
        </button>
      </div>

      {isLoading && <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando proyectos...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ranked.map((project, idx) => {
          const score = calcScore(project.scores);
          const radarData = [
            { c: "Reconocimiento", v: project.scores.reconocimiento },
            { c: "Riesgo", v: project.scores.riesgo },
            { c: "Capital", v: project.scores.capital },
            { c: "Retorno", v: project.scores.retorno },
            { c: "Factibilidad", v: project.scores.factibilidad },
            { c: "Dificultad", v: project.scores.dificultad },
            { c: "Tiempo", v: project.scores.tiempo },
            { c: "Alineación", v: project.scores.alineacion },
          ];

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-xl p-5 hover:glow-primary transition-all cursor-pointer group"
              onClick={() => openEdit(project)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                    <h3 className="text-base font-semibold truncate">{project.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{project.responsable} · {project.cliente}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-secondary fill-secondary" />
                    <span className="text-lg font-bold">{score.toFixed(1)}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge[project.status] || ""}`}>
                    {PROJECT_STATUS_DISPLAY[project.status] || project.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ResponsiveContainer width="100%" height={160}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(222, 18%, 18%)" />
                      <PolarAngleAxis dataKey="c" tick={{ fontSize: 8, fill: "hsl(220, 10%, 55%)" }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar dataKey="v" stroke="hsl(207, 72%, 50%)" fill="hsl(207, 72%, 50%)" fillOpacity={0.15} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Progreso</p>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${project.progress}%` }} />
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">{project.progress}%</p>
                  </div>
                  {Object.entries(project.scores).slice(0, 4).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-mono font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons on hover */}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(project)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="h-3 w-3" /> Editar
                </button>
                <button onClick={() => setDeleteId(project.id)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                  <Trash2 className="h-3 w-3" /> Eliminar
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dialog Crear/Editar Proyecto */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) { setDialogOpen(false); setEditingProject(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Editar Proyecto" : "Nuevo Proyecto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input placeholder="Nombre del proyecto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea placeholder="Descripción breve" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select value={form.cliente || "__none__"} onValueChange={(v) => setForm({ ...form, cliente: v === "__none__" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin cliente</SelectItem>
                    {clients.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Responsable</Label>
                <Select value={form.responsable || "__none__"} onValueChange={(v) => setForm({ ...form, responsable: v === "__none__" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar responsable" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin asignar</SelectItem>
                    {users.map((u) => <SelectItem key={u.id} value={u.full_name}>{u.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Progreso (%)</Label>
                <Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Calificación (0–5)</Label>
              {Object.entries(form.scores).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{scoreLabels[key]} ({(weights[key as keyof typeof weights] * 100).toFixed(0)}%)</span>
                    <span className="font-mono font-medium">{val.toFixed(1)}</span>
                  </div>
                  <Slider min={0} max={5} step={0.1} value={[val]} onValueChange={([v]) => setForm({ ...form, scores: { ...form.scores, [key]: v } })} />
                </div>
              ))}
              <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-border">
                <span>Score total</span>
                <span className="font-mono">{calcScore(form.scores).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => { setDialogOpen(false); setEditingProject(null); }} className="px-4 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {editingProject ? "Guardar cambios" : "Crear Proyecto"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará toda la información del proyecto.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
