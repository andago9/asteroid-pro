import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  status: "disponible" | "ocupado" | "ausente";
  nombre: string;
  apellido: string;
  celular: string;
  github: string;
  linkedin: string;
  ciudad: string;
  pais: string;
  direccion: string;
  cargo: string;
  estudios: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, "full_name" | "avatar_url" | "status" | "nombre" | "apellido" | "celular" | "github" | "linkedin" | "ciudad" | "pais" | "direccion" | "cargo" | "estudios">>) => {
      if (!user) throw new Error("No user");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return { profile, isLoading, updateProfile };
}
