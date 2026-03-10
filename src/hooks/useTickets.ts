import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Ticket, TicketMessage, TicketActivity, TicketStatus } from "@/lib/helpdesk-data";

function mapRow(r: any): Ticket {
  const messages: TicketMessage[] = (r.ticket_messages ?? [])
    .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))
    .map((m: any) => ({
      id: m.id,
      author: m.sender ?? "Sistema",
      role: m.is_internal ? "agent" as const : "user" as const,
      date: m.created_at,
      message: m.body ?? "",
    }));

  const activity: TicketActivity[] = (r.ticket_activity ?? [])
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .map((a: any) => ({
      id: a.id, date: a.date, user: a.user_name ?? "Sistema", action: a.action,
    }));

  // Map DB statuses to local
  const statusMap: Record<string, string> = {
    "Abierto": "Abierto", "En progreso": "En proceso", "Esperando": "Pendiente",
    "Resuelto": "Resuelto", "Cerrado": "Cerrado",
  };

  const typeMap: Record<string, string> = {
    "Soporte": "Soporte", "Bug": "Incidente", "Feature": "Mejora", "Consulta": "Consulta",
  };

  return {
    id: r.id,
    ticketId: r.ticket_number,
    title: r.subject,
    description: r.description ?? "",
    type: (typeMap[r.type] ?? r.type) as any,
    priority: (r.priority === "Urgente" ? "Crítica" : r.priority) as any,
    status: (statusMap[r.status] ?? r.status) as any,
    client: r.client_name ?? "",
    requester: r.client_name ?? "",
    agent: r.assigned_agent ?? "Sin asignar",
    department: r.department ?? "",
    messages,
    activity,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function localStatusToDB(s: string) {
  const map: Record<string, string> = {
    "Abierto": "Abierto", "En proceso": "En progreso", "Pendiente": "Esperando",
    "Resuelto": "Resuelto", "Cerrado": "Cerrado",
  };
  return map[s] ?? s;
}

function localTypeToDB(t: string) {
  const map: Record<string, string> = {
    "Soporte": "Soporte", "Incidente": "Bug", "Mejora": "Feature", "Consulta": "Consulta",
  };
  return map[t] ?? t;
}

function localPriorityToDB(p: string) {
  if (p === "Crítica") return "Urgente";
  return p;
}

export function useTickets() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, ticket_messages(*), ticket_activity(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

  const create = useMutation({
    mutationFn: async (t: Omit<Ticket, "id" | "ticketId" | "messages" | "activity" | "createdAt" | "updatedAt">) => {
      const { data: existing } = await supabase.from("tickets").select("ticket_number").order("created_at", { ascending: false }).limit(1);
      const lastNum = existing?.[0]?.ticket_number ? parseInt(existing[0].ticket_number.replace("HD-", "")) : 0;
      const ticketNumber = `HD-${String(lastNum + 1).padStart(3, "0")}`;

      const { data: inserted, error } = await supabase.from("tickets").insert({
        ticket_number: ticketNumber,
        subject: t.title,
        description: t.description,
        type: localTypeToDB(t.type) as any,
        priority: t.priority as any,
        status: localStatusToDB(t.status) as any,
        client_name: t.client,
        assigned_agent: t.agent === "Sin asignar" ? "" : t.agent,
        department: t.department,
      }).select().single();
      if (error) throw error;

      await supabase.from("ticket_activity").insert({
        ticket_id: inserted.id, action: "Ticket creado", user_name: "Sistema",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data: t }: { id: string; data: Omit<Ticket, "id" | "ticketId" | "messages" | "activity" | "createdAt" | "updatedAt"> }) => {
      await supabase.from("tickets").update({
        subject: t.title,
        description: t.description,
        type: localTypeToDB(t.type) as any,
        priority: t.priority as any,
        status: localStatusToDB(t.status) as any,
        client_name: t.client,
        assigned_agent: t.agent === "Sin asignar" ? "" : t.agent,
        department: t.department,
      }).eq("id", id);

      await supabase.from("ticket_activity").insert({
        ticket_id: id, action: "Ticket editado", user_name: "Sistema",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("ticket_messages").delete().eq("ticket_id", id);
      await supabase.from("ticket_activity").delete().eq("ticket_id", id);
      await supabase.from("tickets").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      await supabase.from("tickets").update({ status: localStatusToDB(status) as any }).eq("id", id);
      await supabase.from("ticket_activity").insert({
        ticket_id: id, action: `Estado cambiado a ${status}`, user_name: "Sistema",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const changeAgent = useMutation({
    mutationFn: async ({ id, agent }: { id: string; agent: string }) => {
      await supabase.from("tickets").update({ assigned_agent: agent }).eq("id", id);
      await supabase.from("ticket_activity").insert({
        ticket_id: id, action: `Ticket asignado a ${agent}`, user_name: "Sistema",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const addMessage = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      await supabase.from("ticket_messages").insert({
        ticket_id: ticketId, body: message, sender: "Agente", is_internal: true,
      });
      await supabase.from("ticket_activity").insert({
        ticket_id: ticketId, action: "Respuesta agregada", user_name: "Agente",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });

  return {
    tickets: query.data ?? [], isLoading: query.isLoading,
    create, update, remove, changeStatus, changeAgent, addMessage,
  };
}
