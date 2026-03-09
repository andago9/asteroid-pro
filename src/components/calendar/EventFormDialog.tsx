import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarEvent, emptyEvent, EVENT_TYPES, EVENT_PRIORITIES, RESPONSIBLES, EventType, EventPriority } from "@/lib/calendar-data";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  event: CalendarEvent | null;
  onSave: (data: Omit<CalendarEvent, "id">) => void;
  defaultStart?: string;
}

export default function EventFormDialog({ open, onOpenChange, event, onSave, defaultStart }: Props) {
  const [form, setForm] = useState<Omit<CalendarEvent, "id">>(emptyEvent());

  useEffect(() => {
    if (event) {
      const { id, ...rest } = event;
      setForm(rest);
    } else {
      const e = emptyEvent();
      if (defaultStart) {
        e.start = defaultStart;
        const end = new Date(defaultStart);
        end.setHours(end.getHours() + 1);
        e.end = end.toISOString().slice(0, 16);
      }
      setForm(e);
    }
  }, [event, open, defaultStart]);

  const set = <K extends keyof Omit<CalendarEvent, "id">>(k: K, v: Omit<CalendarEvent, "id">[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("El título es obligatorio"); return; }
    if (!form.start || !form.end) { toast.error("Las fechas son obligatorias"); return; }
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div>
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Título del evento" />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Inicio *</Label>
              <Input type="datetime-local" value={form.start.slice(0, 16)} onChange={e => set("start", e.target.value)} />
            </div>
            <div>
              <Label>Fin *</Label>
              <Input type="datetime-local" value={form.end.slice(0, 16)} onChange={e => set("end", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => set("type", v as EventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridad</Label>
              <Select value={form.priority} onValueChange={v => set("priority", v as EventPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Responsable</Label>
            <Select value={form.responsible} onValueChange={v => set("responsible", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESPONSIBLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cliente</Label>
              <Input value={form.clientName ?? ""} onChange={e => set("clientName", e.target.value)} placeholder="Opcional" />
            </div>
            <div>
              <Label>Proyecto</Label>
              <Input value={form.projectName ?? ""} onChange={e => set("projectName", e.target.value)} placeholder="Opcional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ticket</Label>
              <Input value={form.ticketId ?? ""} onChange={e => set("ticketId", e.target.value)} placeholder="Ej: TK-1042" />
            </div>
            <div>
              <Label>Tarea</Label>
              <Input value={form.taskName ?? ""} onChange={e => set("taskName", e.target.value)} placeholder="Opcional" />
            </div>
          </div>

          <div>
            <Label>Recordatorio</Label>
            <Select value={form.reminder ?? "none"} onValueChange={v => set("reminder", v === "none" ? undefined : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin recordatorio</SelectItem>
                <SelectItem value="5min">5 minutos antes</SelectItem>
                <SelectItem value="15min">15 minutos antes</SelectItem>
                <SelectItem value="30min">30 minutos antes</SelectItem>
                <SelectItem value="1h">1 hora antes</SelectItem>
                <SelectItem value="1d">1 día antes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>{event ? "Guardar" : "Crear Evento"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
