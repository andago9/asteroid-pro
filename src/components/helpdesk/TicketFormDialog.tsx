import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Ticket, TICKET_TYPES, TICKET_PRIORITIES, TICKET_STATUSES, AGENTS, DEPARTMENTS,
  TicketType, TicketPriority, TicketStatus, emptyTicket,
} from "@/lib/helpdesk-data";

type FormData = ReturnType<typeof emptyTicket>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  ticket: Ticket | null;
  onSave: (data: FormData) => void;
}

export function TicketFormDialog({ open, onOpenChange, ticket, onSave }: Props) {
  const [form, setForm] = useState<FormData>(emptyTicket());

  useEffect(() => {
    if (ticket) {
      setForm({
        title: ticket.title, description: ticket.description, type: ticket.type,
        priority: ticket.priority, status: ticket.status, client: ticket.client,
        requester: ticket.requester, agent: ticket.agent, department: ticket.department,
      });
    } else {
      setForm(emptyTicket());
    }
  }, [ticket, open]);

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.title || !form.description) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket ? "Editar Ticket" : "Nuevo Ticket"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Resumen del problema" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descripción *</Label>
            <Textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe el problema con detalle..." />
          </div>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de solicitud</Label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={form.priority} onValueChange={v => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client + Requester */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input value={form.client} onChange={e => set("client", e.target.value)} placeholder="Nombre del cliente" />
            </div>
            <div className="space-y-2">
              <Label>Usuario solicitante</Label>
              <Input value={form.requester} onChange={e => set("requester", e.target.value)} placeholder="Persona que reporta" />
            </div>
          </div>

          {/* Agent + Department */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Agente responsable</Label>
              <Select value={form.agent} onValueChange={v => set("agent", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AGENTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={form.department} onValueChange={v => set("department", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status (only when editing) */}
          {ticket && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.title || !form.description}>
            {ticket ? "Guardar Cambios" : "Crear Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
