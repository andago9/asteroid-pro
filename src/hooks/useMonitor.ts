import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MonitorResource } from "@/lib/monitor-data";

function mapStatus(s: string | null): "online" | "degraded" | "offline" {
  if (s === "Operativo") return "online";
  if (s === "Degradado") return "degraded";
  if (s === "Caído") return "offline";
  if (s === "Mantenimiento") return "offline";
  return "online";
}

function localStatusToDB(s: string) {
  if (s === "online") return "Operativo";
  if (s === "degraded") return "Degradado";
  if (s === "offline") return "Caído";
  return "Operativo";
}

function mapType(t: string | null): string {
  const map: Record<string, string> = {
    "Servidor": "Servidor", "API": "Servicio", "Web": "Web",
    "Base de datos": "Servicio", "Servicio": "Servicio",
  };
  return map[t ?? ""] ?? "Servicio";
}

function mapRow(r: any): MonitorResource {
  return {
    id: r.id,
    name: r.name,
    type: mapType(r.type) as any,
    url: r.url ?? "",
    port: "",
    frequency: r.frequency ?? "5m",
    description: "",
    status: mapStatus(r.status),
    latency: r.latency ?? 0,
    lastCheck: r.last_check ?? new Date().toISOString(),
    uptime: Number(r.uptime ?? 100),
    latencyHistory: (r.monitor_latency_history ?? []).map((h: any) => ({
      time: h.time, latency: h.value,
    })),
    incidents: (r.monitor_incidents ?? []).map((i: any) => ({
      id: i.id,
      date: i.date,
      event: i.resolved ? "recuperado" : "caído",
      note: i.description ?? "",
    })),
    createdAt: r.created_at?.split("T")[0] ?? "",
  };
}

export function useMonitor() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["monitor_resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monitor_resources")
        .select("*, monitor_incidents(*), monitor_latency_history(*)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

  const create = useMutation({
    mutationFn: async (r: { name: string; type: string; url: string; port: string; frequency: string; description: string }) => {
      const typeMap: Record<string, string> = {
        "Aplicación": "Servicio", "Servicio": "Servicio", "Web": "Web", "Servidor": "Servidor",
      };
      const { error } = await supabase.from("monitor_resources").insert({
        name: r.name,
        type: (typeMap[r.type] ?? "Servicio") as any,
        url: r.url,
        frequency: r.frequency as any,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["monitor_resources"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data: r }: { id: string; data: { name: string; type: string; url: string; port: string; frequency: string; description: string } }) => {
      const typeMap: Record<string, string> = {
        "Aplicación": "Servicio", "Servicio": "Servicio", "Web": "Web", "Servidor": "Servidor",
      };
      await supabase.from("monitor_resources").update({
        name: r.name,
        type: (typeMap[r.type] ?? "Servicio") as any,
        url: r.url,
        frequency: r.frequency as any,
      }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["monitor_resources"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("monitor_incidents").delete().eq("resource_id", id);
      await supabase.from("monitor_latency_history").delete().eq("resource_id", id);
      await supabase.from("monitor_resources").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["monitor_resources"] }),
  });

  return { resources: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
