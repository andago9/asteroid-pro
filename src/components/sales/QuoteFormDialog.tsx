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
  Quote, QuoteItem, QUOTE_STATUSES, SELLERS, AVAILABLE_PRODUCTS,
  emptyQuote, emptyQuoteItem, calcItemSubtotal, calcQuoteTotals, formatSalesCurrency,
  QuoteStatus,
} from "@/lib/sales-data";

type FormData = ReturnType<typeof emptyQuote>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  quote: Quote | null;
  onSave: (data: FormData) => void;
}

export function QuoteFormDialog({ open, onOpenChange, quote, onSave }: Props) {
  const [form, setForm] = useState<FormData>(emptyQuote());

  useEffect(() => {
    if (quote) {
      setForm({
        client: quote.client, quoteDate: quote.quoteDate, expiryDate: quote.expiryDate,
        status: quote.status, seller: quote.seller,
        items: quote.items.map(i => ({ ...i })),
        taxRate: quote.taxRate, generalDiscount: quote.generalDiscount, notes: quote.notes,
      });
    } else {
      setForm(emptyQuote());
    }
  }, [quote, open]);

  const set = (k: string, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  // ── Item management ──
  const updateItem = (idx: number, field: string, value: string | number) => {
    setForm(prev => {
      const items = [...prev.items];
      const item = { ...items[idx], [field]: value };
      // Auto-fill price from product catalog
      if (field === "productName") {
        const product = AVAILABLE_PRODUCTS.find(p => p.name === value);
        if (product) item.unitPrice = product.price;
      }
      item.subtotal = calcItemSubtotal(item.quantity, item.unitPrice, item.discount);
      items[idx] = item;
      return { ...prev, items };
    });
  };

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, emptyQuoteItem()] }));
  const removeItem = (idx: number) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const totals = calcQuoteTotals(form.items, form.taxRate, form.generalDiscount);

  const handleSave = () => {
    if (!form.client || form.items.length === 0) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quote ? "Editar Cotización" : "Nueva Cotización"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* General info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Cliente *</Label>
              <Input value={form.client} onChange={e => set("client", e.target.value)} placeholder="Nombre del cliente" />
            </div>
            <div className="space-y-2">
              <Label>Fecha cotización</Label>
              <Input type="date" value={form.quoteDate} onChange={e => set("quoteDate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha vencimiento</Label>
              <Input type="date" value={form.expiryDate} onChange={e => set("expiryDate", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendedor</Label>
              <Select value={form.seller} onValueChange={v => set("seller", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SELLERS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {quote && (
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {QUOTE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Products table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Productos / Servicios</Label>
              <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3.5 w-3.5 mr-1" /> Agregar</Button>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Producto</TableHead>
                    <TableHead className="w-[12%]">Cant.</TableHead>
                    <TableHead className="w-[18%]">Precio Unit.</TableHead>
                    <TableHead className="w-[12%]">Desc. %</TableHead>
                    <TableHead className="w-[18%] text-right">Subtotal</TableHead>
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
                        <Input type="number" min={0} max={100} className="h-8 text-xs" value={item.discount} onChange={e => updateItem(idx, "discount", Number(e.target.value))} />
                      </TableCell>
                      <TableCell className="p-1.5 text-right text-xs font-mono font-bold">
                        {formatSalesCurrency(item.subtotal)}
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

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Impuestos (%)</Label>
                  <Input type="number" min={0} max={100} value={form.taxRate} onChange={e => set("taxRate", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Descuento gral. (%)</Label>
                  <Input type="number" min={0} max={100} value={form.generalDiscount} onChange={e => set("generalDiscount", Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Comentarios..." />
              </div>
            </div>
            <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatSalesCurrency(totals.subtotal)}</span>
              </div>
              {form.generalDiscount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Descuento ({form.generalDiscount}%)</span>
                  <span className="font-mono">-{formatSalesCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos ({form.taxRate}%)</span>
                <span className="font-mono">{formatSalesCurrency(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total</span>
                <span className="font-mono text-primary">{formatSalesCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.client || form.items.every(i => !i.productName)}>
            {quote ? "Guardar Cambios" : "Crear Cotización"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
