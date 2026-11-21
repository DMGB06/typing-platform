WITH totals AS MATERIALIZED (
  SELECT user_id, text_id, MAX(created_at) AS last_attempt_at,
    COUNT(*) AS total_attempts, MAX(wpm) AS best_wpm, MAX(accuracy) AS best_accuracy
  FROM typing_sessions
  GROUP BY user_id, text_id
), updated AS (
  INSERT INTO user_text_history (
    user_id, text_id, last_attempt_at, total_attempts, best_wpm, best_accuracy
  )
  SELECT * FROM totals
  ON CONFLICT (user_id, text_id) DO UPDATE SET
    last_attempt_at = EXCLUDED.last_attempt_at,
    total_attempts = EXCLUDED.total_attempts,
    best_wpm = EXCLUDED.best_wpm,
    best_accuracy = EXCLUDED.best_accuracy
)
DELETE FROM user_text_history h
WHERE NOT EXISTS (
  SELECT 1 FROM totals t WHERE t.user_id = h.user_id AND t.text_id = h.text_id
);
