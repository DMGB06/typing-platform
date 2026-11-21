INSERT INTO users (id, username, email, password_hash)
VALUES (7, 'legacy-owner', 'legacy-owner@test.invalid', 'unused');
INSERT INTO difficulties (id, name) VALUES (5, 'Legacy');
INSERT INTO languages (id, code, name) VALUES (3, 'es', 'Spanish');
INSERT INTO text_types (id, name, description, is_active, created_at)
VALUES (19, 'Historical', 'Original description', false, '2020-01-02 03:04:05');
SELECT setval('text_types_id_seq', 31, true);
INSERT INTO texts (id, title, content, difficulty_id, type_id, language_id, created_by)
VALUES (42, 'Historic text', 'Historic content', 5, 19, 3, 'AI');
INSERT INTO typing_sessions (id, user_id, text_id, wpm, accuracy, time_seconds)
VALUES (71, 7, 42, 400, 100, 10);
