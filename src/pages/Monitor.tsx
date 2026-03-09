import { useState, useMemo } from "react";
import {
  Activity, CheckCircle, XCircle, Clock, Plus, Search, Eye, Pencil, Trash2,
  Globe, Server, Cpu, Zap, Wifi, AlertTriangle,
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
  MonitorResource, RESOURCE_TYPES, STATUS_CONFIG,
  formatLatency, timeAgo, ResourceType, emptyResource,
} from "@/lib/monitor-data";
import { useMonitor } from "@/hooks/useMonitor";

type ResourceFormData = ReturnType<typeof emptyResource>;
import { ResourceFormDialog } from "@/components/monitor/ResourceFormDialog";
import { ResourceDetail } from "@/components/monitor/ResourceDetail";

const TYPE_ICONS: Record<string, typeof Globe> = {
  Aplicación: Cpu,
  Servicio: Zap,
  Web: Globe,
  Servidor: Server,
};

type SortKey = "name" | "type" | "status" | "latency" | "uptime";

export default function Monitor() {
  const { resources, isLoading, create: createResource, update: updateResource, remove: removeResource } = useMonitor();
  const [formOpen, setFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<MonitorResource | null>(null);
  const [detailResource, setDetailResource] = useState<MonitorResource | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  // ── Dashboard counts ──
  const countByType = (type: ResourceType) => {
    const all = resources.filter(r => r.type === type);
    const active = all.filter(r => r.status !== "offline");
    return { total: all.length, active: active.length };
  };
  const apps = countByType("Aplicación");
  const services = countByType("Servicio");
  const webs = countByType("Web");
  const servers = countByType("Servidor");

  const offlineCount = resources.filter(r => r.status === "offline").length;
  const degradedCount = resources.filter(r => r.status === "degraded").length;

  // ── Filter & sort ──
  const filtered = useMemo(() => {
    let list = [...resources];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.url.toLowerCase().includes(q));
    }
    if (filterType !== "all") list = list.filter(r => r.type === filterType);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "type": cmp = a.type.localeCompare(b.type); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "latency": cmp = a.latency - b.latency; break;
        case "uptime": cmp = a.uptime - b.uptime; break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [resources, search, filterType, sortKey, sortAsc]);

  // ── CRUD ──
  const handleSave = (data: ResourceFormData) => {
    if (editingResource) {
      updateResource.mutate({ id: editingResource.id, data });
    } else {
      createResource.mutate(data);
    }
    setEditingResource(null);
  };

  const handleDelete = (id: string) => removeResource.mutate(id);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando monitor...</div>;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortableHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(k)}>
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </TableHead>
  );

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "online") return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === "degraded") return <Clock className="h-4 w-4 text-warning" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" /> Monitor
        </h1>
        <Button onClick={() => { setEditingResource(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Agregar Recurso
        </Button>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="grid">Monitoreo</TabsTrigger>
          <TabsTrigger value="table">Tabla</TabsTrigger>
        </TabsList>

        {/* ════════════ Dashboard ════════════ */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Aplicaciones"
              value={`${apps.active} / ${apps.total}`}
              subtitle={apps.active === apps.total ? "Todas activas" : `${apps.total - apps.active} inactiva(s)`}
              icon={Cpu}
              variant={apps.active === apps.total ? "success" : "default"}
            />
            <StatCard
              title="Servicios"
              value={`${services.active} / ${services.total}`}
              subtitle={services.active === services.total ? "Todos activos" : `${services.total - services.active} inactivo(s)`}
              icon={Zap}
              variant={services.active === services.total ? "success" : "default"}
            />
            <StatCard
              title="Páginas Web"
              value={`${webs.active} / ${webs.total}`}
              subtitle={webs.active === webs.total ? "Todas online" : `${webs.total - webs.active} offline`}
              icon={Globe}
              variant={webs.active === webs.total ? "success" : "default"}
            />
            <StatCard
              title="Servidores"
              value={`${servers.active} / ${servers.total}`}
              subtitle={servers.active === servers.total ? "Todos activos" : `${servers.total - servers.active} inactivo(s)`}
              icon={Server}
              variant={servers.active === servers.total ? "success" : "default"}
            />
          </div>

          {/* Alerts */}
          {(offlineCount > 0 || degradedCount > 0) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 border-l-4 border-destructive">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h3 className="text-sm font-semibold">Alertas Activas</h3>
              </div>
              <div className="space-y-1">
                {resources.filter(r => r.status === "offline").map(r => (
                  <p key={r.id} className="text-xs text-destructive flex items-center gap-2">
                    <XCircle className="h-3 w-3" /> <span className="font-medium">{r.name}</span> — Offline · {timeAgo(r.lastCheck)}
                  </p>
                ))}
                {resources.filter(r => r.status === "degraded").map(r => (
                  <p key={r.id} className="text-xs text-warning flex items-center gap-2">
                    <Clock className="h-3 w-3" /> <span className="font-medium">{r.name}</span> — Degradado · {formatLatency(r.latency)}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick overview grid */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Estado General</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {resources.map(r => {
                const c = STATUS_CONFIG[r.status];
                const TIcon = TYPE_ICONS[r.type] || Globe;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`glass-card rounded-xl p-3 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all`}
                    onClick={() => setDetailResource(r)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <TIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <StatusIcon status={r.status} />
                    </div>
                    <p className="text-xs font-semibold truncate">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{formatLatency(r.latency)}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ════════════ Grid View ════════════ */}
        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r, i) => {
              const cfg = STATUS_CONFIG[r.status];
              const TIcon = TYPE_ICONS[r.type] || Globe;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card rounded-xl p-5 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
                  onClick={() => setDetailResource(r)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${cfg.bg}`}>
                        <TIcon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{r.name}</h3>
                        <Badge variant="outline" className="text-[9px] mt-0.5">{r.type}</Badge>
                      </div>
                    </div>
                    <StatusIcon status={r.status} />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-3">{r.url}{r.port ? `:${r.port}` : ""}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Estado</p>
                      <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Latencia</p>
                      <p className="text-xs font-mono font-semibold">{formatLatency(r.latency)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Uptime</p>
                      <p className="text-xs font-mono font-semibold">{r.uptime}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
                    <Wifi className="h-3 w-3" /> {timeAgo(r.lastCheck)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ════════════ Table View ════════════ */}
        <TabsContent value="table" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar recurso..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {RESOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Nombre" k="name" />
                  <SortableHead label="Tipo" k="type" />
                  <SortableHead label="Estado" k="status" />
                  <SortableHead label="Latencia" k="latency" />
                  <TableHead>Última Rev.</TableHead>
                  <SortableHead label="Uptime" k="uptime" />
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No se encontraron recursos</TableCell></TableRow>
                )}
                {filtered.map(r => {
                  const cfg = STATUS_CONFIG[r.status];
                  return (
                    <TableRow key={r.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={r.status} />
                          <span className="text-sm font-medium">{r.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{r.type}</Badge></TableCell>
                      <TableCell><span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span></TableCell>
                      <TableCell className="text-xs font-mono">{formatLatency(r.latency)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{timeAgo(r.lastCheck)}</TableCell>
                      <TableCell className="text-xs font-mono">{r.uptime}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailResource(r)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingResource(r); setFormOpen(true); }}>
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
                                <AlertDialogTitle>¿Eliminar recurso?</AlertDialogTitle>
                                <AlertDialogDescription>Se dejará de monitorear "{r.name}".</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(r.id)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ResourceFormDialog
        open={formOpen}
        onOpenChange={o => { setFormOpen(o); if (!o) setEditingResource(null); }}
        resource={editingResource}
        onSave={handleSave}
      />

      {detailResource && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetailResource(null)} />
          <ResourceDetail resource={detailResource} onClose={() => setDetailResource(null)} />
        </>
      )}
    </motion.div>
  );
}
