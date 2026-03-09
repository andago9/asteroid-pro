import { CalendarEvent, EVENT_TYPE_DOTS, PRIORITY_STYLES, formatEventDate, formatEventTime } from "@/lib/calendar-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock, User, Briefcase, Tag, AlertCircle, Ticket, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (ev: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export default function EventDetail({ event, onClose, onEdit, onDelete }: Props) {
  if (!event) return null;

  const meta = [
    { icon: Clock, label: "Inicio", value: `${formatEventDate(event.start)} ${formatEventTime(event.start)}` },
    { icon: Clock, label: "Fin", value: `${formatEventDate(event.end)} ${formatEventTime(event.end)}` },
    { icon: User, label: "Responsable", value: event.responsible },
    event.clientName ? { icon: Briefcase, label: "Cliente", value: event.clientName } : null,
    event.projectName ? { icon: Tag, label: "Proyecto", value: event.projectName } : null,
    event.ticketId ? { icon: Ticket, label: "Ticket", value: event.ticketId } : null,
    event.taskName ? { icon: ListTodo, label: "Tarea", value: event.taskName } : null,
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 border-l border-border bg-card shadow-2xl overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${EVENT_TYPE_DOTS[event.type]}`} />
                <Badge variant="outline" className="capitalize text-xs">{event.type}</Badge>
                <span className={`text-xs font-medium capitalize ${PRIORITY_STYLES[event.priority]}`}>
                  <AlertCircle className="inline h-3 w-3 mr-0.5" />
                  {event.priority}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{event.title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>

          {/* Description */}
          {event.description && (
            <div className="glass-card rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            {meta.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Icon className="h-3 w-3" />{label}
                </div>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Reminder */}
          {event.reminder && (
            <div className="glass-card rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Recordatorio: <span className="text-foreground font-medium">{event.reminder}</span></p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={() => onEdit(event)}>Editar</Button>
            <Button variant="destructive" className="flex-1" onClick={() => { onDelete(event.id); onClose(); }}>
              Eliminar
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
