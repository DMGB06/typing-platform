BEGIN;

ALTER TABLE user_stats_by_difficulty
  ADD COLUMN accuracy_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN error_rate_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN wpm_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE typing_sessions ADD COLUMN attempt_id UUID;

CREATE TABLE typing_attempts (
  id UUID NOT NULL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  text_id INTEGER NOT NULL REFERENCES texts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  difficulty_id INTEGER NOT NULL REFERENCES difficulties(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  content_hash TEXT NOT NULL,
  events_hash TEXT,
  started_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP(3) NOT NULL
);

CREATE INDEX typing_attempts_difficulty_id_user_id_idx ON typing_attempts(difficulty_id, user_id);
CREATE INDEX typing_attempts_user_id_idx ON typing_attempts(user_id);
CREATE INDEX typing_attempts_text_id_idx ON typing_attempts(text_id);
CREATE UNIQUE INDEX typing_sessions_attempt_id_key ON typing_sessions(attempt_id);
CREATE INDEX idx_user_text_sessions ON typing_sessions(user_id, text_id, created_at DESC, id DESC);

CREATE INDEX idx_verified_text_top ON typing_sessions(text_id, wpm DESC, accuracy DESC, id)
  WHERE attempt_id IS NOT NULL;
CREATE INDEX idx_verified_user_best ON typing_sessions(user_id, text_id, wpm DESC)
  WHERE attempt_id IS NOT NULL;

ALTER TABLE typing_sessions ADD CONSTRAINT typing_sessions_attempt_id_fkey
  FOREIGN KEY (attempt_id) REFERENCES typing_attempts(id) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT;
