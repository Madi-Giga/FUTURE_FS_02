
-- Set search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke public execute on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Scope public lead insert policy (status must default to 'new', no notes attached)
DROP POLICY "Anyone can create lead" ON public.leads;
CREATE POLICY "Anyone can create lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new');
