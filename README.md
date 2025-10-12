# LaunchBird - Project Management Platform

A modern, secure project management platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### Option 1: Local Supabase (Recommended)

**Best for:** Full-stack development with real database, authentication, and RLS testing

1. **Prerequisites:**
   - Docker Desktop installed and running
   - Node.js 18+

2. **Run the automated setup:**
   ```bash
   npm install
   ./scripts/setup-local-supabase.sh
   ```

3. **Create a test user:**
   ```bash
   supabase auth create --email admin@launchbird.dev --password admin123
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

📚 **Full Guide:** See [LOCAL_SUPABASE_SETUP.md](./LOCAL_SUPABASE_SETUP.md)

### Option 2: Mock Mode (Quick Testing)

**Best for:** UI development without database setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up mock mode:**
   ```bash
   cp env.example .env.local
   # Edit .env.local and set: NEXT_PUBLIC_DISABLE_AUTH=true
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The app will run with mock data and bypass all database connections! 🎉

## Features

### Authentication System
- **Email/Password Login** with "Remember Me" functionality
- **User Registration** with role selection (Admin/Team Member)
- **Password Reset** via email link
- **Anonymous Client Access** via 4-character codes
- **Role-based Redirection** (Admins → Dashboard, Team Members → Tasks)

### Security Features
- Supabase Authentication integration
- Role-based access control
- Secure 4-character code generation for client profiles
- Password protection for client access
- GDPR/CCPA compliant data handling

### UI/UX
- Modern, responsive design with Tailwind CSS
- Dark mode support
- ShadCN UI components
- Lucide React icons
- WCAG 2.1 AA accessibility compliance
- LaunchBird brand colors (#9844fc)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN
- **Icons**: Lucide React
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker Desktop (for local Supabase)

### Local Development Setup

#### Recommended: Local Supabase

1. **Install Docker Desktop**
   - Download from https://www.docker.com/products/docker-desktop
   - Start Docker Desktop

2. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd launchbird
   npm install
   ```

3. **Run Setup Script**
   ```bash
   ./scripts/setup-local-supabase.sh
   ```
   
   This will:
   - Create `.env.local` with local credentials
   - Start Supabase services (PostgreSQL, Auth, Studio)
   - Apply database migrations
   - Display connection information

4. **Create Auth User**
   ```bash
   supabase auth create --email admin@launchbird.dev --password admin123
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

📚 **Detailed Guide:** [LOCAL_SUPABASE_SETUP.md](./LOCAL_SUPABASE_SETUP.md)  
🔄 **Migration Guide:** [MIGRATION_TO_LOCAL_SUPABASE.md](./MIGRATION_TO_LOCAL_SUPABASE.md)

#### Alternative: Mock Mode

For quick UI testing without database:

1. **Create `.env.local`**
   ```bash
   cp env.example .env.local
   ```

2. **Enable mock mode in `.env.local`**
   ```env
   NEXT_PUBLIC_DISABLE_AUTH=true
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

### Production Supabase Setup

For production deployment:

1. **Create Supabase Project**
   - Visit https://supabase.com
   - Create new project

2. **Apply Schema**
   - Copy contents of `supabase/migrations/20250101000000_initial_schema.sql`
   - Run in Supabase SQL Editor

3. **Configure Environment**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   NEXT_PUBLIC_DISABLE_AUTH=false
   ```

## Project Structure

```
launchbird/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── reset-password/    # Password reset page
│   ├── dashboard/         # Main dashboard
│   ├── projects/          # Project management
│   ├── clients/           # Client management
│   ├── tasks/             # Task management
│   ├── profile/[code]/    # Client profile with code
│   ├── app-admin/         # Admin panel
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── Auth/             # Authentication forms
│   ├── Dashboard/        # Dashboard components
│   ├── Projects/         # Project components
│   ├── Client/           # Client management
│   ├── Task/             # Task management
│   └── ui/               # ShadCN UI components
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── platform.ts       # Supabase client configuration
│   ├── localStorage.ts   # Local storage fallback
│   ├── clients.ts        # Client operations
│   ├── projects.ts       # Project operations
│   ├── tasks.ts          # Task operations
│   └── utils.ts          # General utilities
├── supabase/             # Supabase configuration
│   ├── config.toml       # Supabase CLI config
│   ├── migrations/       # Database migrations
│   └── seed.sql          # Seed data for development
├── scripts/              # Utility scripts
│   └── setup-local-supabase.sh  # Setup automation
├── tests/                # Test files
│   └── utils.test.ts     # Unit tests
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types
└── public/               # Static assets
```

## Authentication Flow

### User Registration
1. User fills out signup form with email, password, role, and profile info
2. Account created in Supabase Auth
3. User profile stored in PostgreSQL with role and metadata
4. User redirected based on role (Admin → Dashboard, Team Member → Tasks)

### User Login
1. User enters email and password
2. Optional "Remember Me" for persistent sessions
3. Supabase Auth validates credentials
4. User profile retrieved from database
5. Role-based redirection

### Password Reset
1. User requests password reset
2. Supabase sends reset email
3. User clicks link in email
4. User sets new password

### Client Access
1. Admin generates 4-character code for project
2. Client visits `/profile/[code]`
3. Code validated against database
4. Optional password validation
5. Access to read-only project view

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

The project maintains 80% test coverage across all authentication functionality.

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build`
2. Start production server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write JSDoc documentation for all functions
- Maintain 80% test coverage
- Follow conventional commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced project analytics
- [ ] Mobile app development
- [ ] API rate limiting improvements
- [ ] Enhanced security features 