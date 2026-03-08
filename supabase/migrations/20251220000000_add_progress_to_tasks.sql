-- Add manual progress override to tasks
-- Nullable so UI can fall back to derived progress when unset.

ALTER TABLE IF EXISTS tasks
  ADD COLUMN IF NOT EXISTS progress INTEGER;

DO $$
BEGIN
  -- Ensure progress stays within 0-100 when set
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tasks_progress_range'
  ) THEN
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_progress_range CHECK (progress IS NULL OR (progress >= 0 AND progress <= 100));
  END IF;
END $$;



