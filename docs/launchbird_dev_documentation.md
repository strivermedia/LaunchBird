# Project Rules for Development

## Code Quality and Standards
- Use **TypeScript** for type safety in all code.
- Follow **ESLint** and **Prettier** configurations:
  - 2-space indentation
  - Single quotes
- Write modular, reusable components with clear naming (e.g., `ClientList`, `TaskCard`).
- Document all functions, components, and APIs with **JSDoc**.
- Achieve **80% unit test coverage** using **Jest** (currently set to 0% threshold for initial setup).

## UI/UX Consistency
- Apply **Tailwind CSS** with CSS variables (`--primary`) for buttons, links, and highlights; use `dark:` classes for light/dark mode.
- Use **ShadCN** components and **Lucide React** icons for unified UI.
- Support **light/dark mode** with `prefers-color-scheme` detection.
- Ensure **WCAG 2.1 Level AA** accessibility (contrast ratio > 4.5:1 for primary color).

## Performance Optimization
- Target **page load time < 2s** using **Next.js** SSG/SSR and **API response < 200ms**.
- Cache static assets via **Vercel** and API responses (e.g., weather data).
- Optimize **Supabase** queries for performance and cost efficiency.

## Security and Compliance
- Implement **Supabase Row Level Security (RLS)** for role-based access:
  - **Admin**: Full access
  - **Team Member**: Assigned data, title editing
  - **Client Portal**: Read-only via secure, expirable 4-character alphanumeric code (e.g., `AB12`)
- Ensure **GDPR/CCPA compliance** for user data (e.g., location, theme).
- Use **HTTPS**, **JWT**, and **rate limiting** for 4-character code access.

## Version Control and Collaboration
- Use **Git** with branching strategy:
  - `feature/`, `bugfix/`, `main`
- Follow commit message format (e.g., `feat: add theme toggle`).
- Require **peer reviews** for all code changes.

## Testing and Deployment
- Write **unit tests** (Jest) and **end-to-end tests** (Cypress) for critical features.
- Use `npm run test` for unit tests, `npm run test:coverage` for coverage reports, and `npm run cypress:open` for e2e testing.
- Deploy via **Vercel** with **CI/CD pipelines**.
- Test UI consistency on **Chrome**, **Firefox**, **Safari**, and **Edge**.

## Documentation and Onboarding
- Maintain a developer **README** with setup instructions and **Supabase** config.
- Document **API endpoints** and **Supabase Edge Functions**.
- Provide **onboarding guides** for new developers.

## Additional Requirements
- Use **Next.js 14** (App Router) with **TypeScript**.
- Style with **Tailwind CSS**, using CSS variables (e.g., `bg-primary`, `text-primary`, `hover:bg-primary-hover`), with `dark:` classes.
- Use **ShadCN** components and **Lucide React** icons.
- Use **Supabase** (PostgreSQL, Storage, Edge Functions, Authentication).
- Support **Admin** (full access) and **Team Member** (assigned data, title editing) roles.
- Implement **4-character code access** for Client Portal (alphanumeric, secure, expirable, read-only).
- Include **time-based greeting** on Home Dashboard:
  - “Good Morning” (12 AM–11:59 AM)
  - “Good Afternoon” (12 PM–11:59 PM)
- Display **local time/weather** on Home Dashboard.
- Support **light/dark mode** with toggle and `prefers-color-scheme`.
- Ensure **responsive design**, **WCAG 2.1 AA** accessibility, **performance** (< 2s load, < 200ms API), and **loading states** (ShadCN Skeleton).
- Use **Supabase Row Level Security (RLS)** for GDPR/CCPA compliance and role-based access.