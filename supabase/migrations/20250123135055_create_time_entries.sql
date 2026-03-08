-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  description TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries table
CREATE POLICY "Users can view time entries in their organization" ON time_entries
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can create time entries in their organization" ON time_entries
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update time entries in their organization" ON time_entries
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can delete time entries in their organization" ON time_entries
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_organization_id ON time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_end_time ON time_entries(end_time);

-- Create trigger for updated_at
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE time_entries IS 'Time tracking entries for tasks and projects';
COMMENT ON COLUMN time_entries.duration IS 'Duration in minutes, calculated from start_time and end_time if not provided';

















