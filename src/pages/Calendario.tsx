import { useState, useMemo } from "react";
import { format, addDays, addMonths, addWeeks, subDays, subMonths, subWeeks, isSameDay, isToday, isSameMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Filter, CalendarDays, CalendarRange, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CalendarEvent, CalendarView, MOCK_EVENTS, EVENT_TYPES, RESPONSIBLES,
  EVENT_TYPE_COLORS, EVENT_TYPE_DOTS, getMonthDays, getWeekDays, getEventsForDay,
  getHourSlots, formatEventTime, nextEventId, EventType,
} from "@/lib/calendar-data";
import EventFormDialog from "@/components/calendar/EventFormDialog";
import EventDetail from "@/components/calendar/EventDetail";

const WEEK_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function Calendario() {
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [detail, setDetail] = useState<CalendarEvent | null>(null);
  const [defaultStart, setDefaultStart] = useState<string | undefined>();

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = events;
    if (filterType !== "all") list = list.filter(e => e.type === filterType);
    if (filterResponsible !== "all") list = list.filter(e => e.responsible === filterResponsible);
    return list;
  }, [events, filterType, filterResponsible]);

  // Navigation
  const nav = (dir: 1 | -1) => {
    if (view === "month") setCurrentDate(d => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
    else if (view === "week") setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setCurrentDate(d => dir === 1 ? addDays(d, 1) : subDays(d, 1));
  };
  const goToday = () => setCurrentDate(new Date());

  const headerLabel = () => {
    if (view === "month") return format(currentDate, "MMMM yyyy", { locale: es });
    if (view === "week") {
      const days = getWeekDays(currentDate);
      return `${format(days[0], "dd MMM", { locale: es })} — ${format(days[6], "dd MMM yyyy", { locale: es })}`;
    }
    return format(currentDate, "EEEE dd MMMM yyyy", { locale: es });
  };

  // CRUD
  const handleSave = (data: Omit<CalendarEvent, "id">) => {
    if (editing) {
      setEvents(prev => prev.map(e => e.id === editing.id ? { ...e, ...data } : e));
    } else {
      setEvents(prev => [...prev, { id: nextEventId(), ...data }]);
    }
    setEditing(null);
  };

  const handleEdit = (ev: CalendarEvent) => { setDetail(null); setEditing(ev); setDialogOpen(true); };
  const handleDelete = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const openNewOnDay = (day: Date) => {
    const s = new Date(day);
    s.setHours(9, 0, 0, 0);
    setDefaultStart(s.toISOString().slice(0, 16));
    setEditing(null);
    setDialogOpen(true);
  };

  const openNew = () => { setDefaultStart(undefined); setEditing(null); setDialogOpen(true); };

  // Counts for legend
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    EVENT_TYPES.forEach(t => counts[t] = filtered.filter(e => e.type === t).length);
    return counts;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} eventos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(p => !p)}>
            <Filter className="h-4 w-4 mr-1" />Filtros
          </Button>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nuevo Evento</Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex flex-wrap gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {EVENT_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterResponsible} onValueChange={setFilterResponsible}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Responsable" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {RESPONSIBLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => nav(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={goToday}>Hoy</Button>
          <Button variant="ghost" size="icon" onClick={() => nav(1)}><ChevronRight className="h-4 w-4" /></Button>
          <span className="text-sm font-semibold capitalize ml-2">{headerLabel()}</span>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button variant={view === "day" ? "default" : "ghost"} size="sm" onClick={() => setView("day")}>
            <CalendarCheck className="h-3.5 w-3.5 mr-1" />Día
          </Button>
          <Button variant={view === "week" ? "default" : "ghost"} size="sm" onClick={() => setView("week")}>
            <CalendarRange className="h-3.5 w-3.5 mr-1" />Semana
          </Button>
          <Button variant={view === "month" ? "default" : "ghost"} size="sm" onClick={() => setView("month")}>
            <CalendarDays className="h-3.5 w-3.5 mr-1" />Mes
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {EVENT_TYPES.map(t => (
          <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2.5 w-2.5 rounded-full ${EVENT_TYPE_DOTS[t]}`} />
            <span className="capitalize">{t}</span>
            <span className="font-mono">({typeCounts[t]})</span>
          </div>
        ))}
      </div>

      {/* Calendar body */}
      <div className="glass-card rounded-xl overflow-hidden">
        {view === "month" && <MonthView days={getMonthDays(currentDate)} events={filtered} current={currentDate} onDayClick={openNewOnDay} onEventClick={setDetail} />}
        {view === "week" && <WeekView days={getWeekDays(currentDate)} events={filtered} onSlotClick={openNewOnDay} onEventClick={setDetail} />}
        {view === "day" && <DayView day={currentDate} events={filtered} onSlotClick={() => openNewOnDay(currentDate)} onEventClick={setDetail} />}
      </div>

      {/* Dialogs */}
      <EventFormDialog open={dialogOpen} onOpenChange={setDialogOpen} event={editing} onSave={handleSave} defaultStart={defaultStart} />
      <EventDetail event={detail} onClose={() => setDetail(null)} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

/* ── Month View ── */
function MonthView({ days, events, current, onDayClick, onEventClick }: {
  days: Date[]; events: CalendarEvent[]; current: Date;
  onDayClick: (d: Date) => void; onEventClick: (e: CalendarEvent) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-7 border-b border-border">
        {WEEK_HEADERS.map(h => (
          <div key={h} className="p-2 text-center text-xs font-semibold text-muted-foreground">{h}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(events, day);
          const inMonth = isSameMonth(day, current);
          const today = isToday(day);
          return (
            <div
              key={i}
              className={`min-h-[100px] border-b border-r border-border p-1.5 cursor-pointer transition-colors hover:bg-muted/30 ${!inMonth ? "opacity-40" : ""}`}
              onClick={() => onDayClick(day)}
            >
              <span className={`text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${today ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate cursor-pointer border ${EVENT_TYPE_COLORS[ev.type]}`}
                    onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                    title={ev.title}
                  >
                    {formatEventTime(ev.start)} {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} más</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Week View ── */
function WeekView({ days, events, onSlotClick, onEventClick }: {
  days: Date[]; events: CalendarEvent[];
  onSlotClick: (d: Date) => void; onEventClick: (e: CalendarEvent) => void;
}) {
  const hours = getHourSlots();
  return (
    <div className="overflow-x-auto">
      {/* Header */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border sticky top-0 bg-card z-10">
        <div className="p-2" />
        {days.map((d, i) => (
          <div key={i} className={`p-2 text-center border-l border-border ${isToday(d) ? "bg-primary/10" : ""}`}>
            <div className="text-[10px] uppercase text-muted-foreground">{format(d, "EEE", { locale: es })}</div>
            <div className={`text-sm font-bold ${isToday(d) ? "text-primary" : "text-foreground"}`}>{format(d, "d")}</div>
          </div>
        ))}
      </div>
      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        {hours.map(h => (
          <div key={h} className="contents">
            <div className="h-14 flex items-start justify-end pr-2 pt-0.5 text-[10px] text-muted-foreground border-b border-border">
              {String(h).padStart(2, "0")}:00
            </div>
            {days.map((d, di) => {
              const cellEvents = events.filter(ev => {
                const start = parseISO(ev.start);
                return isSameDay(start, d) && start.getHours() === h;
              });
              return (
                <div
                  key={di}
                  className="h-14 border-b border-l border-border relative cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => onSlotClick(d)}
                >
                  {cellEvents.map(ev => (
                    <div
                      key={ev.id}
                      className={`absolute inset-x-0.5 top-0.5 text-[10px] px-1 py-0.5 rounded truncate cursor-pointer border ${EVENT_TYPE_COLORS[ev.type]}`}
                      onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Day View ── */
function DayView({ day, events, onSlotClick, onEventClick }: {
  day: Date; events: CalendarEvent[];
  onSlotClick: () => void; onEventClick: (e: CalendarEvent) => void;
}) {
  const hours = getHourSlots();
  const dayEvents = getEventsForDay(events, day);

  return (
    <div>
      <div className="p-3 border-b border-border text-center">
        <span className="text-lg font-bold capitalize">{format(day, "EEEE", { locale: es })}</span>
        <span className="text-lg text-muted-foreground ml-2">{format(day, "dd MMMM yyyy", { locale: es })}</span>
      </div>
      <div>
        {hours.map(h => {
          const hourEvents = dayEvents.filter(ev => parseISO(ev.start).getHours() === h);
          return (
            <div key={h} className="flex border-b border-border min-h-[56px] cursor-pointer hover:bg-muted/20 transition-colors" onClick={onSlotClick}>
              <div className="w-16 flex-shrink-0 flex items-start justify-end pr-3 pt-1 text-xs text-muted-foreground">
                {String(h).padStart(2, "0")}:00
              </div>
              <div className="flex-1 p-1 space-y-0.5 border-l border-border">
                {hourEvents.map(ev => (
                  <div
                    key={ev.id}
                    className={`text-xs px-2 py-1.5 rounded cursor-pointer border ${EVENT_TYPE_COLORS[ev.type]}`}
                    onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                  >
                    <span className="font-medium">{formatEventTime(ev.start)} - {formatEventTime(ev.end)}</span>
                    <span className="ml-2">{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
