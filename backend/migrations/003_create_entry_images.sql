CREATE TABLE entry_images (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  public_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);