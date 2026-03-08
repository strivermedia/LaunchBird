# LaunchBird Client Portal System

## Overview

The LaunchBird Client Portal System provides a secure, read-only interface for clients to access their project information using 4-character access codes. The system supports both anonymous access and optional password protection.

## Architecture

### Pages
- **`app/portal/page.tsx`** - Code entry page for clients to enter their access code
- **`app/portal/[code]/page.tsx`** - Main client portal page with static site generation (SSG)

### Components
- **`components/ClientPortal/ClientPortalContent.tsx`** - Main content component displaying project details
- **`components/ClientPortal/ProjectStatus.tsx`** - Project milestones and timeline component
- **`components/ClientPortal/FeedbackForm.tsx`** - Client feedback submission form

### Library Functions
- **`lib/client-portal.ts`** - Core functionality for client portal data retrieval and logging
- **`lib/auth.ts`** - Portal code creation/validation (`createClientPortalCode`, `validateClientPortalCode`)

## Features

### 🔐 Secure Access
- 4-character alphanumeric access codes
- Optional password protection
- Automatic code expiration
- Access tracking and logging

### 📊 Project Information
- Project status and progress
- Timeline and milestones
- Shared files with download functionality
- Recent activity feed

### 💬 Client Feedback
- Star rating system (1-5 stars)
- Feedback categories (design, functionality, communication, etc.)
- Form validation and submission
- Success/error handling

### 🎨 Design System
- ShadCN UI components
- Tailwind CSS styling
- Dark mode support
- Responsive design
- #6d28d9 primary color scheme

## Usage

### For Clients

1. **Access via URL**: Navigate to `https://launchbird.io/portal/[CODE]`
2. **Code Entry**: Visit `/portal` and enter your 4-character access code
3. **Password (if required)**: Enter project password when prompted
4. **View Project**: Access project details, milestones, and shared files
5. **Submit Feedback**: Use the feedback form to provide ratings and comments

### For Developers

#### Creating Client Access
```typescript
import { createClientPortalCode } from '@/lib/auth'

const code = await createClientPortalCode(projectId, undefined, 30) // 30 days expiry
```

#### Validating Access
```typescript
import { validateClientPortalCode } from '@/lib/auth'

const codeData = await validateClientPortalCode('ABCD')
if (!codeData) {
  // Access denied
}
```

#### Logging Access
```typescript
import { logClientAccess } from '@/lib/client-portal'

await logClientAccess(code, projectId, organizationId)
```

## Data Flow

1. **Code Validation**: Client enters code → System validates against Supabase
2. **Project Loading**: Valid code → Fetch project data and activities
3. **Static Generation**: Next.js generates static pages for performance
4. **Client Interaction**: Client views project details and submits feedback
5. **Access Tracking**: System logs all access attempts with timestamps

## Security Features

- **Rate Limiting**: Built-in protection against brute force attacks
- **Code Expiration**: Automatic expiry prevents long-term access
- **Password Protection**: Optional additional security layer
- **Access Logging**: Track all access attempts for security monitoring
- **IP Tracking**: Log client IP addresses (server-side implementation)

## Performance Optimizations

- **Static Site Generation**: Pre-rendered pages for fast loading
- **Image Optimization**: Optimized images and assets
- **Code Splitting**: Lazy loading of components
- **Caching**: Browser and CDN caching strategies
- **Bundle Optimization**: Minimal JavaScript bundle size

## Testing

The system includes comprehensive tests covering:

- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **Library Tests**: Core function validation
- **Mock Data**: Realistic test scenarios

Run tests with:
```bash
npm test -- tests/projects.test.ts
```

## Customization

### Branding
- Custom logo and colors via Firestore organization settings
- Configurable primary color (default: #6d28d9)
- Dark mode support with system preference detection

### Features
- Enable/disable client access per project
- Custom feedback categories
- Configurable milestone templates
- File sharing permissions

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Build Process
```bash
npm run build
npm start
```

## Monitoring

### Access Analytics
- Track code usage patterns
- Monitor access frequency
- Identify popular projects
- Security incident detection

### Performance Metrics
- Page load times
- User engagement
- Feedback submission rates
- Error tracking

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live project updates
- **File Upload**: Client file upload capabilities
- **Notifications**: Email/SMS notifications for project updates
- **Mobile App**: Native mobile application
- **API Access**: RESTful API for third-party integrations
- **Advanced Analytics**: Detailed usage analytics and reporting

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository. 