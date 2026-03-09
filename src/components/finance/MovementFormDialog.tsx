import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Movement, FinanceCategory, PaymentMethod,
  MOVEMENT_TYPES, MOVEMENT_STATUSES, emptyMovement, MovementType,
} from "@/lib/finance-data";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  movement: Movement | null;
  categories: FinanceCategory[];
  paymentMethods: PaymentMethod[];
  onSave: (data: Omit<Movement, "id" | "createdAt">) => void;
}

export function MovementFormDialog({ open, onOpenChange, movement, categories, paymentMethods, onSave }: Props) {
  const [form, setForm] = useState<Omit<Movement, "id" | "createdAt">>(emptyMovement());

  useEffect(() => {
    if (movement) {
      const { id, createdAt, ...rest } = movement;
      setForm(rest);
    } else {
      setForm(emptyMovement());
    }
  }, [movement, open]);

  const set = (k: string, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  const filteredCategories = categories.filter(c => c.type === form.type);

  const handleSave = () => {
    if (!form.description || !form.amount || !form.categoryId) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{movement ? "Editar Movimiento" : "Registrar Movimiento"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="relation">Relación</TabsTrigger>
            <TabsTrigger value="detail">Detalle</TabsTrigger>
          </TabsList>

          {/* ── Tab: Básico ── */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de movimiento *</Label>
                <Select value={form.type} onValueChange={v => { set("type", v as MovementType); set("categoryId", ""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto *</Label>
                <Input type="number" min={0} placeholder="0" value={form.amount || ""} onChange={e => set("amount", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={form.categoryId} onValueChange={v => set("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Método de pago</Label>
                <Select value={form.paymentMethodId} onValueChange={v => set("paymentMethodId", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Relación ── */}
          <TabsContent value="relation" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Cliente (opcional)</Label>
              <Input placeholder="Nombre del cliente" value={form.client} onChange={e => set("client", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Proveedor (opcional)</Label>
              <Input placeholder="Nombre del proveedor" value={form.provider} onChange={e => set("provider", e.target.value)} />
            </div>
          </TabsContent>

          {/* ── Tab: Detalle ── */}
          <TabsContent value="detail" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Textarea rows={3} placeholder="Detalle del movimiento..." value={form.description} onChange={e => set("description", e.target.value)} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.description || !form.amount || !form.categoryId}>
            {movement ? "Guardar Cambios" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
