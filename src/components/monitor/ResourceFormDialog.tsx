import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MonitorResource, RESOURCE_TYPES, MONITOR_FREQUENCIES, ResourceType, MonitorFrequency, emptyResource,
} from "@/lib/monitor-data";

type FormData = ReturnType<typeof emptyResource>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  resource: MonitorResource | null;
  onSave: (data: FormData) => void;
}

export function ResourceFormDialog({ open, onOpenChange, resource, onSave }: Props) {
  const [form, setForm] = useState<FormData>(emptyResource());

  useEffect(() => {
    if (resource) {
      setForm({
        name: resource.name, type: resource.type, url: resource.url,
        port: resource.port, frequency: resource.frequency, description: resource.description,
      });
    } else {
      setForm(emptyResource());
    }
  }, [resource, open]);

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.url) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{resource ? "Editar Recurso" : "Nuevo Recurso"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="API Principal" />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>URL / Dirección IP *</Label>
              <Input value={form.url} onChange={e => set("url", e.target.value)} placeholder="api.example.com" />
            </div>
            <div className="space-y-2">
              <Label>Puerto</Label>
              <Input value={form.port} onChange={e => set("port", e.target.value)} placeholder="443" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frecuencia de monitoreo</Label>
            <Select value={form.frequency} onValueChange={v => set("frequency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONITOR_FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descripción del recurso..." />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.name || !form.url}>
            {resource ? "Guardar Cambios" : "Agregar Recurso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
