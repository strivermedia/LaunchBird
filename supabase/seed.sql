-- LaunchBird Local Development Seed Data
-- This file populates the local database with test data for development

-- Clear existing data (in reverse order of dependencies)
TRUNCATE tasks, client_profile_codes, projects, clients, users, organizations CASCADE;

-- Create test organization
INSERT INTO organizations (id, name, description, plan, plan_status, created_by, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'LaunchBird Development', 'Development Organization', 'pro', 'active', '22222222-2222-2222-2222-222222222222', NOW());

-- Create test users
-- Note: These are database records. For actual authentication, you'll need to create users through Supabase Auth
INSERT INTO users (id, email, role, title, job_title, location, organization_id, organization_role, joined_at, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'admin@launchbird.dev', 'admin', 'John Doe', 'Senior Developer', 'San Francisco, CA', '11111111-1111-1111-1111-111111111111', 'owner', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'jane@launchbird.dev', 'team_member', 'Jane Smith', 'Marketing Specialist', 'New York, NY', '11111111-1111-1111-1111-111111111111', 'member', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'bob@launchbird.dev', 'team_member', 'Bob Johnson', 'UI/UX Designer', 'Austin, TX', '11111111-1111-1111-1111-111111111111', 'member', NOW(), NOW());

-- Create test clients
INSERT INTO clients (id, name, email, company, phone, organization_id, created_by, created_at)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'Acme Corporation', 'contact@acme.com', 'Acme Corporation', '+1-555-0123', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW()),
  ('66666666-6666-6666-6666-666666666666', 'TechStart Inc', 'hello@techstart.com', 'TechStart Inc', '+1-555-0456', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW()),
  ('77777777-7777-7777-7777-777777777777', 'Global Solutions Ltd', 'info@globalsolutions.com', 'Global Solutions Ltd', '+1-555-0789', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW());

-- Create test projects
INSERT INTO projects (id, name, description, status, client_id, organization_id, created_by, created_at)
VALUES 
  ('88888888-8888-8888-8888-888888888888', 'E-commerce Website Redesign', 'Complete redesign of client e-commerce platform with modern UI/UX', 'active', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW()),
  ('99999999-9999-9999-9999-999999999999', 'PPC Campaign Management', 'Ongoing PPC campaign management and optimization', 'active', '66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mobile App Development', 'Cross-platform mobile application for iOS and Android', 'active', '77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW());

-- Create client profile codes
INSERT INTO client_profile_codes (id, code, project_id, password, expires_at, created_by, created_at)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'AB12', '88888888-8888-8888-8888-888888888888', NULL, NOW() + INTERVAL '90 days', '22222222-2222-2222-2222-222222222222', NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'CD34', '99999999-9999-9999-9999-999999999999', NULL, NOW() + INTERVAL '90 days', '22222222-2222-2222-2222-222222222222', NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'EF56', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NOW() + INTERVAL '90 days', '22222222-2222-2222-2222-222222222222', NOW());

-- Create test tasks
INSERT INTO tasks (
  id, organization_id, title, description, status, priority, due_date,
  assigned_to, assigned_to_names, created_by, created_by_name,
  project_id, project_title, tags, estimated_hours, created_at
)
VALUES 
  -- E-commerce Website Project Tasks
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'Design Homepage Mockups',
    'Create high-fidelity mockups for the new homepage design',
    'in-progress',
    'high',
    NOW() + INTERVAL '3 days',
    ARRAY['44444444-4444-4444-4444-444444444444'],
    ARRAY['Bob Johnson'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    '88888888-8888-8888-8888-888888888888',
    'E-commerce Website Redesign',
    ARRAY['design', 'homepage'],
    8,
    NOW()
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '11111111-1111-1111-1111-111111111111',
    'Implement Product Catalog',
    'Build the product catalog with filtering and search capabilities',
    'todo',
    'high',
    NOW() + INTERVAL '7 days',
    ARRAY['22222222-2222-2222-2222-222222222222'],
    ARRAY['John Doe'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    '88888888-8888-8888-8888-888888888888',
    'E-commerce Website Redesign',
    ARRAY['development', 'backend'],
    16,
    NOW()
  ),
  (
    '10101010-1010-1010-1010-101010101010',
    '11111111-1111-1111-1111-111111111111',
    'Setup Payment Gateway',
    'Integrate Stripe payment processing',
    'todo',
    'medium',
    NOW() + INTERVAL '10 days',
    ARRAY['22222222-2222-2222-2222-222222222222'],
    ARRAY['John Doe'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    '88888888-8888-8888-8888-888888888888',
    'E-commerce Website Redesign',
    ARRAY['development', 'payments'],
    12,
    NOW()
  ),
  
  -- PPC Campaign Tasks
  (
    '20202020-2020-2020-2020-202020202020',
    '11111111-1111-1111-1111-111111111111',
    'Keyword Research',
    'Research and compile list of target keywords for Q1 campaign',
    'completed',
    'high',
    NOW() - INTERVAL '2 days',
    ARRAY['33333333-3333-3333-3333-333333333333'],
    ARRAY['Jane Smith'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    '99999999-9999-9999-9999-999999999999',
    'PPC Campaign Management',
    ARRAY['marketing', 'research'],
    4,
    NOW() - INTERVAL '5 days'
  ),
  (
    '30303030-3030-3030-3030-303030303030',
    '11111111-1111-1111-1111-111111111111',
    'Create Ad Copy Variations',
    'Write 5 variations of ad copy for A/B testing',
    'in-progress',
    'high',
    NOW() + INTERVAL '2 days',
    ARRAY['33333333-3333-3333-3333-333333333333'],
    ARRAY['Jane Smith'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    '99999999-9999-9999-9999-999999999999',
    'PPC Campaign Management',
    ARRAY['marketing', 'content'],
    6,
    NOW() - INTERVAL '1 day'
  ),
  (
    '40404040-4040-4040-4040-404040404040',
    '11111111-1111-1111-1111-111111111111',
    'Setup Conversion Tracking',
    'Implement Google Analytics conversion tracking',
    'todo',
    'high',
    NOW() + INTERVAL '3 days',
    ARRAY['33333333-3333-3333-3333-333333333333'],
    ARRAY['Jane Smith'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    '99999999-9999-9999-9999-999999999999',
    'PPC Campaign Management',
    ARRAY['marketing', 'analytics'],
    3,
    NOW()
  ),

  -- Mobile App Project Tasks
  (
    '50505050-5050-5050-5050-505050505050',
    '11111111-1111-1111-1111-111111111111',
    'Define User Stories',
    'Document all user stories and acceptance criteria',
    'in-progress',
    'urgent',
    NOW() + INTERVAL '2 days',
    ARRAY['22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444'],
    ARRAY['John Doe', 'Bob Johnson'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Mobile App Development',
    ARRAY['planning', 'requirements'],
    8,
    NOW()
  ),
  (
    '60606060-6060-6060-6060-606060606060',
    '11111111-1111-1111-1111-111111111111',
    'Create Wireframes',
    'Design wireframes for all main app screens',
    'todo',
    'high',
    NOW() + INTERVAL '5 days',
    ARRAY['44444444-4444-4444-4444-444444444444'],
    ARRAY['Bob Johnson'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Mobile App Development',
    ARRAY['design', 'wireframes'],
    12,
    NOW()
  ),
  (
    '70707070-7070-7070-7070-707070707070',
    '11111111-1111-1111-1111-111111111111',
    'Setup Development Environment',
    'Configure React Native development environment and CI/CD',
    'todo',
    'medium',
    NOW() + INTERVAL '4 days',
    ARRAY['22222222-2222-2222-2222-222222222222'],
    ARRAY['John Doe'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Mobile App Development',
    ARRAY['development', 'devops'],
    6,
    NOW()
  );

-- Add some subtasks
INSERT INTO tasks (
  id, organization_id, title, description, status, priority, due_date,
  assigned_to, assigned_to_names, created_by, created_by_name,
  project_id, project_title, parent_task_id, tags, estimated_hours, created_at
)
VALUES 
  (
    '80808080-8080-8080-8080-808080808080',
    '11111111-1111-1111-1111-111111111111',
    'Design mobile navigation',
    'Create mobile-responsive navigation component',
    'completed',
    'medium',
    NOW() - INTERVAL '1 day',
    ARRAY['44444444-4444-4444-4444-444444444444'],
    ARRAY['Bob Johnson'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    '88888888-8888-8888-8888-888888888888',
    'E-commerce Website Redesign',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    ARRAY['design', 'subtask'],
    3,
    NOW() - INTERVAL '2 days'
  ),
  (
    '90909090-9090-9090-9090-909090909090',
    '11111111-1111-1111-1111-111111111111',
    'Create hero section',
    'Design and implement homepage hero section',
    'in-progress',
    'high',
    NOW() + INTERVAL '2 days',
    ARRAY['44444444-4444-4444-4444-444444444444'],
    ARRAY['Bob Johnson'],
    '22222222-2222-2222-2222-222222222222',
    'John Doe',
    '88888888-8888-8888-8888-888888888888',
    'E-commerce Website Redesign',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    ARRAY['design', 'subtask'],
    4,
    NOW()
  );

-- Display summary
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Test Organization: LaunchBird Development';
  RAISE NOTICE 'Test Users:';
  RAISE NOTICE '  - admin@launchbird.dev (Owner)';
  RAISE NOTICE '  - jane@launchbird.dev (Member)';
  RAISE NOTICE '  - bob@launchbird.dev (Member)';
  RAISE NOTICE '';
  RAISE NOTICE 'Test Clients: 3';
  RAISE NOTICE 'Test Projects: 3';
  RAISE NOTICE 'Test Tasks: 12 (including 2 subtasks)';
  RAISE NOTICE '';
  RAISE NOTICE 'Client Access Codes:';
  RAISE NOTICE '  - AB12 (E-commerce Website)';
  RAISE NOTICE '  - CD34 (PPC Campaign)';
  RAISE NOTICE '  - EF56 (Mobile App)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Note: For authentication to work, create test users in Supabase Auth:';
  RAISE NOTICE '   supabase auth create --email admin@launchbird.dev --password admin123';
END $$;

