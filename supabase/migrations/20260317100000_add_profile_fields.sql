-- Add new profile fields for general info and CV
ALTER TABLE public.profiles
ADD COLUMN nombre TEXT DEFAULT '',
ADD COLUMN apellido TEXT DEFAULT '',
ADD COLUMN celular TEXT DEFAULT '',
ADD COLUMN github TEXT DEFAULT '',
ADD COLUMN linkedin TEXT DEFAULT '',
ADD COLUMN ciudad TEXT DEFAULT '',
ADD COLUMN pais TEXT DEFAULT '',
ADD COLUMN direccion TEXT DEFAULT '',
ADD COLUMN cargo TEXT DEFAULT '',
ADD COLUMN estudios TEXT DEFAULT '';