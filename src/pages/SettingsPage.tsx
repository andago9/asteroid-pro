import { Settings, Users, Trophy, Sliders, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNotifications, MODULE_LABELS, NotificationModule, NotificationPreferences } from "@/lib/notifications-data";

const tabs = [
  { id: "users", label: "Usuarios", icon: Users },
  { id: "gamification", label: "Gamificación", icon: Trophy },
  { id: "general", label: "General", icon: Sliders },
  { id: "notifications", label: "Notificaciones", icon: Bell },
];

const PREF_MODULES: NotificationModule[] = ["tareas", "helpdesk", "ventas", "facturacion", "monitor", "calendario", "proyectos"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users");
  const { preferences, updatePreferences } = useNotifications();

  const togglePref = (mod: NotificationModule, channel: "system" | "email") => {
    const updated: NotificationPreferences = {
      ...preferences,
      [mod]: { ...preferences[mod], [channel]: !preferences[mod][channel] },
    };
    updatePreferences(updated);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" /> Settings
      </h1>

      <div className="flex gap-2 border-b border-border/50 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-xs px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6">
        {activeTab === "users" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Gestión de Usuarios</h3>
            <p className="text-xs text-muted-foreground">Administra los usuarios del sistema, sus roles y permisos.</p>
            <div className="text-xs text-muted-foreground font-mono p-8 text-center border border-dashed border-border rounded-lg">
              Módulo de usuarios — Requiere backend
            </div>
          </div>
        )}
        {activeTab === "gamification" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Sistema de Gamificación</h3>
            <p className="text-xs text-muted-foreground">Configura puntos por tareas, objetivos y niveles del equipo.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs font-semibold mb-2">Puntos por Tarea</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Tarea básica</span><span className="font-mono text-secondary">+10 XP</span></div>
                  <div className="flex justify-between"><span>Tarea media</span><span className="font-mono text-secondary">+25 XP</span></div>
                  <div className="flex justify-between"><span>Tarea compleja</span><span className="font-mono text-secondary">+50 XP</span></div>
                  <div className="flex justify-between"><span>Tarea crítica</span><span className="font-mono text-secondary">+100 XP</span></div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs font-semibold mb-2">Niveles</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Nivel 1 — Rookie</span><span className="font-mono">0 XP</span></div>
                  <div className="flex justify-between"><span>Nivel 5 — Piloto</span><span className="font-mono">1,000 XP</span></div>
                  <div className="flex justify-between"><span>Nivel 10 — Comandante</span><span className="font-mono">5,000 XP</span></div>
                  <div className="flex justify-between"><span>Nivel 15 — Legendario</span><span className="font-mono">15,000 XP</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "general" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Configuraciones Generales</h3>
            <p className="text-xs text-muted-foreground">Pesos de evaluación de proyectos, estados personalizados y más.</p>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-xs font-semibold mb-3">Pesos de Evaluación</p>
              <div className="space-y-2 text-xs">
                {[
                  ["Reconocimiento", "10%"],
                  ["Riesgo", "15%"],
                  ["Capital requerido", "10%"],
                  ["Retorno", "20%"],
                  ["Factibilidad", "15%"],
                  ["Dificultad", "10%"],
                  ["Tiempo", "10%"],
                  ["Alineación", "10%"],
                ].map(([name, weight]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span>{name}</span>
                    <span className="font-mono font-semibold text-primary">{weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Preferencias de Notificaciones</h3>
            <p className="text-xs text-muted-foreground">Elige qué notificaciones recibir por módulo y canal.</p>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_100px] gap-2 p-3 bg-muted/30 text-xs font-semibold text-muted-foreground">
                <span>Módulo</span>
                <span className="text-center">Sistema</span>
                <span className="text-center">Email</span>
              </div>
              {PREF_MODULES.map(mod => (
                <div key={mod} className="grid grid-cols-[1fr_100px_100px] gap-2 items-center p-3 border-t border-border/50">
                  <span className="text-sm">{MODULE_LABELS[mod]}</span>
                  <div className="flex justify-center">
                    <Switch checked={preferences[mod].system} onCheckedChange={() => togglePref(mod, "system")} />
                  </div>
                  <div className="flex justify-center">
                    <Switch checked={preferences[mod].email} onCheckedChange={() => togglePref(mod, "email")} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
