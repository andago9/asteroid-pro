import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice, InvoiceItem, InvoicePayment, PaymentMethodType } from "@/lib/invoice-data";
import { calcItemSubtotal, calcBalance, calcTotalPaid } from "@/lib/invoice-data";

function mapRow(r: any): Invoice {
  const items: InvoiceItem[] = (r.invoice_items ?? [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((i: any) => ({
      id: i.id,
      productName: i.product_name ?? "",
      quantity: i.quantity ?? 1,
      unitPrice: i.unit_price ?? 0,
      taxRate: i.tax_rate ?? 16,
      subtotal: calcItemSubtotal(i.quantity ?? 1, i.unit_price ?? 0, i.tax_rate ?? 16),
    }));

  const payments: InvoicePayment[] = (r.invoice_payments ?? []).map((p: any) => ({
    id: p.id,
    date: p.date?.split("T")[0] ?? "",
    amount: Number(p.amount ?? 0),
    method: (p.method ?? "Transferencia") as PaymentMethodType,
    reference: p.reference ?? "",
  }));

  // Map DB statuses
  const statusMap: Record<string, string> = {
    "Borrador": "Pendiente", "Enviada": "Pendiente", "Pagada": "Pagada",
    "Parcial": "Parcial", "Vencida": "Vencida", "Cancelada": "Cancelada",
  };

  return {
    id: r.id,
    invoiceNumber: r.invoice_number,
    client: r.client_name ?? "",
    issueDate: r.date,
    dueDate: r.due_date,
    status: (statusMap[r.status] ?? r.status) as any,
    items,
    discount: Number(r.discount ?? 0),
    payments,
    notes: r.notes ?? "",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function localStatusToDB(s: string) {
  const map: Record<string, string> = {
    "Pendiente": "Enviada", "Pagada": "Pagada", "Parcial": "Parcial",
    "Vencida": "Vencida", "Cancelada": "Cancelada",
  };
  return map[s] ?? s;
}

export function useInvoices() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, invoice_items(*), invoice_payments(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

  const create = useMutation({
    mutationFn: async (inv: Omit<Invoice, "id" | "invoiceNumber" | "payments" | "createdAt" | "updatedAt">) => {
      const { data: existing } = await supabase.from("invoices").select("invoice_number").order("created_at", { ascending: false }).limit(1);
      const lastNum = existing?.[0]?.invoice_number ? parseInt(existing[0].invoice_number.replace("FAC-", "")) : 0;
      const invoiceNumber = `FAC-${String(lastNum + 1).padStart(3, "0")}`;

      const { data: inserted, error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        client_name: inv.client,
        date: inv.issueDate,
        due_date: inv.dueDate,
        status: localStatusToDB(inv.status) as any,
        discount: inv.discount,
        notes: inv.notes,
      }).select().single();
      if (error) throw error;

      if (inv.items.length > 0) {
        await supabase.from("invoice_items").insert(
          inv.items.map((item, i) => ({
            invoice_id: inserted.id,
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            tax_rate: item.taxRate,
            sort_order: i,
          }))
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data: inv }: { id: string; data: Omit<Invoice, "id" | "invoiceNumber" | "payments" | "createdAt" | "updatedAt"> }) => {
      await supabase.from("invoices").update({
        client_name: inv.client,
        date: inv.issueDate,
        due_date: inv.dueDate,
        status: localStatusToDB(inv.status) as any,
        discount: inv.discount,
        notes: inv.notes,
      }).eq("id", id);

      await supabase.from("invoice_items").delete().eq("invoice_id", id);
      if (inv.items.length > 0) {
        await supabase.from("invoice_items").insert(
          inv.items.map((item, i) => ({
            invoice_id: id,
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            tax_rate: item.taxRate,
            sort_order: i,
          }))
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("invoice_payments").delete().eq("invoice_id", id);
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
      await supabase.from("invoices").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const addPayment = useMutation({
    mutationFn: async ({ invoiceId, payment }: { invoiceId: string; payment: { date: string; amount: number; method: PaymentMethodType; reference: string } }) => {
      await supabase.from("invoice_payments").insert({
        invoice_id: invoiceId,
        date: payment.date,
        amount: payment.amount,
        method: payment.method as any,
        reference: payment.reference,
      });

      // Refetch to compute balance and update status
      const { data } = await supabase.from("invoices").select("*, invoice_items(*), invoice_payments(*)").eq("id", invoiceId).single();
      if (data) {
        const inv = mapRow(data);
        const bal = calcBalance(inv);
        const newStatus = bal <= 0 ? "Pagada" : calcTotalPaid(inv.payments) > 0 ? "Parcial" : inv.status;
        await supabase.from("invoices").update({ status: localStatusToDB(newStatus) as any }).eq("id", invoiceId);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });

  return { invoices: query.data ?? [], isLoading: query.isLoading, create, update, remove, addPayment };
}
