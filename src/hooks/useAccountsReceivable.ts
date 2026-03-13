import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CxCFrequency = "Pago único" | "Mensual" | "Anual";
export type CxCStatus = "Pendiente" | "Pagado" | "Vencido";

export interface AccountReceivable {
  id: string;
  clientName: string;
  productService: string;
  concept: string;
  amount: number;
  frequency: CxCFrequency;
  startDate: string;
  dueDate: string;
  status: CxCStatus;
  notes: string;
  createdAt: string;
}

function mapRow(r: any): AccountReceivable {
  return {
    id: r.id,
    clientName: r.client_name ?? "",
    productService: r.product_service ?? "",
    concept: r.concept ?? "",
    amount: Number(r.amount ?? 0),
    frequency: r.frequency ?? "Pago único",
    startDate: r.start_date ?? "",
    dueDate: r.due_date ?? "",
    status: r.status ?? "Pendiente",
    notes: r.notes ?? "",
    createdAt: r.created_at ?? "",
  };
}

export function useAccountsReceivable() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["accounts_receivable"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("accounts_receivable")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

  const create = useMutation({
    mutationFn: async (item: Omit<AccountReceivable, "id" | "createdAt">) => {
      const { error } = await (supabase as any).from("accounts_receivable").insert({
        client_name: item.clientName,
        product_service: item.productService,
        concept: item.concept,
        amount: item.amount,
        frequency: item.frequency,
        start_date: item.startDate,
        due_date: item.dueDate,
        status: item.status,
        notes: item.notes,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts_receivable"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data: item }: { id: string; data: Omit<AccountReceivable, "id" | "createdAt"> }) => {
      const { error } = await (supabase as any).from("accounts_receivable").update({
        client_name: item.clientName,
        product_service: item.productService,
        concept: item.concept,
        amount: item.amount,
        frequency: item.frequency,
        start_date: item.startDate,
        due_date: item.dueDate,
        status: item.status,
        notes: item.notes,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts_receivable"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("accounts_receivable").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts_receivable"] }),
  });

  return {
    records: query.data ?? [],
    isLoading: query.isLoading,
    create,
    update,
    remove,
  };
}
