ALTER TABLE entry_images RENAME COLUMN public_id TO storage_key;
ALTER TABLE entry_images DROP COLUMN image_url;