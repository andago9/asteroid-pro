-- Fix client_source: add WhatsApp
ALTER TYPE public.client_source ADD VALUE IF NOT EXISTS 'WhatsApp';

-- Fix interaction_type: add WhatsApp, Email (app uses Email but DB has Correo)
-- We'll keep DB values and map in the hook

-- Fix ticket_priority: app uses "Crítica" but DB has "Urgente" - will map in hook

-- Fix resource_type: add "Aplicación" 
ALTER TYPE public.resource_type ADD VALUE IF NOT EXISTS 'Aplicación';

-- Fix monitor_frequency: add "30m" is already there, but app is missing "1h"
-- This is app-side only, no DB change needed