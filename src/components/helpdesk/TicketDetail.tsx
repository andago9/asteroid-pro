import { useState } from "react";
import { X, Send, Clock, User, MessageSquare, Activity as ActivityIcon, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Ticket, TicketMessage, TicketStatus,
  STATUS_STYLES, PRIORITY_STYLES, TICKET_STATUSES, AGENTS,
  formatTicketDateTime, timeAgoTicket,
} from "@/lib/helpdesk-data";

interface Props {
  ticket: Ticket | null;
  onClose: () => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
  onAgentChange: (ticketId: string, agent: string) => void;
  onAddMessage: (ticketId: string, message: string) => void;
}

export function TicketDetail({ ticket, onClose, onStatusChange, onAgentChange, onAddMessage }: Props) {
  const [reply, setReply] = useState("");

  if (!ticket) return null;

  const handleSendReply = () => {
    if (!reply.trim()) return;
    onAddMessage(ticket.id, reply.trim());
    setReply("");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[560px] bg-background border-l border-border z-50 overflow-y-auto shadow-2xl"
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-primary font-bold">{ticket.ticketId}</span>
                <Badge className={`text-[10px] ${PRIORITY_STYLES[ticket.priority]}`}>{ticket.priority}</Badge>
                <Badge className={`text-[10px] ${STATUS_STYLES[ticket.status]}`}>{ticket.status}</Badge>
              </div>
              <h2 className="text-lg font-bold leading-tight">{ticket.title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Estado:</span>
              <Select value={ticket.status} onValueChange={v => onStatusChange(ticket.id, v as TicketStatus)}>
                <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Agente:</span>
              <Select value={ticket.agent} onValueChange={v => onAgentChange(ticket.id, v)}>
                <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AGENTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Cliente</p>
              <p className="font-medium">{ticket.client || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Solicitante</p>
              <p className="font-medium">{ticket.requester || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tipo</p>
              <p className="font-medium">{ticket.type}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Departamento</p>
              <p className="font-medium">{ticket.department}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Creado</p>
              <p className="font-medium text-xs">{formatTicketDateTime(ticket.createdAt)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Actualizado</p>
              <p className="font-medium text-xs">{timeAgoTicket(ticket.updatedAt)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Descripción
            </h4>
            <p className="text-sm bg-muted/30 rounded-lg p-3 leading-relaxed">{ticket.description}</p>
          </div>

          {/* Tabs: Conversation / Activity */}
          <Tabs defaultValue="conversation">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="conversation" className="text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Conversación ({ticket.messages.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">
                <ActivityIcon className="h-3.5 w-3.5 mr-1" /> Actividad ({ticket.activity.length})
              </TabsTrigger>
            </TabsList>

            {/* Conversation */}
            <TabsContent value="conversation" className="mt-3 space-y-3">
              {ticket.messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "agent" ? "flex-row-reverse" : ""}`}>
                  <div className={`p-0.5 rounded-full h-7 w-7 flex items-center justify-center shrink-0 ${
                    msg.role === "agent" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className={`flex-1 max-w-[85%] ${msg.role === "agent" ? "text-right" : ""}`}>
                    <div className="flex items-center gap-2 mb-1" style={{ justifyContent: msg.role === "agent" ? "flex-end" : "flex-start" }}>
                      <span className="text-xs font-semibold">{msg.author}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTicketDateTime(msg.date)}</span>
                    </div>
                    <div className={`text-sm rounded-xl p-3 leading-relaxed ${
                      msg.role === "agent"
                        ? "bg-primary/10 text-foreground rounded-tr-sm"
                        : "bg-muted/40 rounded-tl-sm"
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}

              {/* Reply */}
              {ticket.status !== "Cerrado" && (
                <div className="flex gap-2 pt-2 border-t border-border/30">
                  <Textarea
                    rows={2}
                    className="text-sm"
                    placeholder="Escribe una respuesta..."
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                  />
                  <Button size="icon" className="shrink-0 self-end" onClick={handleSendReply} disabled={!reply.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Activity */}
            <TabsContent value="activity" className="mt-3">
              <div className="space-y-0">
                {ticket.activity.map((act, i) => (
                  <div key={act.id} className="flex items-start gap-3 py-2 relative">
                    {i < ticket.activity.length - 1 && (
                      <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border/40" />
                    )}
                    <div className="p-1 rounded-full bg-muted shrink-0 z-10">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs">{act.action}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {act.user} · {formatTicketDateTime(act.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
