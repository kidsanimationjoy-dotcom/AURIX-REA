CREATE OR REPLACE FUNCTION public.enforce_single_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id <> NEW.id) THEN
    RAISE EXCEPTION 'This workspace already has an owner. Registration is closed.';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER enforce_single_owner BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.enforce_single_owner();

CREATE OR REPLACE FUNCTION public.workspace_has_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users)
$$;
GRANT EXECUTE ON FUNCTION public.workspace_has_owner() TO anon, authenticated;

CREATE TABLE public.investigations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  target_type text NOT NULL CHECK (target_type IN ('website','android_apk','javascript_electron','dotnet','firmware','native_binary','database','network_capture','other')),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 120),
  target_reference text CHECK (target_reference IS NULL OR char_length(target_reference) <= 2048),
  purpose text NOT NULL CHECK (char_length(purpose) BETWEEN 1 AND 1000),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 5000),
  authorized boolean NOT NULL CHECK (authorized = true),
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigations TO authenticated;
GRANT ALL ON public.investigations TO service_role;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all investigations" ON public.investigations FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER investigations_touch BEFORE UPDATE ON public.investigations
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  investigation_id uuid NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  file_name text NOT NULL CHECK (char_length(file_name) BETWEEN 1 AND 255),
  size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
  mime_type text NOT NULL,
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  storage_path text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX evidence_investigation_idx ON public.evidence_items(investigation_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_items TO authenticated;
GRANT ALL ON public.evidence_items TO service_role;
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all evidence" ON public.evidence_items FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  investigation_id uuid REFERENCES public.investigations(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (char_length(action) <= 300),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all activity" ON public.activity_log FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner read evidence files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "owner upload evidence files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "owner delete evidence files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = auth.uid()::text);