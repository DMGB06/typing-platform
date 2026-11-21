\set ON_ERROR_STOP on
LOCK TABLE public.texts IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.users IN SHARE MODE;

DO $recovery$
DECLARE
  catalog_exists boolean := to_regclass('public.text_types') IS NOT NULL;
  next_type_id bigint;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.texts t
    LEFT JOIN recovery_authors m ON m.text_id = t.id
    LEFT JOIN public.users u ON u.id = m.user_id
    WHERE u.id IS NULL
  ) OR EXISTS (
    SELECT 1 FROM recovery_authors m
    LEFT JOIN public.texts t ON t.id = m.text_id WHERE t.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Recovery needs exactly one approved existing author per text';
  END IF;

  IF catalog_exists THEN
    LOCK TABLE public.text_types IN SHARE MODE;
    IF EXISTS (
      SELECT 1 FROM public.texts t
      LEFT JOIN public.text_types tt ON tt.id = t.type_id WHERE tt.id IS NULL
    ) THEN
      RAISE EXCEPTION 'The existing text-type catalog has missing references';
    END IF;
  ELSE
    IF EXISTS (
      SELECT 1 FROM public.texts t
      LEFT JOIN recovery_text_types tt ON tt.id = t.type_id WHERE tt.id IS NULL
    ) THEN
      RAISE EXCEPTION 'The verified backup has missing text-type references';
    END IF;

    IF (SELECT COUNT(*) FROM recovery_type_sequence) <> 1 THEN
      RAISE EXCEPTION 'Recovery needs the catalog sequence state from the verified backup';
    END IF;
    SELECT last_value + is_called::int INTO next_type_id FROM recovery_type_sequence;
    IF next_type_id < 1 OR next_type_id > 2147483647 OR
       next_type_id <= COALESCE((SELECT MAX(id) FROM recovery_text_types), 0) THEN
      RAISE EXCEPTION 'The catalog sequence in the backup cannot allocate the next ID';
    END IF;

    CREATE TABLE public.text_types (
      id SERIAL NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX text_types_name_key ON public.text_types(name);
    INSERT INTO public.text_types (id, name, description, is_active, created_at)
    SELECT id, name, description, is_active, created_at FROM recovery_text_types;
    EXECUTE format('ALTER SEQUENCE public.text_types_id_seq RESTART WITH %s', next_type_id);
  END IF;

  ALTER TABLE public.texts ADD COLUMN IF NOT EXISTS created_by_id INTEGER;
  IF EXISTS (
    SELECT 1 FROM public.texts t JOIN recovery_authors m ON m.text_id = t.id
    WHERE t.created_by_id IS NOT NULL AND t.created_by_id <> m.user_id
  ) THEN
    RAISE EXCEPTION 'An existing author disagrees with the approved mapping';
  END IF;

  UPDATE public.texts t SET created_by_id = m.user_id
  FROM recovery_authors m WHERE m.text_id = t.id AND t.created_by_id IS NULL;

  ALTER TABLE public.texts
    ALTER COLUMN created_by_id SET NOT NULL,
    DROP COLUMN IF EXISTS created_by,
    DROP CONSTRAINT IF EXISTS texts_created_by_id_fkey,
    DROP CONSTRAINT IF EXISTS texts_type_id_fkey,
    ADD CONSTRAINT texts_created_by_id_fkey FOREIGN KEY (created_by_id)
      REFERENCES public.users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT texts_type_id_fkey FOREIGN KEY (type_id)
      REFERENCES public.text_types(id) ON DELETE RESTRICT ON UPDATE CASCADE;

  DROP TYPE IF EXISTS public."CreatedBy";
END
$recovery$;

COMMIT;
