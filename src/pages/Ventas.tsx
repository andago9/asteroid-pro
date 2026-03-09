import { useState, useMemo } from "react";
import {
  ShoppingCart, Plus, Search, Eye, Pencil, Trash2, Copy, DollarSign,
  TrendingUp, FileText, CheckCircle, XCircle, Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Quote, QuoteStatus, QUOTE_STATUSES, SELLERS,
  STATUS_STYLES, calcQuoteTotals,
  formatSalesCurrency, formatSalesDate, emptyQuote, emptyQuoteItem,
} from "@/lib/sales-data";
import { QuoteFormDialog } from "@/components/sales/QuoteFormDialog";
import { QuoteDetail } from "@/components/sales/QuoteDetail";
import { useQuotes } from "@/hooks/useQuotes";

type SortKey = "quoteNumber" | "client" | "quoteDate" | "total" | "status";

export default function Ventas() {
  const { quotes, isLoading, create, update, remove, convert } = useQuotes();
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("quoteDate");
  const [sortAsc, setSortAsc] = useState(false);

  // ── Dashboard metrics ──
  const totalQuotes = quotes.length;
  const approved = quotes.filter(q => q.status === "Aprobada").length;
  const converted = quotes.filter(q => q.status === "Convertida").length;
  const pending = quotes.filter(q => q.status === "Borrador" || q.status === "Enviada").length;

  const totalValue = quotes.reduce((s, q) => s + calcQuoteTotals(q.items, q.taxRate, q.generalDiscount).total, 0);
  const convertedValue = quotes
    .filter(q => q.status === "Convertida")
    .reduce((s, q) => s + calcQuoteTotals(q.items, q.taxRate, q.generalDiscount).total, 0);

  const uniqueClients = [...new Set(quotes.map(q => q.client).filter(Boolean))];

  // ── Filter & sort ──
  const filtered = useMemo(() => {
    let list = [...quotes];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(qt =>
        qt.quoteNumber.toLowerCase().includes(q) ||
        qt.client.toLowerCase().includes(q) ||
        qt.seller.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") list = list.filter(q => q.status === filterStatus);
    if (filterClient !== "all") list = list.filter(q => q.client === filterClient);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "quoteNumber": cmp = a.quoteNumber.localeCompare(b.quoteNumber); break;
        case "client": cmp = a.client.localeCompare(b.client); break;
        case "quoteDate": cmp = a.quoteDate.localeCompare(b.quoteDate); break;
        case "total": {
          const ta = calcQuoteTotals(a.items, a.taxRate, a.generalDiscount).total;
          const tb = calcQuoteTotals(b.items, b.taxRate, b.generalDiscount).total;
          cmp = ta - tb;
          break;
        }
        case "status": cmp = a.status.localeCompare(b.status); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [quotes, search, filterStatus, filterClient, sortKey, sortAsc]);

  // ── CRUD ──
  const handleSave = (data: ReturnType<typeof emptyQuote>) => {
    const now = new Date().toISOString();
    if (editingQuote) {
      setQuotes(prev => prev.map(q => q.id === editingQuote.id ? {
        ...q, ...data, updatedAt: now,
        activity: [...q.activity, { id: `qa-${Date.now()}`, date: now, user: data.seller, action: "Cotización editada" }],
      } : q));
    } else {
      const newQuote: Quote = {
        ...data,
        id: `q-${Date.now()}`,
        quoteNumber: nextQuoteNumber(),
        activity: [{ id: `qa-${Date.now()}`, date: now, user: data.seller, action: "Cotización creada" }],
        createdAt: now,
        updatedAt: now,
      };
      setQuotes(prev => [newQuote, ...prev]);
    }
    setEditingQuote(null);
  };

  const handleDelete = (id: string) => setQuotes(prev => prev.filter(q => q.id !== id));

  const handleDuplicate = (quote: Quote) => {
    const now = new Date().toISOString();
    const dup: Quote = {
      ...quote,
      id: `q-${Date.now()}`,
      quoteNumber: nextQuoteNumber(),
      status: "Borrador",
      items: quote.items.map(i => ({ ...i, id: `qi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })),
      activity: [{ id: `qa-${Date.now()}`, date: now, user: quote.seller, action: `Cotización duplicada desde ${quote.quoteNumber}` }],
      createdAt: now,
      updatedAt: now,
    };
    setQuotes(prev => [dup, ...prev]);
    toast.success(`Cotización duplicada como ${dup.quoteNumber}`);
  };

  const handleConvert = (quoteId: string) => {
    const now = new Date().toISOString();
    setQuotes(prev => prev.map(q => q.id === quoteId ? {
      ...q, status: "Convertida" as QuoteStatus, updatedAt: now,
      activity: [...q.activity, { id: `qa-${Date.now()}`, date: now, user: q.seller, action: "Convertida en venta — Ingreso registrado en Finanzas" }],
    } : q));
    setDetailQuote(prev => {
      if (prev?.id === quoteId) {
        return { ...prev, status: "Convertida" as QuoteStatus, updatedAt: now, activity: [...prev.activity, { id: `qa-${Date.now()}`, date: now, user: prev.seller, action: "Convertida en venta — Ingreso registrado en Finanzas" }] };
      }
      return prev;
    });
    toast.success("Cotización convertida en venta. Ingreso registrado en Finanzas.");
  };

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
          <ShoppingCart className="h-6 w-6 text-primary" /> Ventas & Cotizaciones
        </h1>
        <Button onClick={() => { setEditingQuote(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Cotización
        </Button>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="quotes">Cotizaciones</TabsTrigger>
        </TabsList>

        {/* ════════════ Dashboard ════════════ */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Cotizaciones" value={totalQuotes} icon={FileText} variant="default" />
            <StatCard title="Pendientes" value={pending} icon={Clock} variant="secondary"
              subtitle="Borrador o enviadas" />
            <StatCard title="Aprobadas" value={approved} icon={CheckCircle} variant="success" />
            <StatCard title="Valor Convertido" value={formatSalesCurrency(convertedValue)} icon={DollarSign} variant="primary"
              trend={{ value: `${converted} venta(s)`, positive: true }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor Total Pipeline</p>
              <p className="text-3xl font-bold mt-1 font-mono">{formatSalesCurrency(totalValue)}</p>
              <p className="text-xs text-muted-foreground mt-1">{totalQuotes} cotizaciones en total</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tasa de Conversión</p>
              <p className="text-3xl font-bold mt-1 font-mono">
                {totalQuotes > 0 ? Math.round((converted / totalQuotes) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">{converted} de {totalQuotes} convertidas</p>
            </motion.div>
          </div>

          {/* Recent quotes */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Cotizaciones Recientes</h3>
            <div className="space-y-2">
              {quotes.slice(0, 5).map(q => {
                const total = calcQuoteTotals(q.items, q.taxRate, q.generalDiscount).total;
                return (
                  <div key={q.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => setDetailQuote(q)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-primary font-bold shrink-0">{q.quoteNumber}</span>
                      <span className="text-sm truncate">{q.client}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-mono font-bold">{formatSalesCurrency(total)}</span>
                      <Badge className={`text-[10px] ${STATUS_STYLES[q.status]}`}>{q.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ════════════ Cotizaciones Table ════════════ */}
        <TabsContent value="quotes" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar cotización..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {QUOTE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {uniqueClients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Nº" k="quoteNumber" />
                  <SortableHead label="Cliente" k="client" />
                  <SortableHead label="Fecha" k="quoteDate" />
                  <SortableHead label="Total" k="total" />
                  <SortableHead label="Estado" k="status" />
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No se encontraron cotizaciones</TableCell></TableRow>
                )}
                {filtered.map(q => {
                  const total = calcQuoteTotals(q.items, q.taxRate, q.generalDiscount).total;
                  return (
                    <TableRow key={q.id} className="group cursor-pointer" onClick={() => setDetailQuote(q)}>
                      <TableCell className="font-mono text-xs text-primary font-bold">{q.quoteNumber}</TableCell>
                      <TableCell className="text-sm font-medium">{q.client}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatSalesDate(q.quoteDate)}</TableCell>
                      <TableCell className="text-sm font-mono font-bold">{formatSalesCurrency(total)}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${STATUS_STYLES[q.status]}`}>{q.status}</Badge></TableCell>
                      <TableCell className="text-xs">{q.seller}</TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailQuote(q)} title="Ver">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingQuote(q); setFormOpen(true); }} title="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(q)} title="Duplicar">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          {q.status === "Aprobada" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:text-success" onClick={() => handleConvert(q.id)} title="Convertir en venta">
                              <DollarSign className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar {q.quoteNumber}?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(q.id)}>Eliminar</AlertDialogAction>
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
      <QuoteFormDialog
        open={formOpen}
        onOpenChange={o => { setFormOpen(o); if (!o) setEditingQuote(null); }}
        quote={editingQuote}
        onSave={handleSave}
      />

      {detailQuote && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetailQuote(null)} />
          <QuoteDetail quote={detailQuote} onClose={() => setDetailQuote(null)} onConvert={handleConvert} />
        </>
      )}
    </motion.div>
  );
}
