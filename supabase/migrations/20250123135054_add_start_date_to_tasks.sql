-- Add start_date column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;

-- Add index for start_date for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);

-- Add comment
COMMENT ON COLUMN tasks.start_date IS 'Start date for the task, used for calendar and Gantt chart views';

















