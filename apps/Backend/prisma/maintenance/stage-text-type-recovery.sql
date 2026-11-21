\set ON_ERROR_STOP on
BEGIN;
CREATE TEMP TABLE recovery_authors (
  text_id integer PRIMARY KEY,
  user_id integer NOT NULL
) ON COMMIT DROP;
CREATE TEMP TABLE recovery_text_types (
  id integer PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL,
  created_at timestamp(3) NOT NULL
) ON COMMIT DROP;
CREATE TEMP TABLE recovery_type_sequence (
  last_value bigint NOT NULL,
  is_called boolean NOT NULL
) ON COMMIT DROP;
