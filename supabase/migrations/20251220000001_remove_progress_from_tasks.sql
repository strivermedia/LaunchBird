-- Remove manual progress field (no longer used; progress is derived from status/subtasks)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tasks_progress_range'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_progress_range;
  END IF;
END $$;

ALTER TABLE IF EXISTS tasks
  DROP COLUMN IF EXISTS progress;



