import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  status: string;
}

export function useProducts() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r): Product => ({
        id: r.id,
        name: r.name,
        type: r.type ?? "Servicio",
        description: r.description ?? "",
        price: r.price ?? 0,
        status: r.status ?? "Activo",
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (p: Omit<Product, "id">) => {
      const { error } = await supabase.from("products").insert({
        name: p.name,
        type: p.type as any,
        description: p.description,
        price: p.price,
        status: p.status as any,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Product, "id"> }) => {
      const { error } = await supabase.from("products").update({
        name: data.name,
        type: data.type as any,
        description: data.description,
        price: data.price,
        status: data.status as any,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  return { products: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
