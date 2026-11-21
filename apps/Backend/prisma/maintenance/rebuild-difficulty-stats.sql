WITH totals AS MATERIALIZED (
  SELECT s.user_id, COALESCE(a.difficulty_id, t.difficulty_id) AS difficulty_id,
    COALESCE(MAX(s.wpm), 0) AS best_wpm,
    COALESCE(AVG(s.wpm), 0) AS avg_wpm,
    COALESCE(AVG(s.accuracy), 0) AS avg_accuracy,
    COALESCE(AVG(s.error_rate), 0) AS avg_error_rate,
    COUNT(*) AS total_sessions,
    COALESCE(SUM(s.time_seconds), 0) AS total_time_seconds,
    COUNT(s.wpm) AS wpm_count,
    COUNT(s.accuracy) AS accuracy_count,
    COUNT(s.error_rate) AS error_rate_count
  FROM typing_sessions s
  JOIN texts t ON t.id = s.text_id
  LEFT JOIN typing_attempts a ON a.id = s.attempt_id
  GROUP BY s.user_id, COALESCE(a.difficulty_id, t.difficulty_id)
), updated AS (
  INSERT INTO user_stats_by_difficulty (
    user_id, difficulty_id, best_wpm, avg_wpm, avg_accuracy, avg_error_rate,
    total_sessions, total_time_seconds, wpm_count, accuracy_count, error_rate_count
  )
  SELECT * FROM totals
  ON CONFLICT (user_id, difficulty_id) DO UPDATE SET
    best_wpm = EXCLUDED.best_wpm,
    avg_wpm = EXCLUDED.avg_wpm,
    avg_accuracy = EXCLUDED.avg_accuracy,
    avg_error_rate = EXCLUDED.avg_error_rate,
    total_sessions = EXCLUDED.total_sessions,
    total_time_seconds = EXCLUDED.total_time_seconds,
    wpm_count = EXCLUDED.wpm_count,
    accuracy_count = EXCLUDED.accuracy_count,
    error_rate_count = EXCLUDED.error_rate_count
)
DELETE FROM user_stats_by_difficulty s
WHERE NOT EXISTS (
  SELECT 1 FROM totals t WHERE t.user_id = s.user_id AND t.difficulty_id = s.difficulty_id
);
