import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Trash2, Check, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNotifications, MODULE_LABELS, MODULE_COLORS, NotificationModule, formatNotificationTime } from "@/lib/notifications-data";

const MODULES: NotificationModule[] = ["tareas", "helpdesk", "ventas", "facturacion", "monitor", "calendario", "proyectos", "sistema"];

export default function Notificaciones() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...notifications];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }
    if (filterModule !== "all") list = list.filter(n => n.module === filterModule);
    if (filterStatus === "unread") list = list.filter(n => n.status === "unread");
    if (filterStatus === "read") list = list.filter(n => n.status === "read");
    return list;
  }, [notifications, search, filterModule, filterStatus]);

  const handleClick = (n: typeof notifications[0]) => {
    markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />Notificaciones
          </h1>
          <p className="text-sm text-muted-foreground">{unreadCount} sin leer · {notifications.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar notificaciones..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(p => !p)}>
          <Filter className="h-4 w-4 mr-1" />Filtros
        </Button>
      </div>

      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex flex-wrap gap-3">
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Módulo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los módulos</SelectItem>
              {MODULES.map(m => <SelectItem key={m} value={m}>{MODULE_LABELS[m]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Sin leer</SelectItem>
              <SelectItem value="read">Leídas</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No hay notificaciones</p>
          </div>
        ) : (
          filtered.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`glass-card rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-muted/30 ${n.status === "unread" ? "border-l-2 border-l-primary" : ""}`}
              onClick={() => handleClick(n)}
            >
              <span className={`inline-flex items-center justify-center h-9 w-9 rounded-full text-xs font-bold flex-shrink-0 ${MODULE_COLORS[n.module]}`}>
                {MODULE_LABELS[n.module].slice(0, 2).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{n.title}</span>
                  {n.status === "unread" && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] capitalize">{MODULE_LABELS[n.module]}</Badge>
                  <span className="text-[10px] text-muted-foreground">{formatNotificationTime(n.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {n.status === "unread" && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); markAsRead(n.id); }} title="Marcar como leída">
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={e => e.stopPropagation()}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar notificación</AlertDialogTitle>
                      <AlertDialogDescription>¿Deseas eliminar esta notificación?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteNotification(n.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
