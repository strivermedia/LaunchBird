# LaunchBird - Project Management Platform

A modern, secure project management platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

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
- Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd launchbird
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Enable Authentication (Email/Password, Anonymous)
   - Set up your database schema
   - Get your Supabase config

4. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
   ```

5. **Development Mode**
   For development with mock data, you can disable authentication:
   ```env
   NEXT_PUBLIC_DISABLE_AUTH=true
   ```

## Project Structure

```
launchbird/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── reset-password/    # Password reset page
│   ├── profile/[code]/       # Client profile with code
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── Auth/             # Authentication forms
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ResetPasswordForm.tsx
│   └── ui/               # ShadCN UI components
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── firebase.ts       # Firebase configuration
│   └── utils.ts          # General utilities
├── tests/                # Test files
│   └── auth.test.ts      # Authentication tests
└── public/               # Static assets
```

## Authentication Flow

### User Registration
1. User fills out signup form with email, password, role, and profile info
2. Account created in Firebase Auth
3. User profile stored in Firestore with role and metadata
4. User redirected based on role (Admin → Dashboard, Team Member → Tasks)

### User Login
1. User enters email and password
2. Optional "Remember Me" for persistent sessions
3. Firebase Auth validates credentials
4. User profile retrieved from Firestore
5. Role-based redirection

### Password Reset
1. User requests password reset
2. Firebase sends reset email
3. User clicks link in email
4. User sets new password

### Client Access
1. Admin generates 4-character code for project
2. Client visits `/profile/[code]`
3. Optional password validation
4. Anonymous authentication
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