import { useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAccountsReceivable, type AccountReceivable, type CxCFrequency, type CxCStatus } from "@/hooks/useAccountsReceivable";
import { useClients } from "@/hooks/useClients";
import { formatInvCurrency, formatInvDate } from "@/lib/invoice-data";

const FREQUENCIES: CxCFrequency[] = ["Pago único", "Mensual", "Anual"];
const STATUSES: CxCStatus[] = ["Pendiente", "Pagado", "Vencido"];

const STATUS_STYLES: Record<CxCStatus, string> = {
  Pendiente: "bg-warning/10 text-warning",
  Pagado: "bg-success/10 text-success",
  Vencido: "bg-destructive/10 text-destructive",
};

type FormData = {
  clientName: string;
  productService: string;
  concept: string;
  amount: number;
  frequency: CxCFrequency;
  startDate: string;
  dueDate: string;
  status: CxCStatus;
  notes: string;
};

const emptyForm = (): FormData => ({
  clientName: "", productService: "", concept: "", amount: 0,
  frequency: "Pago único", startDate: new Date().toISOString().split("T")[0],
  dueDate: "", status: "Pendiente", notes: "",
});

export function CxCTab() {
  const { records, isLoading, create, update, remove } = useAccountsReceivable();
  const { clients } = useClients();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AccountReceivable | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());

  const openCreate = () => {
    setEditingRecord(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (r: AccountReceivable) => {
    setEditingRecord(r);
    setForm({
      clientName: r.clientName,
      productService: r.productService,
      concept: r.concept,
      amount: r.amount,
      frequency: r.frequency,
      startDate: r.startDate,
      dueDate: r.dueDate,
      status: r.status,
      notes: r.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.clientName.trim() || !form.concept.trim()) {
      toast.error("Cliente y concepto son obligatorios");
      return;
    }
    if (editingRecord) {
      update.mutate({ id: editingRecord.id, data: form });
      toast.success("Registro actualizado");
    } else {
      create.mutate(form);
      toast.success("Registro creado");
    }
    setForm(emptyForm());
    setDialogOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    remove.mutate(deleteId);
    setDeleteId(null);
    toast.success("Registro eliminado");
  };

  const totalPending = records.filter(r => r.status === "Pendiente").reduce((s, r) => s + r.amount, 0);
  const totalOverdue = records.filter(r => r.status === "Vencido").reduce((s, r) => s + r.amount, 0);

  if (isLoading) return <div className="flex items-center justify-center h-32 text-muted-foreground">Cargando CxC...</div>;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-4">
        <div className="glass-card rounded-xl p-4 flex-1 min-w-[200px]">
          <p className="text-xs text-muted-foreground">Total Pendiente</p>
          <p className="text-xl font-bold text-warning">{formatInvCurrency(totalPending)}</p>
          <p className="text-[10px] text-muted-foreground">{records.filter(r => r.status === "Pendiente").length} registros</p>
        </div>
        <div className="glass-card rounded-xl p-4 flex-1 min-w-[200px]">
          <p className="text-xs text-muted-foreground">Total Vencido</p>
          <p className="text-xl font-bold text-destructive">{formatInvCurrency(totalOverdue)}</p>
          <p className="text-[10px] text-muted-foreground">{records.filter(r => r.status === "Vencido").length} registros</p>
        </div>
        <div className="flex items-end">
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nuevo registro CxC</Button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Producto / Servicio</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Frecuencia</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No hay registros de CxC</TableCell></TableRow>
            )}
            {records.map((r) => (
              <TableRow key={r.id} className="group cursor-pointer" onClick={() => openEdit(r)}>
                <TableCell className="font-medium text-sm">{r.clientName}</TableCell>
                <TableCell className="text-xs">{r.productService}</TableCell>
                <TableCell className="text-xs">{r.concept}</TableCell>
                <TableCell className="font-mono font-bold text-sm">{formatInvCurrency(r.amount)}</TableCell>
                <TableCell className="text-xs">{r.frequency}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.dueDate ? formatInvDate(r.dueDate) : "—"}</TableCell>
                <TableCell><Badge className={`text-[10px] ${STATUS_STYLES[r.status]}`}>{r.status}</Badge></TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) { setDialogOpen(false); setEditingRecord(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Editar CxC" : "Nuevo registro CxC"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.clientName || "__none__"} onValueChange={(v) => setForm({ ...form, clientName: v === "__none__" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Seleccionar...</SelectItem>
                  {clients.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Producto / Servicio</Label>
                <Input value={form.productService} onChange={(e) => setForm({ ...form, productService: e.target.value })} placeholder="Ej: Hosting" />
              </div>
              <div className="space-y-1.5">
                <Label>Concepto *</Label>
                <Input value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} placeholder="Ej: Mensualidad hosting" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor</Label>
                <Input type="number" min={0} value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Frecuencia</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as CxCFrequency })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha inicio</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha vencimiento</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as CxCStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Observaciones</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas adicionales..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setEditingRecord(null); }}>Cancelar</Button>
            <Button onClick={handleSave}>{editingRecord ? "Guardar cambios" : "Crear registro"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
