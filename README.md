# LaunchBird - Project Management Platform

A modern, secure project management platform built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## Features

### Authentication System
- **Email/Password Login** with "Remember Me" functionality
- **User Registration** with role selection (Admin/Team Member)
- **Password Reset** via email link
- **Anonymous Client Access** via 4-character codes
- **Role-based Redirection** (Admins → Dashboard, Team Members → Tasks)

### Security Features
- Firebase Authentication integration
- Role-based access control
- Secure 4-character code generation for client views
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
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

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

3. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password, Anonymous)
   - Create a Firestore database
   - Get your Firebase config

4. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. **Firebase Analytics Setup**
   - Enable Google Analytics in your Firebase project
   - The app automatically initializes analytics when available
   - Use the `logAnalyticsEvent` utility function to track custom events:
   ```typescript
   import { logAnalyticsEvent } from '@/lib/firebase'
   
   // Track user actions
   logAnalyticsEvent('button_clicked', {
     button_name: 'signup',
     user_role: 'admin'
   })
   
   // Track page views
   logAnalyticsEvent('page_view', {
     page_name: 'dashboard',
     user_id: 'user123'
   })
   ```

5. **Firebase Security Rules**
   Set up Firestore security rules for role-based access:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
       
       // Client view codes
       match /clientViewCodes/{code} {
         allow read: if true; // Public read for validation
         allow write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
launchbird/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── reset-password/    # Password reset page
│   ├── view/[code]/       # Client view with code
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
2. Client visits `/view/[code]`
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