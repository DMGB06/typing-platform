\set ON_ERROR_STOP on
BEGIN;
LOCK TABLE typing_sessions, texts IN SHARE MODE;
LOCK TABLE user_stats_by_difficulty, user_text_history IN SHARE ROW EXCLUSIVE MODE;
\ir rebuild-difficulty-stats.sql
\ir rebuild-text-history.sql
COMMIT;
