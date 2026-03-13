import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PROJECT_STATUSES = [
  { value: "Idea", label: "💡 Idea" },
  { value: "Planeación", label: "📝 Planeación" },
  { value: "En progreso", label: "🚧 En desarrollo" },
  { value: "Pausado", label: "⏸️ Pausado" },
  { value: "Cancelado", label: "❌ Cancelado" },
  { value: "Completado", label: "✅ Ejecutado" },
] as const;

export const PROJECT_STATUS_DISPLAY: Record<string, string> = {
  "Idea": "💡 Idea",
  "Planeación": "📝 Planeación",
  "En progreso": "🚧 En desarrollo",
  "Pausado": "⏸️ Pausado",
  "Cancelado": "❌ Cancelado",
  "Completado": "✅ Ejecutado",
};

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  responsable: string;
  cliente: string;
  scores: {
    reconocimiento: number;
    riesgo: number;
    capital: number;
    retorno: number;
    factibilidad: number;
    dificultad: number;
    tiempo: number;
    alineacion: number;
  };
}

function mapRow(r: any): Project {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    status: r.status ?? "Idea",
    progress: r.progress ?? 0,
    responsable: r.responsible ?? "",
    cliente: r.client ?? "",
    scores: {
      reconocimiento: Number(r.score_client ?? 3),
      riesgo: Number(r.score_risk ?? 3),
      capital: Number(r.score_budget ?? 3),
      retorno: Number(r.score_quality ?? 3),
      factibilidad: Number(r.score_scope ?? 3),
      dificultad: 3,
      tiempo: Number(r.score_time ?? 3),
      alineacion: 3,
    },
  };
}

export function useProjects() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

  const create = useMutation({
    mutationFn: async (p: Omit<Project, "id">) => {
      const { error } = await supabase.from("projects").insert({
        name: p.name,
        description: p.description,
        status: p.status as any,
        progress: p.progress,
        responsible: p.responsable,
        client: p.cliente,
        score_client: p.scores.reconocimiento,
        score_risk: p.scores.riesgo,
        score_budget: p.scores.capital,
        score_quality: p.scores.retorno,
        score_scope: p.scores.factibilidad,
        score_time: p.scores.tiempo,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data: p }: { id: string; data: Omit<Project, "id"> }) => {
      const { error } = await supabase.from("projects").update({
        name: p.name,
        description: p.description,
        status: p.status as any,
        progress: p.progress,
        responsible: p.responsable,
        client: p.cliente,
        score_client: p.scores.reconocimiento,
        score_risk: p.scores.riesgo,
        score_budget: p.scores.capital,
        score_quality: p.scores.retorno,
        score_scope: p.scores.factibilidad,
        score_time: p.scores.tiempo,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return { projects: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
