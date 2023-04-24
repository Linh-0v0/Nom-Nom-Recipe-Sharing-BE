CREATE TABLE IF NOT EXISTS user_country_preferences (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country_preference_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, country_preference_id)
);