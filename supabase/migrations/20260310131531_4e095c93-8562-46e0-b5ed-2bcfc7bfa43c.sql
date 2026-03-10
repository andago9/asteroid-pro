-- Add missing values to project_status enum
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'Idea';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'Planeación';