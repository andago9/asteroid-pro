import { useState, useMemo } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Search,
  ArrowUpRight, ArrowDownRight, Eye, Pencil, Trash2, Settings2,
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Movement, FinanceCategory, PaymentMethod,
  formatFinanceCurrency, formatFinanceDate,
} from "@/lib/finance-data";
import { MovementFormDialog } from "@/components/finance/MovementFormDialog";
import { MovementDetail } from "@/components/finance/MovementDetail";
import { CategoryManager } from "@/components/finance/CategoryManager";
import { PaymentMethodManager } from "@/components/finance/PaymentMethodManager";
import { useFinance } from "@/hooks/useFinance";

const PIE_COLORS = [
  "hsl(207, 72%, 50%)", "hsl(43, 91%, 58%)", "hsl(142, 71%, 45%)",
  "hsl(0, 72%, 51%)", "hsl(262, 52%, 47%)", "hsl(180, 60%, 40%)",
  "hsl(330, 65%, 50%)", "hsl(25, 85%, 55%)",
];

type SortKey = "date" | "amount" | "type" | "category" | "status";

export default function Finanzas() {
  const { movements, categories, paymentMethods, isLoading, createMovement, updateMovement, deleteMovement } = useFinance();

  const [formOpen, setFormOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [detailMovement, setDetailMovement] = useState<Movement | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  // ── Helpers ──
  const catName = (id: string) => categories.find(c => c.id === id)?.name || "—";
  const pmName = (id: string) => paymentMethods.find(p => p.id === id)?.name || "—";

  // ── Dashboard metrics ──
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthMovements = movements.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalIncome = thisMonthMovements.filter(m => m.type === "Ingreso").reduce((s, m) => s + m.amount, 0);
  const totalExpense = thisMonthMovements.filter(m => m.type === "Gasto").reduce((s, m) => s + m.amount, 0);
  const balance = totalIncome - totalExpense;
  const accumulated = movements.reduce((s, m) => s + (m.type === "Ingreso" ? m.amount : -m.amount), 0);

  // ── Chart data ──
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; ingresos: number; gastos: number }> = {};
    movements.forEach(m => {
      const d = new Date(m.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const label = d.toLocaleString("es", { month: "short" }).replace(".", "");
      if (!months[key]) months[key] = { month: label.charAt(0).toUpperCase() + label.slice(1), ingresos: 0, gastos: 0 };
      if (m.type === "Ingreso") months[key].ingresos += m.amount;
      else months[key].gastos += m.amount;
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }, [movements]);

  const expenseByCat = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthMovements.filter(m => m.type === "Gasto").forEach(m => {
      const name = catName(m.categoryId);
      map[name] = (map[name] || 0) + m.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [movements, categories]);

  const incomeByCat = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthMovements.filter(m => m.type === "Ingreso").forEach(m => {
      const name = catName(m.categoryId);
      map[name] = (map[name] || 0) + m.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [movements, categories]);

  // ── Filtered & sorted movements ──
  const filtered = useMemo(() => {
    let list = [...movements];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.description.toLowerCase().includes(q) ||
        m.client.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
      );
    }
    if (filterType !== "all") list = list.filter(m => m.type === filterType);
    if (filterCategory !== "all") list = list.filter(m => m.categoryId === filterCategory);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date": cmp = a.date.localeCompare(b.date); break;
        case "amount": cmp = a.amount - b.amount; break;
        case "type": cmp = a.type.localeCompare(b.type); break;
        case "category": cmp = catName(a.categoryId).localeCompare(catName(b.categoryId)); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [movements, search, filterType, filterCategory, sortKey, sortAsc, categories]);

  // ── CRUD handlers ──
  const handleSave = (data: Omit<Movement, "id" | "createdAt">) => {
    if (editingMovement) {
      updateMovement.mutate({ id: editingMovement.id, data });
    } else {
      createMovement.mutate(data);
    }
    setEditingMovement(null);
  };

  const handleDelete = (id: string) => deleteMovement.mutate(id);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando finanzas...</div>;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortableHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(k)}>
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </TableHead>
  );

  // ── Render ──
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" /> Finanzas
        </h1>
        <Button onClick={() => { setEditingMovement(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Registrar Movimiento
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="config">
            <Settings2 className="h-4 w-4 mr-1" /> Configuración
          </TabsTrigger>
        </TabsList>

        {/* ════════════ Dashboard ════════════ */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Ingresos del Mes" value={formatFinanceCurrency(totalIncome)} icon={TrendingUp} variant="success" />
            <StatCard title="Gastos del Mes" value={formatFinanceCurrency(totalExpense)} icon={TrendingDown} variant="default" />
            <StatCard title="Balance del Mes" value={formatFinanceCurrency(balance)} icon={DollarSign} variant="primary"
              trend={{ value: balance >= 0 ? "Positivo" : "Negativo", positive: balance >= 0 }} />
            <StatCard title="Balance Acumulado" value={formatFinanceCurrency(accumulated)} icon={DollarSign} variant="secondary" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bar chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Ingresos vs Gastos</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="ingresos" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie: gastos por categoría */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Gastos por Categoría</h3>
              {expenseByCat.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={expenseByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                      {expenseByCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatFinanceCurrency(v)} contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-10">Sin gastos este mes</p>
              )}
            </motion.div>
          </div>

          {/* Pie: ingresos por categoría */}
          {incomeByCat.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 max-w-md">
              <h3 className="text-sm font-semibold mb-4">Ingresos por Categoría</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={incomeByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                    {incomeByCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatFinanceCurrency(v)} contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </TabsContent>

        {/* ════════════ Movimientos ════════════ */}
        <TabsContent value="movements" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar movimiento..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Ingreso">Ingreso</SelectItem>
                <SelectItem value="Gasto">Gasto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Fecha" k="date" />
                  <SortableHead label="Tipo" k="type" />
                  <SortableHead label="Categoría" k="category" />
                  <TableHead>Descripción</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Cliente / Proveedor</TableHead>
                  <SortableHead label="Monto" k="amount" />
                  <SortableHead label="Estado" k="status" />
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No se encontraron movimientos</TableCell></TableRow>
                )}
                {filtered.map(m => (
                  <TableRow key={m.id} className="group">
                    <TableCell className="text-xs font-mono">{formatFinanceDate(m.date)}</TableCell>
                    <TableCell>
                      <Badge variant={m.type === "Ingreso" ? "default" : "secondary"} className="text-[10px]">
                        {m.type === "Ingreso" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {m.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{catName(m.categoryId)}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{m.description}</TableCell>
                    <TableCell className="text-xs">{pmName(m.paymentMethodId)}</TableCell>
                    <TableCell className="text-xs">{m.client || m.provider || "—"}</TableCell>
                    <TableCell className={`text-xs font-mono font-bold ${m.type === "Ingreso" ? "text-success" : "text-destructive"}`}>
                      {m.type === "Ingreso" ? "+" : "-"}{formatFinanceCurrency(m.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.status === "Confirmado" ? "default" : "outline"} className="text-[10px]">{m.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailMovement(m)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingMovement(m); setFormOpen(true); }}>
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
                              <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
                              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(m.id)}>Eliminar</AlertDialogAction>
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

        {/* ════════════ Configuración ════════════ */}
        <TabsContent value="config" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-5">
              <CategoryManager categories={categories} onChange={setCategories} />
            </div>
            <div className="glass-card rounded-xl p-5">
              <PaymentMethodManager methods={paymentMethods} onChange={setPaymentMethods} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <MovementFormDialog
        open={formOpen}
        onOpenChange={o => { setFormOpen(o); if (!o) setEditingMovement(null); }}
        movement={editingMovement}
        categories={categories}
        paymentMethods={paymentMethods}
        onSave={handleSave}
      />

      {detailMovement && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetailMovement(null)} />
          <MovementDetail
            movement={detailMovement}
            onClose={() => setDetailMovement(null)}
            categories={categories}
            paymentMethods={paymentMethods}
          />
        </>
      )}
    </motion.div>
  );
}
