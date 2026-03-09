import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Movement, FinanceCategory, PaymentMethod } from "@/lib/finance-data";

export function useFinance() {
  const qc = useQueryClient();

  const movementsQuery = useQuery({
    queryKey: ["finance_movements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_movements").select("*").order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r): Movement => ({
        id: r.id,
        type: r.type as any,
        date: r.date,
        amount: Number(r.amount),
        categoryId: r.category_id ?? "",
        paymentMethodId: r.payment_method_id ?? "",
        client: r.client ?? "",
        provider: r.provider ?? "",
        description: r.description ?? "",
        status: (r.status ?? "Pendiente") as any,
        createdAt: r.created_at?.split("T")[0] ?? "",
      }));
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["finance_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_categories").select("*").order("name");
      if (error) throw error;
      return (data ?? []).map((r): FinanceCategory => ({
        id: r.id, name: r.name, type: r.type as any,
      }));
    },
  });

  const paymentMethodsQuery = useQuery({
    queryKey: ["finance_payment_methods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_payment_methods").select("*").order("name");
      if (error) throw error;
      return (data ?? []).map((r): PaymentMethod => ({ id: r.id, name: r.name }));
    },
  });

  const createMovement = useMutation({
    mutationFn: async (m: Omit<Movement, "id" | "createdAt">) => {
      const { error } = await supabase.from("finance_movements").insert({
        type: m.type as any,
        date: m.date,
        amount: m.amount,
        category_id: m.categoryId || null,
        payment_method_id: m.paymentMethodId || null,
        client: m.client,
        provider: m.provider,
        description: m.description,
        status: m.status as any,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance_movements"] }),
  });

  const updateMovement = useMutation({
    mutationFn: async ({ id, data: m }: { id: string; data: Omit<Movement, "id" | "createdAt"> }) => {
      const { error } = await supabase.from("finance_movements").update({
        type: m.type as any,
        date: m.date,
        amount: m.amount,
        category_id: m.categoryId || null,
        payment_method_id: m.paymentMethodId || null,
        client: m.client,
        provider: m.provider,
        description: m.description,
        status: m.status as any,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance_movements"] }),
  });

  const deleteMovement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("finance_movements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance_movements"] }),
  });

  const createCategory = useMutation({
    mutationFn: async (c: Omit<FinanceCategory, "id">) => {
      const { error } = await supabase.from("finance_categories").insert({ name: c.name, type: c.type as any });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance_categories"] }),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("finance_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance_categories"] }),
  });

  const createPaymentMethod = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("finance_payment_methods").insert({ name });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance_payment_methods"] }),
  });

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("finance_payment_methods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance_payment_methods"] }),
  });

  return {
    movements: movementsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    paymentMethods: paymentMethodsQuery.data ?? [],
    isLoading: movementsQuery.isLoading || categoriesQuery.isLoading || paymentMethodsQuery.isLoading,
    createMovement, updateMovement, deleteMovement,
    createCategory, deleteCategory,
    createPaymentMethod, deletePaymentMethod,
  };
}
