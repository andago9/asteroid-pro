import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppNotification, NotificationModule } from "@/lib/notifications-data";

export function useNotificationsData() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r): AppNotification => ({
        id: r.id,
        title: r.title,
        message: r.message ?? "",
        module: (r.module ?? "sistema") as NotificationModule,
        status: r.is_read ? "read" : "unread",
        createdAt: r.created_at,
        link: r.link ?? undefined,
      }));
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const addNotification = useMutation({
    mutationFn: async (n: Omit<AppNotification, "id" | "createdAt" | "status">) => {
      await supabase.from("notifications").insert({
        title: n.title,
        message: n.message,
        module: n.module,
        link: n.link ?? "",
        is_read: false,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter(n => n.status === "unread").length;

  return { notifications, unreadCount, isLoading: query.isLoading, markAsRead, markAllAsRead, deleteNotification, addNotification };
}
