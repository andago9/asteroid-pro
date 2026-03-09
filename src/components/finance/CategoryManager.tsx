import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FinanceCategory, MovementType, MOVEMENT_TYPES } from "@/lib/finance-data";

interface Props {
  categories: FinanceCategory[];
  onChange: (cats: FinanceCategory[]) => void;
}

export function CategoryManager({ categories, onChange }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceCategory | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<MovementType>("Ingreso");

  const openNew = () => { setEditing(null); setName(""); setType("Ingreso"); setDialogOpen(true); };
  const openEdit = (c: FinanceCategory) => { setEditing(c); setName(c.name); setType(c.type); setDialogOpen(true); };

  const save = () => {
    if (!name.trim()) return;
    if (editing) {
      onChange(categories.map(c => c.id === editing.id ? { ...c, name: name.trim(), type } : c));
    } else {
      onChange([...categories, { id: `cat-${Date.now()}`, name: name.trim(), type }]);
    }
    setDialogOpen(false);
  };

  const remove = (id: string) => onChange(categories.filter(c => c.id !== id));

  const ingresos = categories.filter(c => c.type === "Ingreso");
  const gastos = categories.filter(c => c.type === "Gasto");

  const renderList = (title: string, items: FinanceCategory[], variant: "default" | "secondary") => (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
      {items.length === 0 && <p className="text-xs text-muted-foreground">Sin categorías</p>}
      <div className="space-y-1">
        {items.map(c => (
          <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{c.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
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
                    <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                    <AlertDialogDescription>Se eliminará "{c.name}". Los movimientos asociados no se verán afectados.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove(c.id)}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Categorías Financieras</h3>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nueva Categoría</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderList("Ingresos", ingresos, "default")}
        {renderList("Gastos", gastos, "secondary")}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la categoría" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={v => setType(v as MovementType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MOVEMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!name.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
