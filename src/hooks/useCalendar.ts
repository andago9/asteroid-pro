import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CalendarEvent } from "@/lib/calendar-data";

function mapRow(r: any): CalendarEvent {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    start: r.start_time?.replace("Z", "")?.slice(0, 16) ?? "",
    end: r.end_time?.replace("Z", "")?.slice(0, 16) ?? "",
    type: r.type ?? "general",
    priority: r.priority ?? "media",
    responsible: r.responsible ?? "",
    clientId: r.client_id ?? undefined,
    clientName: r.client_name ?? undefined,
    projectName: r.project_name ?? undefined,
    ticketId: r.ticket_id ?? undefined,
    taskName: r.task_name ?? undefined,
    reminder: r.reminder ?? undefined,
  };
}

export function useCalendar() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["calendar_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("calendar_events").select("*").order("start_time", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

  const create = useMutation({
    mutationFn: async (ev: Omit<CalendarEvent, "id">) => {
      const { error } = await supabase.from("calendar_events").insert({
        title: ev.title,
        description: ev.description,
        start_time: ev.start,
        end_time: ev.end,
        type: ev.type as any,
        priority: ev.priority as any,
        responsible: ev.responsible,
        client_name: ev.clientName ?? "",
        project_name: ev.projectName ?? "",
        ticket_id: ev.ticketId ?? "",
        task_name: ev.taskName ?? "",
        reminder: ev.reminder ?? "",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar_events"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data: ev }: { id: string; data: Omit<CalendarEvent, "id"> }) => {
      const { error } = await supabase.from("calendar_events").update({
        title: ev.title,
        description: ev.description,
        start_time: ev.start,
        end_time: ev.end,
        type: ev.type as any,
        priority: ev.priority as any,
        responsible: ev.responsible,
        client_name: ev.clientName ?? "",
        project_name: ev.projectName ?? "",
        ticket_id: ev.ticketId ?? "",
        task_name: ev.taskName ?? "",
        reminder: ev.reminder ?? "",
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar_events"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar_events"] }),
  });

  return { events: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
