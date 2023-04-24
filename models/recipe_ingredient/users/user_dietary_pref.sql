CREATE TABLE IF NOT EXISTS user_dietary_preferences (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dietary_preference_name varchar NOT NULL REFERENCES dietary_pref(name) ON DELETE CASCADE,
  PRIMARY KEY (user_id, dietary_preference_name)
);