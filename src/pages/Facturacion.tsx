import { useState, useMemo } from "react";
import {
  Receipt, Plus, Search, Eye, Pencil, Trash2, DollarSign, CreditCard,
  AlertTriangle, CheckCircle, Clock, FileText,
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
  Invoice, InvoiceStatus, InvoicePayment, PaymentMethodType,
  INVOICE_STATUSES, INV_STATUS_STYLES,
  calcInvoiceTotals, calcTotalPaid, calcBalance,
  formatInvCurrency, formatInvDate, emptyInvoice,
} from "@/lib/invoice-data";
import { InvoiceFormDialog } from "@/components/invoices/InvoiceFormDialog";
import { InvoiceDetail } from "@/components/invoices/InvoiceDetail";
import { PaymentDialog } from "@/components/invoices/PaymentDialog";
import { useInvoices } from "@/hooks/useInvoices";
import { CxCTab } from "@/components/facturacion/CxCTab";

type SortKey = "invoiceNumber" | "client" | "issueDate" | "dueDate" | "total" | "status";

export default function Facturacion() {
  const { invoices, isLoading, create, update, remove, addPayment } = useInvoices();
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("issueDate");
  const [sortAsc, setSortAsc] = useState(false);

  // ── Metrics ──
  const totalInvoiced = invoices.reduce((s, inv) => s + calcInvoiceTotals(inv.items, inv.discount).total, 0);
  const totalPaid = invoices.reduce((s, inv) => s + calcTotalPaid(inv.payments), 0);
  const totalPending = totalInvoiced - totalPaid;
  const overdueCount = invoices.filter(i => i.status === "Vencida").length;
  const paidCount = invoices.filter(i => i.status === "Pagada").length;

  const uniqueClients = [...new Set(invoices.map(i => i.client).filter(Boolean))];

  // ── Filter & sort ──
  const filtered = useMemo(() => {
    let list = [...invoices];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.invoiceNumber.toLowerCase().includes(q) || i.client.toLowerCase().includes(q));
    }
    if (filterStatus !== "all") list = list.filter(i => i.status === filterStatus);
    if (filterClient !== "all") list = list.filter(i => i.client === filterClient);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "invoiceNumber": cmp = a.invoiceNumber.localeCompare(b.invoiceNumber); break;
        case "client": cmp = a.client.localeCompare(b.client); break;
        case "issueDate": cmp = a.issueDate.localeCompare(b.issueDate); break;
        case "dueDate": cmp = a.dueDate.localeCompare(b.dueDate); break;
        case "total": cmp = calcInvoiceTotals(a.items, a.discount).total - calcInvoiceTotals(b.items, b.discount).total; break;
        case "status": cmp = a.status.localeCompare(b.status); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [invoices, search, filterStatus, filterClient, sortKey, sortAsc]);

  // ── CRUD ──
  const handleSave = (data: ReturnType<typeof emptyInvoice>) => {
    if (editingInvoice) {
      update.mutate({ id: editingInvoice.id, data });
    } else {
      create.mutate(data);
    }
    setEditingInvoice(null);
  };

  const handleDelete = (id: string) => remove.mutate(id);

  const handlePayment = (data: { date: string; amount: number; method: PaymentMethodType; reference: string }) => {
    if (!paymentInvoiceId) return;
    addPayment.mutate({ invoiceId: paymentInvoiceId, payment: data });
    setDetailInvoice(null);
    toast.success("Pago registrado.");
    setPaymentInvoiceId(null);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando facturas...</div>;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortableHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(k)}>
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </TableHead>
  );

  const paymentInvoice = invoices.find(i => i.id === paymentInvoiceId);
  const paymentBalance = paymentInvoice ? calcBalance(paymentInvoice) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" /> Facturación
        </h1>
        <Button onClick={() => { setEditingInvoice(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Factura
        </Button>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="cxc">CxC</TabsTrigger>
        </TabsList>

        {/* ════════════ Dashboard ════════════ */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Facturado" value={formatInvCurrency(totalInvoiced)} icon={FileText} variant="default" />
            <StatCard title="Cobrado" value={formatInvCurrency(totalPaid)} icon={CheckCircle} variant="success"
              subtitle={`${paidCount} factura(s) pagadas`} />
            <StatCard title="Por Cobrar" value={formatInvCurrency(totalPending)} icon={Clock} variant="secondary"
              trend={totalPending > 0 ? { value: "Pendiente", positive: false } : undefined} />
            <StatCard title="Vencidas" value={overdueCount} icon={AlertTriangle} variant={overdueCount > 0 ? "default" : "success"}
              subtitle={overdueCount > 0 ? "Requieren seguimiento" : "Sin vencimientos"} />
          </div>

          {overdueCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 border-l-4 border-destructive">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" /> Facturas Vencidas
              </h3>
              <div className="space-y-2">
                {invoices.filter(i => i.status === "Vencida").map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => setDetailInvoice(inv)}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-primary font-bold">{inv.invoiceNumber}</span>
                      <span className="text-sm">{inv.client}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold">{formatInvCurrency(calcBalance(inv))}</span>
                      <span className="text-[10px] text-destructive">Vence: {formatInvDate(inv.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Facturas Recientes</h3>
            <div className="space-y-2">
              {invoices.slice(0, 5).map(inv => {
                const total = calcInvoiceTotals(inv.items, inv.discount).total;
                return (
                  <div key={inv.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => setDetailInvoice(inv)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-primary font-bold shrink-0">{inv.invoiceNumber}</span>
                      <span className="text-sm truncate">{inv.client}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-mono font-bold">{formatInvCurrency(total)}</span>
                      <Badge className={`text-[10px] ${INV_STATUS_STYLES[inv.status]}`}>{inv.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ════════════ Table ════════════ */}
        <TabsContent value="invoices" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar factura..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {INVOICE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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

          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Nº" k="invoiceNumber" />
                  <SortableHead label="Cliente" k="client" />
                  <SortableHead label="Emisión" k="issueDate" />
                  <SortableHead label="Vencimiento" k="dueDate" />
                  <SortableHead label="Total" k="total" />
                  <SortableHead label="Estado" k="status" />
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No se encontraron facturas</TableCell></TableRow>
                )}
                {filtered.map(inv => {
                  const total = calcInvoiceTotals(inv.items, inv.discount).total;
                  return (
                    <TableRow key={inv.id} className="group cursor-pointer" onClick={() => setDetailInvoice(inv)}>
                      <TableCell className="font-mono text-xs text-primary font-bold">{inv.invoiceNumber}</TableCell>
                      <TableCell className="text-sm font-medium">{inv.client}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatInvDate(inv.issueDate)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatInvDate(inv.dueDate)}</TableCell>
                      <TableCell className="text-sm font-mono font-bold">{formatInvCurrency(total)}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${INV_STATUS_STYLES[inv.status]}`}>{inv.status}</Badge></TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailInvoice(inv)} title="Ver">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingInvoice(inv); setFormOpen(true); }} title="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {(inv.status === "Pendiente" || inv.status === "Parcial" || inv.status === "Vencida") && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:text-success" onClick={() => setPaymentInvoiceId(inv.id)} title="Registrar pago">
                              <CreditCard className="h-3.5 w-3.5" />
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
                                <AlertDialogTitle>¿Eliminar {inv.invoiceNumber}?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(inv.id)}>Eliminar</AlertDialogAction>
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

        {/* ════════════ CxC ════════════ */}
        <TabsContent value="cxc" className="mt-4">
          <CxCTab />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <InvoiceFormDialog
        open={formOpen}
        onOpenChange={o => { setFormOpen(o); if (!o) setEditingInvoice(null); }}
        invoice={editingInvoice}
        onSave={handleSave}
      />

      {paymentInvoiceId && (
        <PaymentDialog
          open={!!paymentInvoiceId}
          onOpenChange={o => { if (!o) setPaymentInvoiceId(null); }}
          balance={paymentBalance}
          onSave={handlePayment}
        />
      )}

      {detailInvoice && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetailInvoice(null)} />
          <InvoiceDetail
            invoice={detailInvoice}
            onClose={() => setDetailInvoice(null)}
            onRegisterPayment={(id) => { setPaymentInvoiceId(id); }}
          />
        </>
      )}
    </motion.div>
  );
}
