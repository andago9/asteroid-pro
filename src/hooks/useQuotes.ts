import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Quote, QuoteItem, QuoteActivity } from "@/lib/sales-data";
import { calcItemSubtotal } from "@/lib/sales-data";

function mapRow(r: any): Quote {
  const items: QuoteItem[] = (r.quote_items ?? [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((i: any) => ({
      id: i.id,
      productName: i.product_name ?? "",
      quantity: i.quantity ?? 1,
      unitPrice: i.unit_price ?? 0,
      discount: i.discount ?? 0,
      subtotal: calcItemSubtotal(i.quantity ?? 1, i.unit_price ?? 0, i.discount ?? 0),
    }));

  const activity: QuoteActivity[] = (r.quote_activity ?? [])
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .map((a: any) => ({
      id: a.id, date: a.date, user: a.user_name ?? "Sistema", action: a.action,
    }));

  // Map DB status to local status
  const statusMap: Record<string, string> = {
    "Borrador": "Borrador", "Enviada": "Enviada", "Aceptada": "Aprobada",
    "Rechazada": "Rechazada", "Convertida": "Convertida", "Vencida": "Rechazada",
  };

  return {
    id: r.id,
    quoteNumber: r.quote_number,
    client: r.client_name ?? "",
    quoteDate: r.date,
    expiryDate: r.valid_until ?? "",
    status: (statusMap[r.status] ?? r.status) as any,
    seller: r.seller ?? "",
    items,
    taxRate: Number(r.tax_rate ?? 16),
    generalDiscount: Number(r.general_discount ?? 0),
    notes: r.notes ?? "",
    activity,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function localStatusToDB(s: string) {
  const map: Record<string, string> = {
    "Borrador": "Borrador", "Enviada": "Enviada", "Aprobada": "Aceptada",
    "Rechazada": "Rechazada", "Convertida": "Convertida",
  };
  return map[s] ?? s;
}

export function useQuotes() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*, quote_items(*), quote_activity(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

  const create = useMutation({
    mutationFn: async (q: Omit<Quote, "id" | "quoteNumber" | "activity" | "createdAt" | "updatedAt"> & { quoteNumber?: string }) => {
      // Get next quote number
      const { data: existing } = await supabase.from("quotes").select("quote_number").order("created_at", { ascending: false }).limit(1);
      const lastNum = existing?.[0]?.quote_number ? parseInt(existing[0].quote_number.replace("COT-", "")) : 0;
      const quoteNumber = q.quoteNumber || `COT-${String(lastNum + 1).padStart(3, "0")}`;

      const { data: inserted, error } = await supabase.from("quotes").insert({
        quote_number: quoteNumber,
        client_name: q.client,
        date: q.quoteDate,
        valid_until: q.expiryDate,
        status: localStatusToDB(q.status) as any,
        seller: q.seller,
        tax_rate: q.taxRate,
        general_discount: q.generalDiscount,
        notes: q.notes,
      }).select().single();
      if (error) throw error;

      // Insert items
      if (q.items.length > 0) {
        const { error: itemsErr } = await supabase.from("quote_items").insert(
          q.items.map((item, i) => ({
            quote_id: inserted.id,
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount: item.discount,
            sort_order: i,
          }))
        );
        if (itemsErr) throw itemsErr;
      }

      // Insert activity
      await supabase.from("quote_activity").insert({
        quote_id: inserted.id,
        action: "Cotización creada",
        user_name: q.seller,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data: q }: { id: string; data: Omit<Quote, "id" | "quoteNumber" | "activity" | "createdAt" | "updatedAt"> }) => {
      const { error } = await supabase.from("quotes").update({
        client_name: q.client,
        date: q.quoteDate,
        valid_until: q.expiryDate,
        status: localStatusToDB(q.status) as any,
        seller: q.seller,
        tax_rate: q.taxRate,
        general_discount: q.generalDiscount,
        notes: q.notes,
      }).eq("id", id);
      if (error) throw error;

      // Replace items
      await supabase.from("quote_items").delete().eq("quote_id", id);
      if (q.items.length > 0) {
        await supabase.from("quote_items").insert(
          q.items.map((item, i) => ({
            quote_id: id,
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount: item.discount,
            sort_order: i,
          }))
        );
      }

      await supabase.from("quote_activity").insert({
        quote_id: id,
        action: "Cotización editada",
        user_name: q.seller,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("quote_items").delete().eq("quote_id", id);
      await supabase.from("quote_activity").delete().eq("quote_id", id);
      const { error } = await supabase.from("quotes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });

  const convert = useMutation({
    mutationFn: async ({ id, seller }: { id: string; seller: string }) => {
      await supabase.from("quotes").update({ status: "Convertida" as any }).eq("id", id);
      await supabase.from("quote_activity").insert({
        quote_id: id,
        action: "Convertida en venta — Ingreso registrado en Finanzas",
        user_name: seller,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });

  return { quotes: query.data ?? [], isLoading: query.isLoading, create, update, remove, convert };
}
