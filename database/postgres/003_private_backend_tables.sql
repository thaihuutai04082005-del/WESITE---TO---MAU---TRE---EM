-- TinyTints authenticates through its Node backend, using the database owner.
-- Supabase's public Data API must not expose account hashes, OTPs or saved art.
-- Owners retain access; no client-side Supabase policies are needed by this app.
DO $private_backend$
DECLARE
  app_table TEXT;
  api_role TEXT;
BEGIN
  FOREACH app_table IN ARRAY ARRAY[
    '_postgres_migrations', 'users', 'otp_codes', 'themes', 'missions',
    'exhibition_rounds', 'app_settings', 'items', 'user_stats', 'objects',
    'usage_log', 'user_missions', 'user_items', 'friendships', 'storybooks',
    'notifications', 'payments', 'recurring', 'pictures', 'subscriptions',
    'artworks', 'user_cards', 'gacha_pulls', 'arena_rooms', 'trades',
    'arena_entries', 'storybook_pages', 'exhibition_entries',
    'exhibition_reactions', 'exhibition_reports'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', app_table);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', app_table);
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', app_table, api_role);
      END IF;
    END LOOP;
  END LOOP;
END;
$private_backend$;
