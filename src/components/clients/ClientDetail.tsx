import { useState } from "react";
import {
  X, ArrowLeft, Building2, User, Briefcase, StickyNote,
  Phone, Mail, Globe, MapPin, MessageSquare, Plus, Calendar,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Client, Interaction, InteractionType } from "@/lib/clients-data";
import {
  STATUS_STYLES, INTERACTION_TYPES, formatCurrency, formatDate,
} from "@/lib/clients-data";

interface Props {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddInteraction: (clientId: string, interaction: Omit<Interaction, "id">) => void;
}

type Section = "general" | "contact" | "commercial" | "notes" | "interactions";

export default function ClientDetail({ client, onClose, onEdit, onDelete, onAddInteraction }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Llamada" as InteractionType,
    note: "",
    nextFollowUp: "",
  });

  const handleAddInteraction = () => {
    if (!newInteraction.note.trim()) return;
    onAddInteraction(client.id, {
      date: newInteraction.date,
      type: newInteraction.type,
      note: newInteraction.note,
      nextFollowUp: newInteraction.nextFollowUp || undefined,
    });
    setNewInteraction({ date: new Date().toISOString().split("T")[0], type: "Llamada", note: "", nextFollowUp: "" });
    setShowInteractionForm(false);
  };

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: "General", icon: <Building2 className="h-3.5 w-3.5" /> },
    { key: "contact", label: "Contacto", icon: <User className="h-3.5 w-3.5" /> },
    { key: "commercial", label: "Comercial", icon: <Briefcase className="h-3.5 w-3.5" /> },
    { key: "notes", label: "Notas", icon: <StickyNote className="h-3.5 w-3.5" /> },
    { key: "interactions", label: "Historial", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  ];

  const interactionIcon: Record<InteractionType, string> = {
    Llamada: "📞", Email: "📧", Reunión: "🤝", WhatsApp: "💬",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div className="relative w-full max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold">{client.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[client.status]}`}>
                  {client.status}
                </span>
                <span className="text-xs text-muted-foreground">{client.sector}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onEdit}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              Editar
            </button>
            <button
              onClick={onDelete}
              className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>

        {/* section tabs */}
        <div className="flex gap-1 px-5 pt-2 border-b border-border overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                activeSection === s.key
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.icon} {s.label}
              {s.key === "interactions" && (
                <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {client.interactions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {activeSection === "general" && (
                <div className="space-y-3">
                  <InfoRow label="Razón social" value={client.name} />
                  <InfoRow label="Tipo documento" value={client.docType} />
                  <InfoRow label="N° documento" value={client.docNumber} />
                  <InfoRow label="Sector" value={client.sector} />
                  <InfoRow label="Dirección" value={client.address} icon={<MapPin className="h-3 w-3" />} />
                  <InfoRow label="Ciudad" value={`${client.city}, ${client.state}`} />
                  <InfoRow label="País" value={client.country} />
                  <InfoRow label="Web" value={client.website} icon={<Globe className="h-3 w-3" />} isLink />
                  <InfoRow label="Creado" value={formatDate(client.createdAt)} icon={<Calendar className="h-3 w-3" />} />
                  {client.tags.length > 0 && (
                    <div className="flex items-start gap-3 py-2">
                      <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1">
                        <Tag className="h-3 w-3" /> Tags
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {client.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "contact" && (
                <div className="space-y-3">
                  <InfoRow label="Persona" value={client.contactPerson} icon={<User className="h-3 w-3" />} />
                  <InfoRow label="Cargo" value={client.contactRole} />
                  <InfoRow label="Teléfono" value={client.phone} icon={<Phone className="h-3 w-3" />} />
                  <InfoRow label="Email" value={client.email} icon={<Mail className="h-3 w-3" />} />
                  <InfoRow label="Canal preferido" value={client.preferredChannel} icon={<MessageSquare className="h-3 w-3" />} />
                </div>
              )}

              {activeSection === "commercial" && (
                <div className="space-y-3">
                  <InfoRow label="Estado" value={client.status} badge={STATUS_STYLES[client.status]} />
                  <InfoRow label="Fuente" value={client.source} />
                  <InfoRow label="Responsable" value={client.responsible} />
                  <InfoRow label="Valor potencial" value={formatCurrency(client.potentialValue)} />
                </div>
              )}

              {activeSection === "notes" && (
                <div className="glass-card rounded-xl p-4">
                  <p className="text-sm whitespace-pre-wrap">{client.notes || "Sin notas registradas."}</p>
                </div>
              )}

              {activeSection === "interactions" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-mono">
                      {client.interactions.length} interacciones
                    </p>
                    <button
                      onClick={() => setShowInteractionForm(!showInteractionForm)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Nueva
                    </button>
                  </div>

                  {showInteractionForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="glass-card rounded-xl p-4 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Fecha</Label>
                          <Input
                            type="date"
                            value={newInteraction.date}
                            onChange={(e) => setNewInteraction({ ...newInteraction, date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Tipo</Label>
                          <Select value={newInteraction.type} onValueChange={(v) => setNewInteraction({ ...newInteraction, type: v as InteractionType })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{INTERACTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nota</Label>
                        <Textarea
                          value={newInteraction.note}
                          onChange={(e) => setNewInteraction({ ...newInteraction, note: e.target.value })}
                          placeholder="Detalle de la interacción..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Próximo seguimiento (opcional)</Label>
                        <Input
                          type="date"
                          value={newInteraction.nextFollowUp}
                          onChange={(e) => setNewInteraction({ ...newInteraction, nextFollowUp: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowInteractionForm(false)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAddInteraction}
                          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          Guardar
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-0">
                    {[...client.interactions].sort((a, b) => b.date.localeCompare(a.date)).map((inter, idx) => (
                      <div key={inter.id} className="flex gap-3 relative">
                        {/* line */}
                        {idx < client.interactions.length - 1 && (
                          <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                        )}
                        {/* dot */}
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0 relative z-10">
                          {interactionIcon[inter.type]}
                        </div>
                        {/* content */}
                        <div className="flex-1 pb-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{inter.type}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{formatDate(inter.date)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{inter.note}</p>
                          {inter.nextFollowUp && (
                            <p className="text-[10px] text-info mt-1 flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" /> Seguimiento: {formatDate(inter.nextFollowUp)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value, icon, isLink, badge }: {
  label: string; value: string; icon?: React.ReactNode; isLink?: boolean; badge?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1">
        {icon} {label}
      </span>
      {badge ? (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge}`}>{value}</span>
      ) : isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
          {value}
        </a>
      ) : (
        <span className="text-sm truncate">{value}</span>
      )}
    </div>
  );
}
