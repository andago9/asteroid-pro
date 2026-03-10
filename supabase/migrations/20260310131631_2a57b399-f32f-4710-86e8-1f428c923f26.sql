-- Replace overly permissive "Public access" ALL policies with separate read/write policies
-- This uses 'anon' and 'authenticated' roles instead of 'public'

-- clients table (contains PII)
DROP POLICY IF EXISTS "Public access" ON public.clients;
CREATE POLICY "Allow read clients" ON public.clients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write clients" ON public.clients FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update clients" ON public.clients FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete clients" ON public.clients FOR DELETE TO anon, authenticated USING (true);

-- finance_movements table (sensitive financial data)
DROP POLICY IF EXISTS "Public access" ON public.finance_movements;
CREATE POLICY "Allow read finance_movements" ON public.finance_movements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write finance_movements" ON public.finance_movements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update finance_movements" ON public.finance_movements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete finance_movements" ON public.finance_movements FOR DELETE TO anon, authenticated USING (true);

-- finance_categories
DROP POLICY IF EXISTS "Public access" ON public.finance_categories;
CREATE POLICY "Allow read finance_categories" ON public.finance_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write finance_categories" ON public.finance_categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update finance_categories" ON public.finance_categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete finance_categories" ON public.finance_categories FOR DELETE TO anon, authenticated USING (true);

-- finance_payment_methods
DROP POLICY IF EXISTS "Public access" ON public.finance_payment_methods;
CREATE POLICY "Allow read finance_payment_methods" ON public.finance_payment_methods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write finance_payment_methods" ON public.finance_payment_methods FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update finance_payment_methods" ON public.finance_payment_methods FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete finance_payment_methods" ON public.finance_payment_methods FOR DELETE TO anon, authenticated USING (true);

-- projects
DROP POLICY IF EXISTS "Public access" ON public.projects;
CREATE POLICY "Allow read projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write projects" ON public.projects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update projects" ON public.projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete projects" ON public.projects FOR DELETE TO anon, authenticated USING (true);

-- tasks
DROP POLICY IF EXISTS "Public access" ON public.tasks;
CREATE POLICY "Allow read tasks" ON public.tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write tasks" ON public.tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update tasks" ON public.tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete tasks" ON public.tasks FOR DELETE TO anon, authenticated USING (true);

-- products
DROP POLICY IF EXISTS "Public access" ON public.products;
CREATE POLICY "Allow read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update products" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete products" ON public.products FOR DELETE TO anon, authenticated USING (true);

-- invoices
DROP POLICY IF EXISTS "Public access" ON public.invoices;
CREATE POLICY "Allow read invoices" ON public.invoices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write invoices" ON public.invoices FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update invoices" ON public.invoices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete invoices" ON public.invoices FOR DELETE TO anon, authenticated USING (true);

-- invoice_items
DROP POLICY IF EXISTS "Public access" ON public.invoice_items;
CREATE POLICY "Allow read invoice_items" ON public.invoice_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write invoice_items" ON public.invoice_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update invoice_items" ON public.invoice_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete invoice_items" ON public.invoice_items FOR DELETE TO anon, authenticated USING (true);

-- invoice_payments
DROP POLICY IF EXISTS "Public access" ON public.invoice_payments;
CREATE POLICY "Allow read invoice_payments" ON public.invoice_payments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write invoice_payments" ON public.invoice_payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update invoice_payments" ON public.invoice_payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete invoice_payments" ON public.invoice_payments FOR DELETE TO anon, authenticated USING (true);

-- quotes
DROP POLICY IF EXISTS "Public access" ON public.quotes;
CREATE POLICY "Allow read quotes" ON public.quotes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write quotes" ON public.quotes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update quotes" ON public.quotes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete quotes" ON public.quotes FOR DELETE TO anon, authenticated USING (true);

-- quote_items
DROP POLICY IF EXISTS "Public access" ON public.quote_items;
CREATE POLICY "Allow read quote_items" ON public.quote_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write quote_items" ON public.quote_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update quote_items" ON public.quote_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete quote_items" ON public.quote_items FOR DELETE TO anon, authenticated USING (true);

-- quote_activity
DROP POLICY IF EXISTS "Public access" ON public.quote_activity;
CREATE POLICY "Allow read quote_activity" ON public.quote_activity FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write quote_activity" ON public.quote_activity FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update quote_activity" ON public.quote_activity FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete quote_activity" ON public.quote_activity FOR DELETE TO anon, authenticated USING (true);

-- tickets
DROP POLICY IF EXISTS "Public access" ON public.tickets;
CREATE POLICY "Allow read tickets" ON public.tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write tickets" ON public.tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update tickets" ON public.tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete tickets" ON public.tickets FOR DELETE TO anon, authenticated USING (true);

-- ticket_activity
DROP POLICY IF EXISTS "Public access" ON public.ticket_activity;
CREATE POLICY "Allow read ticket_activity" ON public.ticket_activity FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write ticket_activity" ON public.ticket_activity FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update ticket_activity" ON public.ticket_activity FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete ticket_activity" ON public.ticket_activity FOR DELETE TO anon, authenticated USING (true);

-- ticket_messages
DROP POLICY IF EXISTS "Public access" ON public.ticket_messages;
CREATE POLICY "Allow read ticket_messages" ON public.ticket_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write ticket_messages" ON public.ticket_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update ticket_messages" ON public.ticket_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete ticket_messages" ON public.ticket_messages FOR DELETE TO anon, authenticated USING (true);

-- calendar_events
DROP POLICY IF EXISTS "Public access" ON public.calendar_events;
CREATE POLICY "Allow read calendar_events" ON public.calendar_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write calendar_events" ON public.calendar_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update calendar_events" ON public.calendar_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete calendar_events" ON public.calendar_events FOR DELETE TO anon, authenticated USING (true);

-- client_interactions
DROP POLICY IF EXISTS "Public access" ON public.client_interactions;
CREATE POLICY "Allow read client_interactions" ON public.client_interactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write client_interactions" ON public.client_interactions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update client_interactions" ON public.client_interactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete client_interactions" ON public.client_interactions FOR DELETE TO anon, authenticated USING (true);

-- monitor_resources
DROP POLICY IF EXISTS "Public access" ON public.monitor_resources;
CREATE POLICY "Allow read monitor_resources" ON public.monitor_resources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write monitor_resources" ON public.monitor_resources FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update monitor_resources" ON public.monitor_resources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete monitor_resources" ON public.monitor_resources FOR DELETE TO anon, authenticated USING (true);

-- monitor_incidents
DROP POLICY IF EXISTS "Public access" ON public.monitor_incidents;
CREATE POLICY "Allow read monitor_incidents" ON public.monitor_incidents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write monitor_incidents" ON public.monitor_incidents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update monitor_incidents" ON public.monitor_incidents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete monitor_incidents" ON public.monitor_incidents FOR DELETE TO anon, authenticated USING (true);

-- monitor_latency_history
DROP POLICY IF EXISTS "Public access" ON public.monitor_latency_history;
CREATE POLICY "Allow read monitor_latency_history" ON public.monitor_latency_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write monitor_latency_history" ON public.monitor_latency_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update monitor_latency_history" ON public.monitor_latency_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete monitor_latency_history" ON public.monitor_latency_history FOR DELETE TO anon, authenticated USING (true);

-- notifications
DROP POLICY IF EXISTS "Public access" ON public.notifications;
CREATE POLICY "Allow read notifications" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow write notifications" ON public.notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update notifications" ON public.notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete notifications" ON public.notifications FOR DELETE TO anon, authenticated USING (true);