import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Save, FileText } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "disponible", label: "Disponible", color: "bg-success" },
  { value: "ocupado", label: "Ocupado", color: "bg-warning" },
  { value: "ausente", label: "Ausente", color: "bg-muted-foreground" },
] as const;

export default function Perfil() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [celular, setCelular] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [ciudad, setCiudad] = useState<string>("");
  const [pais, setPais] = useState<string>("");
  const [direccion, setDireccion] = useState<string>("");
  const [status, setStatus] = useState<string>("disponible");
  const [cargo, setCargo] = useState<string>("");
  const [estudios, setEstudios] = useState<string>("");

  // Initialize states with profile data
  React.useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || "");
      setApellido(profile.apellido || "");
      setCelular(profile.celular || "");
      setGithub(profile.github || "");
      setLinkedin(profile.linkedin || "");
      setCiudad(profile.ciudad || "");
      setPais(profile.pais || "");
      setDireccion(profile.direccion || "");
      setStatus(profile.status || "disponible");
      setCargo(profile.cargo || "");
      setEstudios(profile.estudios || "");
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate(
      {
        nombre,
        apellido,
        celular,
        github,
        linkedin,
        ciudad,
        pais,
        direccion,
        status: status as "disponible" | "ocupado" | "ausente",
        cargo,
        estudios,
        full_name: `${nombre} ${apellido}`.trim(), // Update full_name for compatibility
      },
      {
        onSuccess: () => {
          toast({ title: "Perfil actualizado", description: "Tus cambios se guardaron correctamente." });
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

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Información General
          </TabsTrigger>
          <TabsTrigger value="cv" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CV / RRHH
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Información General
              </CardTitle>
              <CardDescription>Actualiza tu información personal y estado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input value={user?.email ?? ""} disabled className="opacity-60" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="Tu número de celular"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={status} onValueChange={setStatus}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="Tu perfil de GitHub"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="Tu perfil de LinkedIn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Tu ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    placeholder="Tu país"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Tu dirección"
                />
              </div>

              <Button onClick={handleSave} disabled={updateProfile.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cv">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                CV / RRHH
              </CardTitle>
              <CardDescription>Información profesional y académica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Tu cargo actual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estudios">Estudios</Label>
                <Input
                  id="estudios"
                  value={estudios}
                  onChange={(e) => setEstudios(e.target.value)}
                  placeholder="Tus estudios académicos"
                />
              </div>

              <Button onClick={handleSave} disabled={updateProfile.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
