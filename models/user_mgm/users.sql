CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar_url VARCHAR NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expiration TIMESTAMPTZ NULL
);
