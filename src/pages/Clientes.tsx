import { useState, useMemo } from "react";
import {
  Users, Plus, Search, Eye, Pencil, Trash2,
  ArrowUpDown, Filter, X, Phone, Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Client, Interaction, ClientStatus } from "@/lib/clients-data";
import {
  SECTORS, CLIENT_STATUSES, STATUS_STYLES,
  formatCurrency, formatDate,
} from "@/lib/clients-data";
import ClientFormDialog from "@/components/clients/ClientFormDialog";
import ClientDetail from "@/components/clients/ClientDetail";
import { useClients } from "@/hooks/useClients";

type SortKey = "name" | "sector" | "city" | "status" | "responsible" | "createdAt";
type SortDir = "asc" | "desc";

export default function Clientes() {
  const { clients, isLoading, create, update, remove, addInteraction } = useClients();
  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cities = useMemo(() => [...new Set(clients.map((c) => c.city).filter(Boolean))].sort(), [clients]);

  const filtered = useMemo(() => {
    let result = clients.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q);
      const matchSector = filterSector === "all" || c.sector === filterSector;
      const matchCity = filterCity === "all" || c.city === filterCity;
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchSearch && matchSector && matchCity && matchStatus;
    });

    result.sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [clients, search, filterSector, filterCity, filterStatus, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleCreate = (data: Omit<Client, "id" | "createdAt" | "interactions">) => {
    create.mutate(data);
    setFormOpen(false);
  };

  const handleUpdate = (data: Omit<Client, "id" | "createdAt" | "interactions">) => {
    if (!editingClient) return;
    update.mutate({ id: editingClient.id, data });
    setEditingClient(null);
    setViewingClient(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    remove.mutate(deleteId);
    if (viewingClient?.id === deleteId) setViewingClient(null);
    setDeleteId(null);
  };

  const handleAddInteraction = (clientId: string, interaction: Omit<Interaction, "id">) => {
    addInteraction.mutate({ clientId, interaction });
  };

  const activeFilters = [filterSector, filterCity, filterStatus].filter((f) => f !== "all").length;

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      onClick={() => toggleSort(field)}
      className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4 cursor-pointer hover:text-foreground transition-colors select-none"
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortKey === field ? "text-primary" : "opacity-30"}`} />
      </span>
    </th>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando clientes...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Clientes
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {filtered.length} de {clients.length} clientes
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="bg-transparent border-none outline-none text-xs w-44 placeholder:text-muted-foreground text-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${
              showFilters || activeFilters > 0
                ? "border-primary text-primary bg-primary/5"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filtros
            {activeFilters > 0 && (
              <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {activeFilters}
              </span>
            )}
          </button>
          <button
            onClick={() => { setEditingClient(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-xl p-4 flex flex-wrap gap-3 items-end">
              <div className="space-y-1 min-w-[150px]">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Sector</label>
                <Select value={filterSector} onValueChange={setFilterSector}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 min-w-[150px]">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Ciudad</label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 min-w-[150px]">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {CLIENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {activeFilters > 0 && (
                <button
                  onClick={() => { setFilterSector("all"); setFilterCity("all"); setFilterStatus("all"); }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 pb-0.5"
                >
                  <X className="h-3 w-3" /> Limpiar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <SortHeader label="Cliente" field="name" />
                <SortHeader label="Sector" field="sector" />
                <SortHeader label="Ciudad" field="city" />
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Contacto</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Teléfono</th>
                <SortHeader label="Estado" field="status" />
                <SortHeader label="Creado" field="createdAt" />
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setViewingClient(c)}
                    className="border-b border-border/20 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <p className="font-medium truncate max-w-[180px] text-foreground">{c.name}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground/80 font-medium">
                        {c.sector}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-foreground/80">{c.city}</td>
                    <td className="p-4">
                      <p className="text-xs text-foreground/90">{c.contactPerson}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-2.5 w-2.5" /> {c.email}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs flex items-center gap-1 text-foreground/80">
                        <Phone className="h-3 w-3 text-muted-foreground" /> {c.phone}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-foreground/60">{formatDate(c.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setViewingClient(c)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => { setEditingClient(c); setFormOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingClient(null); }}
        onSave={editingClient ? handleUpdate : handleCreate}
        initial={editingClient}
      />

      <AnimatePresence>
        {viewingClient && (
          <ClientDetail
            client={viewingClient}
            onClose={() => setViewingClient(null)}
            onEdit={() => { setEditingClient(viewingClient); setFormOpen(true); }}
            onDelete={() => { setDeleteId(viewingClient.id); setViewingClient(null); }}
            onAddInteraction={handleAddInteraction}
          />
        )}
      </AnimatePresence>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará toda la información del cliente y su historial de interacciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
