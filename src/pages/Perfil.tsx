import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Save } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "disponible", label: "Disponible", color: "bg-success" },
  { value: "ocupado", label: "Ocupado", color: "bg-warning" },
  { value: "ausente", label: "Ausente", color: "bg-muted-foreground" },
] as const;

export default function Perfil() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [fullName, setFullName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const currentName = fullName ?? profile?.full_name ?? "";
  const currentStatus = status ?? profile?.status ?? "disponible";

  const handleSave = () => {
    updateProfile.mutate(
      {
        full_name: currentName,
        status: currentStatus as "disponible" | "ocupado" | "ausente",
      },
      {
        onSuccess: () => {
          toast({ title: "Perfil actualizado", description: "Tus cambios se guardaron correctamente." });
          setFullName(null);
          setStatus(null);
        },
        onError: (err) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Administra tu información personal y estado</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Información personal
          </CardTitle>
          <CardDescription>Actualiza tu nombre y estado de disponibilidad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Correo electrónico</Label>
            <Input value={user?.email ?? ""} disabled className="opacity-60" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              value={currentName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={currentStatus} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${opt.color}`} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={updateProfile.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
