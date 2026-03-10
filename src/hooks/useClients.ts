import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client, Interaction } from "@/lib/clients-data";

function mapRow(r: any): Client {
  return {
    id: r.id,
    name: r.name ?? "",
    docType: r.doc_type ?? "Otro",
    docNumber: r.doc_number ?? "",
    sector: r.sector ?? "",
    address: "",
    city: r.city ?? "",
    state: "",
    country: "",
    website: "",
    contactPerson: r.company ?? "",
    contactRole: "",
    phone: r.phone ?? "",
    email: r.email ?? "",
    preferredChannel: (r.contact_channel as any) || "Email",
    status: r.status === "Activo" ? "Cliente activo" : r.status === "Inactivo" ? "Cliente inactivo" : "Prospecto",
    source: r.source ?? "Web",
    responsible: "",
    potentialValue: 0,
    notes: r.notes ?? "",
    tags: [],
    interactions: r.client_interactions?.map((i: any) => {
      const typeFromDB: Record<string, string> = {
        "Llamada": "Llamada", "Correo": "Email", "Reunión": "Reunión", "Nota": "WhatsApp", "Soporte": "Llamada",
      };
      return {
        id: i.id,
        date: i.date,
        type: (typeFromDB[i.type] ?? i.type) as any,
        note: i.summary ?? "",
      };
    }) ?? [],
    createdAt: r.created_at?.split("T")[0] ?? "",
  };
}

function mapStatusToDB(status: string) {
  if (status === "Cliente activo") return "Activo";
  if (status === "Cliente inactivo") return "Inactivo";
  return "Prospecto";
}

export function useClients() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*, client_interactions(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

  const create = useMutation({
    mutationFn: async (c: Omit<Client, "id" | "createdAt" | "interactions">) => {
      const { error } = await supabase.from("clients").insert({
        name: c.name,
        company: c.contactPerson,
        email: c.email,
        phone: c.phone,
        city: c.city,
        sector: c.sector,
        status: mapStatusToDB(c.status) as any,
        source: c.source as any,
        doc_type: c.docType as any,
        doc_number: c.docNumber,
        contact_channel: c.preferredChannel,
        notes: c.notes,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Client, "id" | "createdAt" | "interactions"> }) => {
      const { error } = await supabase.from("clients").update({
        name: data.name,
        company: data.contactPerson,
        email: data.email,
        phone: data.phone,
        city: data.city,
        sector: data.sector,
        status: mapStatusToDB(data.status) as any,
        source: data.source as any,
        doc_type: data.docType as any,
        doc_number: data.docNumber,
        contact_channel: data.preferredChannel,
        notes: data.notes,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  const addInteraction = useMutation({
    mutationFn: async ({ clientId, interaction }: { clientId: string; interaction: Omit<Interaction, "id"> }) => {
      const typeToDB: Record<string, string> = {
        "Llamada": "Llamada", "Email": "Correo", "Reunión": "Reunión", "WhatsApp": "Nota",
      };
      const { error } = await supabase.from("client_interactions").insert({
        client_id: clientId,
        date: interaction.date,
        type: (typeToDB[interaction.type] ?? "Nota") as any,
        summary: interaction.note,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  return { clients: query.data ?? [], isLoading: query.isLoading, create, update, remove, addInteraction };
}
