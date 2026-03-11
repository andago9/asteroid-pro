
-- Add status enum and column to profiles
CREATE TYPE public.user_status AS ENUM ('disponible', 'ocupado', 'ausente');

ALTER TABLE public.profiles 
ADD COLUMN status public.user_status DEFAULT 'disponible';
