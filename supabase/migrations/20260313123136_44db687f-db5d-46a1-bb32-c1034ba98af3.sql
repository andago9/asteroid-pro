
-- Add client_name and assigned_by columns to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS client_name text DEFAULT '';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_by text DEFAULT '';

-- Create accounts_receivable table for CxC module
CREATE TABLE IF NOT EXISTS public.accounts_receivable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL DEFAULT '',
  product_service text NOT NULL DEFAULT '',
  concept text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  frequency text NOT NULL DEFAULT 'Pago único',
  start_date text NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'::text),
  due_date text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Pendiente',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read accounts_receivable" ON public.accounts_receivable FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write accounts_receivable" ON public.accounts_receivable FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update accounts_receivable" ON public.accounts_receivable FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete accounts_receivable" ON public.accounts_receivable FOR DELETE TO anon, authenticated USING (true);

CREATE TRIGGER handle_accounts_receivable_updated_at BEFORE UPDATE ON public.accounts_receivable FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
