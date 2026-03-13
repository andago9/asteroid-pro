import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TaskStatus = "Pendiente" | "En progreso" | "En revisión" | "Completada";

export interface Task {
  id: string;
  name: string;
  assignee: string;
  assignedBy: string;
  status: TaskStatus;
  project: string;
  projectId: string;
  clientName: string;
  dueDate: string;
  points: number;
}

function mapStatus(s: string | null): TaskStatus {
  const map: Record<string, TaskStatus> = {
    "pendiente": "Pendiente",
    "en_progreso": "En progreso",
    "revision": "En revisión",
    "completada": "Completada",
  };
  return map[s ?? "pendiente"] ?? "Pendiente";
}

function localStatusToDB(s: TaskStatus) {
  const map: Record<TaskStatus, string> = {
    "Pendiente": "pendiente",
    "En progreso": "en_progreso",
    "En revisión": "revision",
    "Completada": "completada",
  };
  return map[s];
}

export function useTasks() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any): Task => ({
        id: r.id,
        name: r.name,
        assignee: r.assignee ?? "Sin asignar",
        assignedBy: r.assigned_by ?? "",
        status: mapStatus(r.status),
        project: r.project_name ?? "Sin proyecto",
        projectId: r.project_id ?? "",
        clientName: r.client_name ?? "",
        dueDate: r.due_date ?? "",
        points: r.points ?? 1,
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (t: Omit<Task, "id">) => {
      const { error } = await supabase.from("tasks").insert({
        name: t.name,
        assignee: t.assignee,
        assigned_by: t.assignedBy,
        status: localStatusToDB(t.status) as any,
        project_name: t.project,
        project_id: t.projectId || null,
        client_name: t.clientName,
        due_date: t.dueDate,
        points: t.points,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, data: t }: { id: string; data: Omit<Task, "id"> }) => {
      const { error } = await supabase.from("tasks").update({
        name: t.name,
        assignee: t.assignee,
        assigned_by: t.assignedBy,
        status: localStatusToDB(t.status) as any,
        project_name: t.project,
        project_id: t.projectId || null,
        client_name: t.clientName,
        due_date: t.dueDate,
        points: t.points,
      } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { error } = await supabase.from("tasks").update({
        status: localStatusToDB(status) as any,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return { tasks: query.data ?? [], isLoading: query.isLoading, create, updateTask, updateStatus, remove };
}
