-- LaunchBird Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'team_member', 'client')),
  title TEXT,
  job_title TEXT,
  location TEXT,
  profile_image_url TEXT,
  theme TEXT DEFAULT 'light',
  organization_id UUID,
  organization_role TEXT CHECK (organization_role IN ('owner', 'admin', 'member', 'client')),
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client portal codes table
CREATE TABLE IF NOT EXISTS client_portal_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  project_id UUID NOT NULL,
  password TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  client_id UUID,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  address TEXT,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT[] DEFAULT '{}',
  assigned_to_names TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL,
  created_by_name TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  project_title TEXT,
  parent_task_id UUID REFERENCES tasks(id), -- For subtasks
  dependencies TEXT[] DEFAULT '{}', -- Array of task IDs
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('none', 'daily', 'weekly', 'monthly')),
  recurrence_end_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  estimated_hours INTEGER DEFAULT 0,
  actual_hours INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Organization admins can update users in their org" ON users
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can insert users in their org" ON users
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_role IN ('owner', 'admin')
    )
  );

-- RLS Policies for client_portal_codes table
CREATE POLICY "Anyone can validate client codes" ON client_portal_codes
  FOR SELECT USING (true);

CREATE POLICY "Users can create client codes for their organization projects" ON client_portal_codes
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON p.organization_id = u.organization_id
      WHERE u.id = auth.uid() AND u.organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can view client codes for their organization projects" ON client_portal_codes
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON p.organization_id = u.organization_id
      WHERE u.id = auth.uid() AND u.organization_id IS NOT NULL
    )
  );

-- RLS Policies for projects table
DROP POLICY IF EXISTS "Users can view projects they created" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;

-- New organization-aware policies for projects
CREATE POLICY "Users can view projects in their organization" ON projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can create projects in their organization" ON projects
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update projects in their organization" ON projects
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Organization admins can delete projects in their org" ON projects
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_role IN ('owner', 'admin')
    )
  );

-- RLS Policies for clients table
DROP POLICY IF EXISTS "Users can view clients they created" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON clients;

CREATE POLICY "Users can view clients in their organization" ON clients
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can create clients in their organization" ON clients
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update clients in their organization" ON clients
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Organization admins can delete clients in their org" ON clients
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_role IN ('owner', 'admin')
    )
  );

-- RLS Policies for organizations table
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can view organizations they created" ON organizations
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Organization owners can update their organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_role = 'owner'
    )
  );

CREATE POLICY "Authenticated users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for tasks table
CREATE POLICY "Users can view tasks in their organization" ON tasks
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can create tasks in their organization" ON tasks
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update tasks in their organization" ON tasks
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

CREATE POLICY "Users can delete tasks in their organization" ON tasks
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_client_codes_code ON client_portal_codes(code);
CREATE INDEX IF NOT EXISTS idx_client_codes_expires ON client_portal_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add plan management columns to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'cancelled', 'past_due'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add organization-based indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_organization_id ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON organizations(plan);

