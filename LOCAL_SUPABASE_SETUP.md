# Local Supabase Setup Guide

## ✅ Completed Steps

1. ✅ **Supabase CLI Installed** - Version 2.48.3
2. ✅ **Supabase Initialized** - Configuration created in `supabase/` directory
3. ✅ **Database Migration Created** - Schema ready in `supabase/migrations/`
4. ✅ **Platform Updated** - `lib/platform.ts` now uses real Supabase client
5. ✅ **Environment Template Ready** - See configuration below

## 🚀 Next Steps

### 1. Install Docker Desktop

Local Supabase requires Docker to run the PostgreSQL database and other services.

**Download Docker Desktop:**
- Visit: https://www.docker.com/products/docker-desktop
- Download for macOS (Apple Silicon)
- Install and start Docker Desktop

**Verify Installation:**
```bash
docker --version
```

### 2. Create Environment File

Create a `.env.local` file in the project root with these contents:

```bash
# Supabase Local Development Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_DISABLE_AUTH=false

# Database URL (PostgreSQL direct connection)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

**Quick command to create the file:**
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NODE_ENV=development
NEXT_PUBLIC_DISABLE_AUTH=false
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
EOF
```

### 3. Start Local Supabase

Once Docker is running:

```bash
# Start Supabase (first time takes ~2-3 minutes to download images)
supabase start
```

This will:
- Download necessary Docker images
- Start PostgreSQL, PostgREST, GoTrue (auth), and other services
- Apply all migrations from `supabase/migrations/`
- Display connection details

**Expected Output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Access Supabase Studio

Open the Supabase Studio dashboard:
```bash
open http://localhost:54323
```

You can:
- View and edit database tables
- Test RLS policies
- Run SQL queries
- Manage users and authentication

### 5. Seed Initial Data

Run the seed script to create initial test data:

```bash
supabase db seed
```

This will create:
- Test organization
- Admin user
- Sample clients and projects
- Test tasks

### 6. Start Your Next.js App

```bash
npm run dev
```

Your app will now connect to the local Supabase instance!

## 🔧 Daily Development Workflow

### Starting Work
```bash
# 1. Make sure Docker Desktop is running
# 2. Start Supabase
supabase start

# 3. Start your Next.js app
npm run dev
```

### Stopping Services
```bash
# Stop Next.js (Ctrl+C in terminal)

# Stop Supabase (keeps data)
supabase stop

# Stop Supabase and remove data (fresh start)
supabase stop --no-backup
```

## 🗄️ Database Management

### Apply New Migrations
```bash
# Create a new migration
supabase migration new my_new_feature

# Edit the generated file in supabase/migrations/
# Then apply it
supabase db reset
```

### Reset Database
```bash
# Reset to clean state and reapply all migrations
supabase db reset
```

### Direct Database Access
```bash
# Connect to PostgreSQL directly
psql postgresql://postgres:postgres@localhost:54322/postgres
```

## 📊 Useful Commands

### Check Status
```bash
supabase status
```

### View Logs
```bash
supabase logs
```

### Generate Types (TypeScript)
```bash
supabase gen types typescript --local > types/supabase.ts
```

## 🐛 Troubleshooting

### Docker Not Running
**Error:** "Cannot connect to the Docker daemon"
**Solution:** Start Docker Desktop app

### Port Already in Use
**Error:** "port is already allocated"
**Solution:** 
```bash
supabase stop
# Or kill the process using the port
lsof -ti:54321 | xargs kill -9
supabase start
```

### Database Connection Issues
**Error:** Connection timeout or refused
**Solution:**
```bash
# Restart Supabase
supabase stop
supabase start

# Check if services are running
docker ps
```

### Reset Everything
```bash
# Nuclear option - complete reset
supabase stop --no-backup
docker system prune -a
supabase start
```

## 🎯 Key Benefits of Local Supabase

✅ **Exact Production Parity** - Same database, auth, and APIs as production
✅ **Test RLS Policies** - Verify security rules before deploying
✅ **Fast Iterations** - No API rate limits or network latency
✅ **Work Offline** - Develop without internet connection
✅ **Safe Testing** - Can't accidentally break production data
✅ **Migration Testing** - Test schema changes before applying to production

## 📚 Additional Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/managing-environments)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🔄 Migration from localStorage

Your app previously used browser localStorage for development. The benefits of switching to local Supabase:

| Feature | localStorage | Local Supabase |
|---------|-------------|----------------|
| Data Persistence | Browser only | Database (survives restarts) |
| Multi-User Testing | ❌ No | ✅ Yes |
| Auth Testing | ❌ Mocked | ✅ Real |
| RLS Testing | ❌ No | ✅ Yes |
| Production Parity | ❌ No | ✅ Yes |
| Team Sharing | ❌ No | ✅ Yes (export/import) |

The localStorage implementation remains in `lib/localStorage.ts` as a fallback for offline work if needed.

