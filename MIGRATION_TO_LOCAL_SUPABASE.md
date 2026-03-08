# Migration from localStorage to Local Supabase

## 📋 Overview

Your LaunchBird project has been configured to use **local Supabase** instead of browser localStorage for development. This document explains what changed and why.

## 🔄 What Changed

### Before: Browser localStorage + Mock Client

```typescript
// Old approach (lib/platform.ts)
export const supabase = createMockClient()  // Always mock

// Data stored in browser
localStorage.setItem('clients-org-1', JSON.stringify(clients))
```

**Limitations:**
- ❌ Data only in browser (not shareable)
- ❌ No real authentication testing
- ❌ Can't test RLS policies
- ❌ No real database queries
- ❌ Different from production

### After: Local Supabase Instance

```typescript
// New approach (lib/platform.ts)
export const supabase = createClient(
  'http://localhost:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)

// Data stored in real PostgreSQL database
const { data } = await supabase.from('clients').select('*')
```

**Benefits:**
- ✅ Real PostgreSQL database
- ✅ Test authentication flows
- ✅ Test RLS policies
- ✅ Same as production
- ✅ Shareable data (export/import)

## 📁 Files Changed

### New Files Created

| File | Purpose |
|------|---------|
| `supabase/config.toml` | Supabase configuration |
| `supabase/migrations/20250101000000_initial_schema.sql` | Database schema |
| `supabase/seed.sql` | Test data seed |
| `.env.local` | Local environment variables |
| `LOCAL_SUPABASE_SETUP.md` | Setup instructions |
| `scripts/setup-local-supabase.sh` | Automated setup script |

### Modified Files

| File | Changes |
|------|---------|
| `lib/platform.ts` | Now uses real Supabase client with local defaults |

### Unchanged Files (Kept as Fallback)

| File | Status |
|------|--------|
| `lib/localStorage.ts` | ✅ Kept for offline development fallback |
| All other app files | ✅ No changes needed |

## 🚀 How to Complete the Migration

### Step 1: Install Docker Desktop

**Required for local Supabase**

1. Download: https://www.docker.com/products/docker-desktop
2. Install Docker Desktop (macOS Apple Silicon version)
3. Start Docker Desktop
4. Verify: `docker --version`

### Step 2: Run Setup Script

```bash
# Make script executable (already done)
chmod +x scripts/setup-local-supabase.sh

# Run setup
./scripts/setup-local-supabase.sh
```

This script will:
1. ✅ Check Docker is running
2. ✅ Verify Supabase CLI is installed
3. ✅ Create `.env.local` with local credentials
4. ✅ Start local Supabase instance
5. ✅ Apply database schema
6. ✅ Display connection info

### Step 3: Seed Test Data

```bash
supabase db seed
```

This creates:
- 1 test organization
- 3 test users
- 3 test clients
- 3 test projects
- 12 test tasks

### Step 4: Create Auth User

```bash
# Create admin user for login
supabase auth create --email admin@launchbird.dev --password admin123

# Or use the Supabase Studio UI at http://localhost:54323
```

### Step 5: Start Development

```bash
npm run dev
```

Visit http://localhost:3000 and login with:
- Email: `admin@launchbird.dev`
- Password: `admin123`

## 🔍 Understanding the Changes

### Database Schema

The schema in `supabase/migrations/20250101000000_initial_schema.sql` matches your existing `supabase-schema.sql` with:

- **Organizations** table
- **Users** table with organization relationships
- **Projects** table
- **Clients** table
- **Tasks** table with subtasks support
- **Client Portal Codes** table
- **Row Level Security (RLS)** policies for all tables
- **Indexes** for performance
- **Triggers** for auto-updating timestamps

### Environment Variables

**Local Development (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_DISABLE_AUTH=false
```

**Production (Future):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
NEXT_PUBLIC_DISABLE_AUTH=false
```

### Platform Configuration

The `lib/platform.ts` now:
1. Uses local Supabase by default (`http://localhost:54321`)
2. Falls back to mock client if auth is disabled
3. Can easily switch to production with environment variables

## 📊 Data Migration

### Your Old localStorage Data

Your browser localStorage data is still there! If you want to:

**Keep using localStorage temporarily:**
```bash
# Set in .env.local
NEXT_PUBLIC_DISABLE_AUTH=true
```

**Export localStorage data:**
```javascript
// In browser console
const clients = localStorage.getItem('clients-org-1')
console.log(JSON.parse(clients))
```

**Import to Supabase:**
1. Export localStorage data
2. Use Supabase Studio to import
3. Or write custom migration script

### Seed Data

The new seed data includes:

| Resource | Count | Details |
|----------|-------|---------|
| Organizations | 1 | LaunchBird Development |
| Users | 3 | Admin, 2 team members |
| Clients | 3 | Acme Corp, TechStart, Global Solutions |
| Projects | 3 | E-commerce, PPC, Mobile App |
| Tasks | 12 | Various statuses and priorities |
| Client Codes | 3 | AB12, CD34, EF56 |

## 🛠️ Development Workflow

### Daily Workflow

**Starting work:**
```bash
# 1. Ensure Docker Desktop is running
# 2. Start Supabase (if not running)
supabase start

# 3. Start Next.js
npm run dev
```

**Stopping:**
```bash
# Stop Next.js: Ctrl+C

# Stop Supabase (keeps data)
supabase stop
```

### Common Commands

```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Reset database (fresh start)
supabase db reset

# Open Studio UI
open http://localhost:54323

# Direct database access
psql postgresql://postgres:postgres@localhost:54322/postgres
```

## 🐛 Troubleshooting

### "Cannot connect to Docker daemon"
**Solution:** Start Docker Desktop application

### "Port already in use"
```bash
supabase stop
# Or kill process: lsof -ti:54321 | xargs kill -9
supabase start
```

### "Connection refused"
```bash
# Restart Supabase
supabase stop
supabase start
```

### "No such table"
```bash
# Reset and apply migrations
supabase db reset
```

### Want to go back to localStorage?
```bash
# Edit .env.local
NEXT_PUBLIC_DISABLE_AUTH=true
```

## 🎯 Next Steps

### Immediate
1. ✅ Install Docker Desktop
2. ✅ Run `./scripts/setup-local-supabase.sh`
3. ✅ Create auth user
4. ✅ Start development

### Optional Enhancements
- [ ] Add more seed data
- [ ] Create custom SQL functions
- [ ] Set up Edge Functions
- [ ] Configure Storage buckets
- [ ] Add real-time subscriptions

### Future Production Deployment
- [ ] Create production Supabase project
- [ ] Update environment variables
- [ ] Run migrations on production
- [ ] Set up CI/CD for migrations
- [ ] Configure production RLS policies

## 📚 Resources

- [Local Setup Guide](./LOCAL_SUPABASE_SETUP.md) - Detailed setup instructions
- [Supabase Docs](https://supabase.com/docs) - Official documentation
- [Local Development](https://supabase.com/docs/guides/cli/local-development) - CLI guide
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security) - Security guide

## ❓ Questions?

**Q: Do I need internet for local Supabase?**
A: No! Once Docker images are downloaded, it works completely offline.

**Q: Will this affect my production data?**
A: No, local Supabase is completely isolated.

**Q: Can I use both localStorage and Supabase?**
A: Yes, set `NEXT_PUBLIC_DISABLE_AUTH=true` to use localStorage.

**Q: How much disk space does it use?**
A: ~500MB for Docker images, minimal for database.

**Q: Can team members share data?**
A: Yes, export/import database dumps or use git for migrations.

## ✅ Checklist

- [ ] Docker Desktop installed
- [ ] Setup script executed
- [ ] `.env.local` created
- [ ] Supabase started
- [ ] Migrations applied
- [ ] Seed data loaded
- [ ] Auth user created
- [ ] Tested login
- [ ] Verified data in Studio
- [ ] Read documentation

---

**Status:** Ready for Docker installation ✨

