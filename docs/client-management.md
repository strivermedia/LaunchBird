# Client Management

## Overview
The client management system allows administrators and team members to manage client relationships, track projects, and maintain communication records.

## Features

### Add Client
The "Add Client" functionality allows users to create new client profiles with comprehensive information.

#### Access Control
- **Admin/Owner**: Can create clients and assign them to any team member
- **Team Member**: Cannot create clients (restricted access)

#### Form Fields

**Basic Information:**
- Full Name (required)
- Email Address (required)
- Phone Number (optional)
- Status (Prospect/Active/Inactive)

**Company Information:**
- Company Name (optional)
- Position/Title (optional)

**Assignment:**
- Assigned Manager (required) - Select from available team members

**Additional Information:**
- Notes (optional) - Free text for additional context
- Tags (optional) - Custom tags for categorization

#### Usage

**Adding a Client:**
1. Navigate to the Clients page (`/clients`)
2. Click the "Add Client" button in the top-right corner
3. Fill out the required fields (marked with *)
4. Optionally add company information, notes, and tags
5. Select an assigned manager from the dropdown
6. Click "Create Client" to save

**Editing a Client:**
1. Navigate to a client's profile page (`/clients/[id]`)
2. Click the "Edit" button in the top-right corner
3. Modify any fields as needed
4. Add or remove tags
5. Change the assigned manager if needed
6. Click "Update Client" to save changes

#### Validation
- Name and email are required
- Email must be in valid format
- Manager assignment is required
- Duplicate tags are prevented

#### Success Flow
- Client is created in the database
- User is redirected to the client detail page
- Success message is displayed

#### Error Handling
- Form validation errors are displayed inline
- Database errors are shown as user-friendly messages
- Network errors are handled gracefully

## Components

### AddClientForm
Located at `components/Client/AddClientForm.tsx`

**Props:**
- `onClose: () => void` - Function to close the modal
- `onSuccess?: (clientId: string) => void` - Optional callback when client is created

**Features:**
- Modal overlay with backdrop
- Responsive design
- Form validation
- Error handling
- Loading states
- Tag management

### EditClientForm
Located at `components/Client/EditClientForm.tsx`

**Props:**
- `client: Client` - The client object to edit
- `onClose: () => void` - Function to close the modal
- `onSuccess?: (client: Client) => void` - Optional callback when client is updated

**Features:**
- Pre-filled form with existing client data
- Modal overlay with backdrop
- Responsive design
- Form validation
- Error handling
- Loading states
- Tag management (add/remove)
- Manager reassignment

### ClientList
Located at `components/Client/ClientList.tsx`

**Features:**
- Displays clients in a table format
- Search and filtering
- Quick actions (email, SMS, view, client profile)
- Status badges
- Responsive design

## Database Schema

### Client Document
```typescript
interface Client {
  id: string
  organizationId: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  assignedManagerId: string
  assignedManagerName: string
  assignedManagerTitle?: string
  status: 'active' | 'inactive' | 'prospect'
  createdAt: Date
  updatedAt: Date
  notes?: string
  tags?: string[]
  lastContactDate?: Date
  totalProjects: number
  activeProjects: number
  completedProjects: number
}
```

## API Functions

### createClient
Located at `lib/clients.ts`

**Parameters:**
- `clientData: Omit<Client, 'id'>` - Client data without ID
- `userId: string` - Current user ID for permission checking

**Returns:**
- `Promise<string>` - The new client ID

**Permissions:**
- Only admins and owners can create clients
- Validates user authentication and organization membership

### updateClient
Located at `lib/clients.ts`

**Parameters:**
- `clientId: string` - The client ID to update
- `updates: Partial<Client>` - The fields to update
- `userId: string` - Current user ID for permission checking

**Returns:**
- `Promise<void>`

**Permissions:**
- Admins and owners can update any client
- Assigned managers can update their assigned clients
- Validates user authentication and organization membership

## Security Rules

### Firestore Rules
```javascript
// Clients collection
match /clients/{clientId} {
  allow read: if request.auth != null && 
    (resource.data.organizationId == request.auth.token.organizationId) &&
    (request.auth.token.role in ['admin', 'owner'] || 
     resource.data.assignedManagerId == request.auth.uid);
  
  allow create: if request.auth != null && 
    request.auth.token.role in ['admin', 'owner'] &&
    request.resource.data.organizationId == request.auth.token.organizationId;
    
  allow update: if request.auth != null && 
    (request.auth.token.role in ['admin', 'owner'] || 
     resource.data.assignedManagerId == request.auth.uid) &&
    request.resource.data.organizationId == request.auth.token.organizationId;
     
  allow delete: if request.auth != null && 
    request.auth.token.role in ['admin', 'owner'];
}
```

## Styling

### Design System
- Uses Tailwind CSS with custom purple theme (`#9844fc`)
- Follows ShadCN component patterns
- Responsive design with mobile-first approach
- Dark mode support
- WCAG 2.1 AA accessibility compliance

### Color Palette
- Primary: `#9844fc` (purple)
- Success: Green variants
- Warning: Orange variants
- Error: Red variants
- Neutral: Gray scale

## Testing

### Unit Tests
- Form validation
- API integration
- Error handling
- User permissions

### Integration Tests
- End-to-end client creation flow
- Modal interactions
- Form submission
- Success/error states

## Future Enhancements

### Planned Features
- Bulk client import
- Client templates
- Advanced filtering
- Client analytics
- Communication history
- File attachments
- Client portal integration

### Technical Improvements
- Real-time updates
- Offline support
- Performance optimization
- Advanced search
- Export functionality 