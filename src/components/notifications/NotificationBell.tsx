import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, MODULE_LABELS, MODULE_COLORS, formatNotificationTime } from "@/lib/notifications-data";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (n: typeof notifications[0]) => {
    markAsRead(n.id);
    if (n.link) { navigate(n.link); setOpen(false); }
  };

  const recent = notifications.slice(0, 15);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="text-sm font-semibold">Notificaciones</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
                <CheckCheck className="h-3 w-3 mr-1" />Leer todas
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { navigate("/notificaciones"); setOpen(false); }}>
              Ver todo
            </Button>
          </div>
        </div>
        <ScrollArea className="max-h-[400px]">
          {recent.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Sin notificaciones</div>
          ) : (
            recent.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/30 ${n.status === "unread" ? "bg-primary/5" : ""}`}
                onClick={() => handleClick(n)}
              >
                <div className="pt-0.5">
                  <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-[10px] font-bold ${MODULE_COLORS[n.module]}`}>
                    {MODULE_LABELS[n.module].slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold truncate">{n.title}</span>
                    {n.status === "unread" && <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{MODULE_LABELS[n.module]}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatNotificationTime(n.createdAt)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
