import { useState, useMemo } from "react";
import {
  Headphones, Plus, Search, Eye, Pencil, Trash2,
  AlertCircle, Clock, CheckCircle, XCircle, Inbox,
} from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Ticket, TicketStatus, TicketMessage, TicketActivity,
  TICKET_STATUSES, TICKET_PRIORITIES, AGENTS,
  STATUS_STYLES, PRIORITY_STYLES,
  formatTicketDate, formatTicketDateTime, timeAgoTicket, emptyTicket,
} from "@/lib/helpdesk-data";
import { TicketFormDialog } from "@/components/helpdesk/TicketFormDialog";
import { TicketDetail } from "@/components/helpdesk/TicketDetail";
import { useTickets } from "@/hooks/useTickets";

type SortKey = "ticketId" | "priority" | "status" | "createdAt" | "updatedAt";
const PRIORITY_ORDER: Record<string, number> = { Crítica: 4, Alta: 3, Media: 2, Baja: 1 };

export default function Helpdesk() {
  const { tickets, isLoading, create: createTicket, update: updateTicket, remove: removeTicket, changeStatus, changeAgent, addMessage } = useTickets();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);

  // ── Dashboard metrics ──
  const counts = {
    open: tickets.filter(t => t.status === "Abierto").length,
    inProgress: tickets.filter(t => t.status === "En proceso").length,
    pending: tickets.filter(t => t.status === "Pendiente").length,
    resolved: tickets.filter(t => t.status === "Resuelto" || t.status === "Cerrado").length,
  };

  const today = new Date().toISOString().split("T")[0];
  const createdToday = tickets.filter(t => t.createdAt.startsWith(today)).length;

  // ── Filtered & sorted ──
  const filtered = useMemo(() => {
    let list = [...tickets];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) || t.ticketId.toLowerCase().includes(q) ||
        t.client.toLowerCase().includes(q) || t.requester.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") list = list.filter(t => t.status === filterStatus);
    if (filterPriority !== "all") list = list.filter(t => t.priority === filterPriority);
    if (filterAgent !== "all") list = list.filter(t => t.agent === filterAgent);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "ticketId": cmp = a.ticketId.localeCompare(b.ticketId); break;
        case "priority": cmp = (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "createdAt": cmp = a.createdAt.localeCompare(b.createdAt); break;
        case "updatedAt": cmp = a.updatedAt.localeCompare(b.updatedAt); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [tickets, search, filterStatus, filterPriority, filterAgent, sortKey, sortAsc]);

  // ── CRUD ──
  const handleSave = (data: ReturnType<typeof emptyTicket>) => {
    if (editingTicket) {
      updateTicket.mutate({ id: editingTicket.id, data });
    } else {
      createTicket.mutate(data);
    }
    setEditingTicket(null);
  };

  const handleDelete = (id: string) => removeTicket.mutate(id);

  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    changeStatus.mutate({ id: ticketId, status });
    if (detailTicket?.id === ticketId) setDetailTicket(null);
  };

  const handleAgentChange = (ticketId: string, agent: string) => {
    changeAgent.mutate({ id: ticketId, agent });
    if (detailTicket?.id === ticketId) setDetailTicket(null);
  };

  const handleAddMessage = (ticketId: string, message: string) => {
    addMessage.mutate({ ticketId, message });
    if (detailTicket?.id === ticketId) setDetailTicket(null);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando tickets...</div>;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortableHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(k)}>
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </TableHead>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Headphones className="h-6 w-6 text-primary" /> Helpdesk
        </h1>
        <Button onClick={() => { setEditingTicket(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Ticket
        </Button>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        {/* ════════════ Dashboard ════════════ */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Abiertos" value={counts.open} icon={AlertCircle} variant="default"
              trend={counts.open > 0 ? { value: "Requieren atención", positive: false } : undefined} />
            <StatCard title="En Proceso" value={counts.inProgress} icon={Clock} variant="secondary" />
            <StatCard title="Pendientes" value={counts.pending} icon={Inbox} variant="primary" />
            <StatCard title="Resueltos" value={counts.resolved} icon={CheckCircle} variant="success" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tickets creados hoy</p>
              <p className="text-3xl font-bold mt-1">{createdToday}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tiempo promedio de respuesta</p>
              <p className="text-3xl font-bold mt-1 font-mono">~15 min</p>
            </motion.div>
          </div>

          {/* Urgent tickets */}
          {tickets.filter(t => (t.priority === "Crítica" || t.priority === "Alta") && t.status !== "Resuelto" && t.status !== "Cerrado").length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 border-l-4 border-destructive">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" /> Tickets Urgentes
              </h3>
              <div className="space-y-2">
                {tickets
                  .filter(t => (t.priority === "Crítica" || t.priority === "Alta") && t.status !== "Resuelto" && t.status !== "Cerrado")
                  .map(t => (
                    <div key={t.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => setDetailTicket(t)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-primary font-bold shrink-0">{t.ticketId}</span>
                        <span className="text-sm truncate">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-[10px] ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</Badge>
                        <Badge className={`text-[10px] ${STATUS_STYLES[t.status]}`}>{t.status}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* ════════════ Tickets Table ════════════ */}
        <TabsContent value="tickets" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar ticket..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {TICKET_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Prioridad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {TICKET_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Agente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {AGENTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="ID" k="ticketId" />
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <SortableHead label="Prioridad" k="priority" />
                  <SortableHead label="Estado" k="status" />
                  <TableHead>Agente</TableHead>
                  <SortableHead label="Creado" k="createdAt" />
                  <SortableHead label="Actualizado" k="updatedAt" />
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No se encontraron tickets</TableCell></TableRow>
                )}
                {filtered.map(t => (
                  <TableRow key={t.id} className="group cursor-pointer" onClick={() => setDetailTicket(t)}>
                    <TableCell className="font-mono text-xs text-primary font-bold">{t.ticketId}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate font-medium">{t.title}</TableCell>
                    <TableCell className="text-xs">{t.client || "—"}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</Badge></TableCell>
                    <TableCell><Badge className={`text-[10px] ${STATUS_STYLES[t.status]}`}>{t.status}</Badge></TableCell>
                    <TableCell className="text-xs">{t.agent}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatTicketDate(t.createdAt)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{timeAgoTicket(t.updatedAt)}</TableCell>
                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailTicket(t)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingTicket(t); setFormOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar ticket {t.ticketId}?</AlertDialogTitle>
                              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(t.id)}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TicketFormDialog
        open={formOpen}
        onOpenChange={o => { setFormOpen(o); if (!o) setEditingTicket(null); }}
        ticket={editingTicket}
        onSave={handleSave}
      />

      {detailTicket && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetailTicket(null)} />
          <TicketDetail
            ticket={detailTicket}
            onClose={() => setDetailTicket(null)}
            onStatusChange={handleStatusChange}
            onAgentChange={handleAgentChange}
            onAddMessage={handleAddMessage}
          />
        </>
      )}
    </motion.div>
  );
}
