import { useState } from "react";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useProducts, Product } from "@/hooks/useProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Productos() {
  const { products, isLoading, create, update, remove } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", type: "Servicio", description: "", price: 0, status: "Activo" });

  const openNew = () => { setEditing(null); setForm({ name: "", type: "Servicio", description: "", price: 0, status: "Activo" }); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, type: p.type, description: p.description, price: p.price, status: p.status }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      update.mutate({ id: editing.id, data: form });
    } else {
      create.mutate(form);
    }
    setDialogOpen(false);
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(p);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando productos...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" /> Productos & Servicios
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{products.length} registros</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Nuevo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-5 hover:glow-primary transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{p.type}</span>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status === "Activo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                  {p.status}
                </span>
                <button onClick={() => openEdit(p)} className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-3 w-3 text-muted-foreground" /></button>
                <button onClick={() => remove.mutate(p.id)} className="p-1 rounded hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button>
              </div>
            </div>
            <h3 className="text-sm font-semibold mb-1">{p.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
            <p className="text-base font-bold font-mono text-primary">{formatPrice(p.price)}</p>
          </motion.div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nombre</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Producto">Producto</SelectItem><SelectItem value="Servicio">Servicio</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Descripción</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Precio</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div><Label>Estado</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Activo">Activo</SelectItem><SelectItem value="Pausado">Pausado</SelectItem><SelectItem value="Descontinuado">Descontinuado</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
