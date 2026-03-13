import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SystemUser {
  id: string;
  full_name: string;
  avatar_url: string;
}

export function useSystemUsers() {
  const query = useQuery({
    queryKey: ["system-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .order("full_name");
      if (error) throw error;
      return (data ?? []).map((r): SystemUser => ({
        id: r.id,
        full_name: r.full_name || "Sin nombre",
        avatar_url: r.avatar_url || "",
      }));
    },
  });

  return { users: query.data ?? [], isLoading: query.isLoading };
}
