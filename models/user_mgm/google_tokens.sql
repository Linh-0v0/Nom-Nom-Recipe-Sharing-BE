CREATE TABLE IF NOT EXISTS google_tokens (
    id SERIAL PRIMARY KEY,
    refresh_token VARCHAR(255) NULL,
    access_token VARCHAR(255) NULL,
    expires_in BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
)

