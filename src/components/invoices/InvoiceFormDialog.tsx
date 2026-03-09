import { useState, useEffect } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Invoice, InvoiceItem, INVOICE_STATUSES, AVAILABLE_PRODUCTS,
  emptyInvoice, emptyInvoiceItem, calcItemSubtotal, calcInvoiceTotals, formatInvCurrency,
  InvoiceStatus,
} from "@/lib/invoice-data";

type FormData = ReturnType<typeof emptyInvoice>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  invoice: Invoice | null;
  onSave: (data: FormData) => void;
}

export function InvoiceFormDialog({ open, onOpenChange, invoice, onSave }: Props) {
  const [form, setForm] = useState<FormData>(emptyInvoice());

  useEffect(() => {
    if (invoice) {
      setForm({
        client: invoice.client, issueDate: invoice.issueDate, dueDate: invoice.dueDate,
        status: invoice.status, items: invoice.items.map(i => ({ ...i })),
        discount: invoice.discount, notes: invoice.notes,
      });
    } else {
      setForm(emptyInvoice());
    }
  }, [invoice, open]);

  const set = (k: string, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  const updateItem = (idx: number, field: string, value: string | number) => {
    setForm(prev => {
      const items = [...prev.items];
      const item = { ...items[idx], [field]: value };
      if (field === "productName") {
        const p = AVAILABLE_PRODUCTS.find(p => p.name === value);
        if (p) item.unitPrice = p.price;
      }
      item.subtotal = calcItemSubtotal(item.quantity, item.unitPrice, item.taxRate);
      items[idx] = item;
      return { ...prev, items };
    });
  };

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, emptyInvoiceItem()] }));
  const removeItem = (idx: number) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const totals = calcInvoiceTotals(form.items, form.discount);

  const handleSave = () => {
    if (!form.client || form.items.length === 0) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Editar Factura" : "Nueva Factura"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* General */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label>Cliente *</Label>
              <Input value={form.client} onChange={e => set("client", e.target.value)} placeholder="Nombre del cliente" />
            </div>
            <div className="space-y-2">
              <Label>Fecha emisión</Label>
              <Input type="date" value={form.issueDate} onChange={e => set("issueDate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha vencimiento</Label>
              <Input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
            </div>
          </div>

          {invoice && (
            <div className="space-y-2 max-w-[200px]">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Products */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Productos / Servicios</Label>
              <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3.5 w-3.5 mr-1" /> Agregar</Button>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Producto</TableHead>
                    <TableHead className="w-[10%]">Cant.</TableHead>
                    <TableHead className="w-[18%]">Precio Unit.</TableHead>
                    <TableHead className="w-[12%]">IVA %</TableHead>
                    <TableHead className="w-[20%] text-right">Subtotal</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.items.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="p-1.5">
                        <Select value={item.productName} onValueChange={v => updateItem(idx, "productName", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_PRODUCTS.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Input type="number" min={1} className="h-8 text-xs" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} />
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Input type="number" min={0} className="h-8 text-xs" value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", Number(e.target.value))} />
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Input type="number" min={0} max={100} className="h-8 text-xs" value={item.taxRate} onChange={e => updateItem(idx, "taxRate", Number(e.target.value))} />
                      </TableCell>
                      <TableCell className="p-1.5 text-right text-xs font-mono font-bold">
                        {formatInvCurrency(item.subtotal)}
                      </TableCell>
                      <TableCell className="p-1.5">
                        {form.items.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(idx)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals + Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-2 max-w-[150px]">
                <Label>Descuento gral. (%)</Label>
                <Input type="number" min={0} max={100} value={form.discount} onChange={e => set("discount", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Observaciones..." />
              </div>
            </div>
            <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatInvCurrency(totals.subtotal)}</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Descuento ({form.discount}%)</span>
                  <span className="font-mono">-{formatInvCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos</span>
                <span className="font-mono">{formatInvCurrency(totals.taxTotal)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total</span>
                <span className="font-mono text-primary">{formatInvCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.client || form.items.every(i => !i.productName)}>
            {invoice ? "Guardar Cambios" : "Crear Factura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
