import { useState } from "react";
import {
  X, User, Building2, Globe, MapPin, Phone, Mail, MessageSquare,
  Briefcase, DollarSign, Tag, StickyNote, Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Client } from "@/lib/clients-data";
import {
  SECTORS, CLIENT_STATUSES, CLIENT_SOURCES, CONTACT_CHANNELS, DOC_TYPES, emptyClient,
} from "@/lib/clients-data";
import { useSystemUsers } from "@/hooks/useSystemUsers";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Client, "id" | "createdAt" | "interactions">) => void;
  initial?: Client | null;
}

type Tab = "basic" | "contact" | "commercial" | "extra";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "basic", label: "General", icon: <Building2 className="h-3.5 w-3.5" /> },
  { key: "contact", label: "Contacto", icon: <User className="h-3.5 w-3.5" /> },
  { key: "commercial", label: "Comercial", icon: <Briefcase className="h-3.5 w-3.5" /> },
  { key: "extra", label: "Adicional", icon: <StickyNote className="h-3.5 w-3.5" /> },
];

export default function ClientFormDialog({ open, onClose, onSave, initial }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [form, setForm] = useState(() => initial ? { ...initial } : emptyClient());
  const [tagInput, setTagInput] = useState("");
  const { users } = useSystemUsers();

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().slice(0, 30);
    if (t && !(form.tags ?? []).includes(t)) {
      set("tags", [...(form.tags ?? []), t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    set("tags", (form.tags ?? []).filter((t) => t !== tag));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form as Omit<Client, "id" | "createdAt" | "interactions">);
    setForm(emptyClient());
    setActiveTab("basic");
  };

  const isEdit = !!initial;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-t-lg transition-colors ${
                activeTab === t.key
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {activeTab === "basic" && (
                <>
                  <FieldRow>
                    <Field label="Nombre / Razón social" required>
                      <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre de la empresa" />
                    </Field>
                  </FieldRow>
                  <FieldRow cols={2}>
                    <Field label="Tipo de documento">
                      <Select value={form.docType} onValueChange={(v) => set("docType", v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{DOC_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Número de documento">
                      <Input value={form.docNumber} onChange={(e) => set("docNumber", e.target.value)} placeholder="Ej: 900123456-7" />
                    </Field>
                  </FieldRow>
                  <FieldRow cols={2}>
                    <Field label="Sector / Industria">
                      <Select value={form.sector} onValueChange={(v) => set("sector", v)}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Página web" icon={<Globe className="h-3.5 w-3.5" />}>
                      <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
                    </Field>
                  </FieldRow>
                  <Field label="Dirección" icon={<MapPin className="h-3.5 w-3.5" />}>
                    <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Dirección completa" />
                  </Field>
                  <FieldRow cols={3}>
                    <Field label="Ciudad">
                      <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
                    </Field>
                    <Field label="Depto / Estado">
                      <Input value={form.state} onChange={(e) => set("state", e.target.value)} />
                    </Field>
                    <Field label="País">
                      <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
                    </Field>
                  </FieldRow>
                </>
              )}

              {activeTab === "contact" && (
                <>
                  <FieldRow cols={2}>
                    <Field label="Persona de contacto" icon={<User className="h-3.5 w-3.5" />}>
                      <Input value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
                    </Field>
                    <Field label="Cargo">
                      <Input value={form.contactRole} onChange={(e) => set("contactRole", e.target.value)} />
                    </Field>
                  </FieldRow>
                  <FieldRow cols={2}>
                    <Field label="Teléfono" icon={<Phone className="h-3.5 w-3.5" />}>
                      <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+52 555 1234" />
                    </Field>
                    <Field label="Correo electrónico" icon={<Mail className="h-3.5 w-3.5" />}>
                      <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </Field>
                  </FieldRow>
                  <Field label="Canal preferido" icon={<MessageSquare className="h-3.5 w-3.5" />}>
                    <Select value={form.preferredChannel} onValueChange={(v) => set("preferredChannel", v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CONTACT_CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </>
              )}

              {activeTab === "commercial" && (
                <>
                  <FieldRow cols={2}>
                    <Field label="Estado del cliente">
                      <Select value={form.status} onValueChange={(v) => set("status", v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CLIENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Fuente">
                      <Select value={form.source} onValueChange={(v) => set("source", v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CLIENT_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                  </FieldRow>
                  <FieldRow cols={2}>
                    <Field label="Responsable comercial">
                      <Select
                        value={form.responsible || "__none__"}
                        onValueChange={(v) => set("responsible", v === "__none__" ? "" : v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Seleccionar responsable" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sin asignar</SelectItem>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.full_name}>
                              {u.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Valor potencial" icon={<DollarSign className="h-3.5 w-3.5" />}>
                      <Input
                        type="number"
                        value={form.potentialValue || ""}
                        onChange={(e) => set("potentialValue", Number(e.target.value))}
                        placeholder="0"
                      />
                    </Field>
                  </FieldRow>
                </>
              )}

              {activeTab === "extra" && (
                <>
                  <Field label="Notas u observaciones">
                    <Textarea
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder="Escribe observaciones sobre el cliente..."
                      rows={4}
                    />
                  </Field>
                  <Field label="Etiquetas" icon={<Tag className="h-3.5 w-3.5" />}>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          placeholder="Agregar etiqueta y presionar Enter"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="text-xs px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                          Agregar
                        </button>
                      </div>
                      {(form.tags ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(form.tags ?? []).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {tag}
                              <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="px-6 pb-6 pt-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            {isEdit ? "Guardar cambios" : "Crear Cliente"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ────────────────────────────────────────────
function Field({ label, children, icon, required }: {
  label: string; children: React.ReactNode; icon?: React.ReactNode; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1 text-xs">
        {icon}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function FieldRow({ children, cols = 1 }: { children: React.ReactNode; cols?: number }) {
  const gridClass = cols === 3 ? "grid grid-cols-1 sm:grid-cols-3 gap-3" :
                    cols === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "";
  return gridClass ? <div className={gridClass}>{children}</div> : <>{children}</>;
}
