#!/usr/bin/env bash
set -euo pipefail

clean_url="${DATABASE_URL%%\?*}"
db_prefix="text_type_recovery_$$"
intact_db="${db_prefix}_intact"
dropped_db="${db_prefix}_dropped"
base="${clean_url%/*}"
work="$(mktemp -d)"

cleanup() {
  psql -X "$clean_url" -c "DROP DATABASE IF EXISTS $intact_db WITH (FORCE)" >/dev/null
  psql -X "$clean_url" -c "DROP DATABASE IF EXISTS $dropped_db WITH (FORCE)" >/dev/null
  rm -f "$work/recovery-error.txt"
  rmdir "$work"
}
trap cleanup EXIT

psql_cmd() {
  psql -X -v ON_ERROR_STOP=1 "$@"
}

prisma() {
  DATABASE_URL="$recovery_url" npm exec -- prisma "$@"
}

recover() {
  psql_cmd "$recovery_url" \
    -f prisma/maintenance/stage-text-type-recovery.sql \
    "$@" \
    -f prisma/maintenance/recover-text-types.sql
}

expect_recovery_failure() {
  local message="$1"
  shift
  if recover "$@" >"$work/recovery-error.txt" 2>&1; then
    echo "Recovery unexpectedly succeeded"
    exit 1
  fi
  if ! grep -F "$message" "$work/recovery-error.txt"; then
    cat "$work/recovery-error.txt"
    exit 1
  fi
  [[ "$(psql_cmd "$recovery_url" -Atc "SELECT title FROM texts WHERE id = 42")" == "Historic text" ]]
  [[ "$(psql_cmd "$recovery_url" -Atc "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'texts' AND column_name = 'created_by_id'")" == "0" ]]
}

for database in "$intact_db" "$dropped_db"; do
  psql_cmd "$clean_url" -c "CREATE DATABASE $database"
  recovery_url="$base/$database"
  for migration in 20260208032744_init 20260209040928_add_is_active_to_user; do
    psql_cmd "$recovery_url" -f "prisma/migrations/$migration/migration.sql"
    prisma migrate resolve --applied "$migration"
  done
  psql_cmd "$recovery_url" -f test/fixtures/legacy-texts.sql

  author="INSERT INTO recovery_authors VALUES (42, 7)"
  catalog="INSERT INTO recovery_text_types VALUES (19, 'Historical', 'Original description', false, '2020-01-02 03:04:05')"
  sequence="INSERT INTO recovery_type_sequence VALUES (31, true)"

  if [[ "$database" == "$dropped_db" ]]; then
    if prisma migrate deploy; then
      echo "Expected the historical migration to fail on populated texts"
      exit 1
    fi
    [[ "$(psql_cmd "$recovery_url" -Atc "SELECT to_regclass('public.text_types') IS NULL")" == "t" ]]
    expect_recovery_failure "missing text-type references" -c "$author" -c "$sequence"
    [[ "$(psql_cmd "$recovery_url" -Atc "SELECT to_regclass('public.text_types') IS NULL")" == "t" ]]
    recover -c "$author" -c "$catalog" -c "$sequence"
  else
    expect_recovery_failure "approved existing author" -c "INSERT INTO recovery_authors VALUES (42, 999)"
    [[ "$(psql_cmd "$recovery_url" -Atc 'SELECT last_value FROM text_types_id_seq')" == "31" ]]
    recover -c "$author"
    prisma migrate resolve --applied 20260216051506_remove_text_types
  fi
  [[ "$(psql_cmd "$recovery_url" -Atc "
    SELECT t.id, t.type_id, t.created_by_id, tt.name, tt.description, tt.is_active, tt.created_at, s.id, s.wpm
    FROM texts t JOIN text_types tt ON tt.id = t.type_id JOIN typing_sessions s ON s.text_id = t.id
  ")" == "42|19|7|Historical|Original description|f|2020-01-02 03:04:05|71|400" ]]
  [[ "$(psql_cmd "$recovery_url" -Atc "SELECT nextval('text_types_id_seq')")" == "32" ]]
  prisma migrate resolve --applied 20260216054113_remove_text_types
  prisma migrate deploy
  prisma migrate diff --from-url "$clean_url" --to-url "$recovery_url" --exit-code
done
