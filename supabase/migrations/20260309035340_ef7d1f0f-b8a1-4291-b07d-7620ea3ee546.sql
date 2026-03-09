
-- ═══════════════════════════════════════════════════════
-- PAMI ERP – Full Schema Migration
-- ═══════════════════════════════════════════════════════

-- ── ENUMS ──────────────────────────────────────────────
CREATE TYPE public.client_status AS ENUM ('Activo','Inactivo','Prospecto','Suspendido');
CREATE TYPE public.client_source AS ENUM ('Referido','Web','Redes sociales','Llamada','Evento','Otro');
CREATE TYPE public.interaction_type AS ENUM ('Llamada','Correo','Reunión','Nota','Soporte');
CREATE TYPE public.doc_type AS ENUM ('RFC','INE','Contrato','Otro');

CREATE TYPE public.product_status AS ENUM ('Activo','Pausado','Descontinuado');
CREATE TYPE public.product_type AS ENUM ('Producto','Servicio');

CREATE TYPE public.invoice_status AS ENUM ('Borrador','Enviada','Pagada','Parcial','Vencida','Cancelada');
CREATE TYPE public.payment_method_type AS ENUM ('Efectivo','Transferencia','Tarjeta','Nequi','Daviplata','PayPal','Otro');

CREATE TYPE public.quote_status AS ENUM ('Borrador','Enviada','Aceptada','Rechazada','Convertida','Vencida');

CREATE TYPE public.ticket_status AS ENUM ('Abierto','En progreso','Esperando','Resuelto','Cerrado');
CREATE TYPE public.ticket_priority AS ENUM ('Baja','Media','Alta','Urgente');
CREATE TYPE public.ticket_type AS ENUM ('Soporte','Bug','Feature','Consulta');

CREATE TYPE public.movement_type AS ENUM ('Ingreso','Gasto');
CREATE TYPE public.movement_status AS ENUM ('Pendiente','Confirmado');

CREATE TYPE public.event_type AS ENUM ('reunión','tarea','soporte','recordatorio','general');
CREATE TYPE public.event_priority AS ENUM ('alta','media','baja');

CREATE TYPE public.resource_type AS ENUM ('Servidor','API','Web','Base de datos','Servicio');
CREATE TYPE public.resource_status AS ENUM ('Operativo','Degradado','Caído','Mantenimiento');
CREATE TYPE public.monitor_frequency AS ENUM ('30s','1m','5m','15m','30m','1h');

CREATE TYPE public.task_status AS ENUM ('pendiente','en_progreso','revision','completada');

CREATE TYPE public.project_status AS ENUM ('En progreso','Completado','Pausado','Cancelado');

-- ── CLIENTS ────────────────────────────────────────────
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  sector TEXT DEFAULT '',
  source public.client_source DEFAULT 'Otro',
  status public.client_status DEFAULT 'Prospecto',
  contact_channel TEXT DEFAULT '',
  doc_type public.doc_type DEFAULT 'Otro',
  doc_number TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.client_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  type public.interaction_type NOT NULL DEFAULT 'Nota',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PRODUCTS ───────────────────────────────────────────
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.product_type DEFAULT 'Servicio',
  description TEXT DEFAULT '',
  price NUMERIC(12,2) DEFAULT 0,
  status public.product_status DEFAULT 'Activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── INVOICES ───────────────────────────────────────────
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT DEFAULT '',
  date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  due_date TEXT NOT NULL DEFAULT to_char(now() + interval '30 days', 'YYYY-MM-DD'),
  status public.invoice_status DEFAULT 'Borrador',
  discount NUMERIC(5,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 16,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  method public.payment_method_type DEFAULT 'Transferencia',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reference TEXT DEFAULT '',
  notes TEXT DEFAULT ''
);

-- ── SALES / QUOTES ─────────────────────────────────────
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT DEFAULT '',
  seller TEXT DEFAULT '',
  date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  valid_until TEXT DEFAULT '',
  status public.quote_status DEFAULT 'Borrador',
  tax_rate NUMERIC(5,2) DEFAULT 16,
  general_discount NUMERIC(5,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(5,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE public.quote_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_name TEXT DEFAULT 'Sistema'
);

-- ── HELPDESK ───────────────────────────────────────────
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT DEFAULT '',
  status public.ticket_status DEFAULT 'Abierto',
  priority public.ticket_priority DEFAULT 'Media',
  type public.ticket_type DEFAULT 'Soporte',
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT DEFAULT '',
  assigned_agent TEXT DEFAULT '',
  department TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL DEFAULT 'Sistema',
  body TEXT NOT NULL DEFAULT '',
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_name TEXT DEFAULT 'Sistema'
);

-- ── FINANCE ────────────────────────────────────────────
CREATE TABLE public.finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.movement_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.finance_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.finance_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.movement_type NOT NULL DEFAULT 'Ingreso',
  date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES public.finance_payment_methods(id) ON DELETE SET NULL,
  client TEXT DEFAULT '',
  provider TEXT DEFAULT '',
  description TEXT DEFAULT '',
  status public.movement_status DEFAULT 'Pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CALENDAR ───────────────────────────────────────────
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  type public.event_type DEFAULT 'general',
  priority public.event_priority DEFAULT 'media',
  responsible TEXT DEFAULT '',
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT DEFAULT '',
  project_name TEXT DEFAULT '',
  ticket_id TEXT DEFAULT '',
  task_name TEXT DEFAULT '',
  reminder TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── MONITOR ────────────────────────────────────────────
CREATE TABLE public.monitor_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.resource_type DEFAULT 'Servidor',
  url TEXT DEFAULT '',
  status public.resource_status DEFAULT 'Operativo',
  frequency public.monitor_frequency DEFAULT '5m',
  latency INTEGER DEFAULT 0,
  uptime NUMERIC(5,2) DEFAULT 100,
  last_check TIMESTAMPTZ DEFAULT now(),
  responsible TEXT DEFAULT '',
  notify_email TEXT DEFAULT '',
  notify_slack BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.monitor_latency_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.monitor_resources(id) ON DELETE CASCADE NOT NULL,
  time TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE public.monitor_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.monitor_resources(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration TEXT DEFAULT '',
  description TEXT DEFAULT '',
  resolved BOOLEAN DEFAULT false
);

-- ── PROJECTS ───────────────────────────────────────────
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status public.project_status DEFAULT 'En progreso',
  progress INTEGER DEFAULT 0,
  responsible TEXT DEFAULT '',
  client TEXT DEFAULT '',
  score_time NUMERIC(3,1) DEFAULT 5,
  score_budget NUMERIC(3,1) DEFAULT 5,
  score_scope NUMERIC(3,1) DEFAULT 5,
  score_quality NUMERIC(3,1) DEFAULT 5,
  score_risk NUMERIC(3,1) DEFAULT 5,
  score_client NUMERIC(3,1) DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── TASKS ──────────────────────────────────────────────
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  assignee TEXT DEFAULT '',
  status public.task_status DEFAULT 'pendiente',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name TEXT DEFAULT '',
  due_date TEXT DEFAULT '',
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── NOTIFICATIONS ──────────────────────────────────────
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  module TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  link TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── INDEXES ────────────────────────────────────────────
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_finance_movements_type ON public.finance_movements(type);
CREATE INDEX idx_finance_movements_date ON public.finance_movements(date);
CREATE INDEX idx_calendar_events_start ON public.calendar_events(start_time);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_monitor_resources_status ON public.monitor_resources(status);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);

-- ── UPDATED_AT TRIGGER ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_clients BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_quotes BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_tickets BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── RLS (public access for now – no auth yet) ──────────
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitor_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitor_latency_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitor_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public access policies (temporary until auth is implemented)
CREATE POLICY "Public access" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.client_interactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.invoice_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.quote_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.quote_activity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.ticket_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.ticket_activity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.finance_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.finance_payment_methods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.finance_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.monitor_resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.monitor_latency_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.monitor_incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
