CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expiration TIMESTAMPTZ NULL
);

INSERT INTO
  users (id, username, email, password)
VALUES
  (
    1,
    linh,
    'suplohong271001@gmail.com',
    'password123'
  ),
  (2, vy, 'example@gmail.com', 'password12233') ON CONFLICT DO NOTHING;