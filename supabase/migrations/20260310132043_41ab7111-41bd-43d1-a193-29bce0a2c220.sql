-- Add missing doc_type values
ALTER TYPE public.doc_type ADD VALUE IF NOT EXISTS 'NIT';
ALTER TYPE public.doc_type ADD VALUE IF NOT EXISTS 'CC';
ALTER TYPE public.doc_type ADD VALUE IF NOT EXISTS 'CE';
ALTER TYPE public.doc_type ADD VALUE IF NOT EXISTS 'Pasaporte';
ALTER TYPE public.doc_type ADD VALUE IF NOT EXISTS 'RUC';