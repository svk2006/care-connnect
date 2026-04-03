# CareConnect Development Guidelines

## Project Overview
CareConnect is a full-stack hospital load balancing web application built with:
- **Frontend**: Next.js 16+ with React and TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State**: React Context + Zustand ready
- **Real-Time**: Supabase subscriptions

## Code Style & Conventions

### File Organization
- Components: `src/components/` - Reusable React components
- Contexts: `src/contexts/` - React context providers
- Hooks: `src/hooks/` - Custom React hooks
- Libraries: `src/lib/` - Utilities, database queries, business logic
- Pages: `src/app/` - Next.js App Router pages

### Naming Conventions
- Components: PascalCase (e.g., `PatientDashboard.tsx`)
- Functions/utilities: camelCase (e.g., `fetchRequests()`)
- Types/Interfaces: PascalCase (e.g., `Request`, `Hospital`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_REQUESTS`)

### TypeScript
- Always use TypeScript - no `.js` files
- Define interfaces for all data structures
- Use proper typing for function parameters and returns
- Use `as const` for literal types where appropriate

### React Best Practices
- Use `"use client"` directive for client components
- Use functional components only
- Use hooks for state and side effects
- Extract complex logic to custom hooks
- Memoize expensive operations with `useCallback`

### Database Operations
- All DB operations in `src/lib/database.ts`
- Use `createClient()` from `src/lib/supabase.ts`
- Always handle errors with try-catch
- Return typed results or throw errors
- No mixed concerns (queries + UI logic)

### Real-Time Updates
- Use `useRealtimeRequests()` and `useRealtimeHospitals()` hooks
- Subscriptions auto-cleanup on unmount
- Data auto-refetches on changes
- No manual polling needed

## Architecture Patterns

### Data Flow
```
User Interaction
     ↓
Component State Update
     ↓
DB Query (lib/database.ts)
     ↓
Supabase API Call
     ↓
Real-time Subscription Triggered
     ↓
Auto-refresh via useRealtime hook
     ↓
Component State Updated
     ↓
UI Re-render
```

### Error Handling Pattern
```typescript
try {
  const data = await fetchRequests()
  setData(data)
  setError(null)
} catch (err) {
  const message = err instanceof Error ? err.message : "Error occurred"
  setError(message)
} finally {
  setLoading(false)
}
```

### Component Template
```typescript
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRealtimeRequests } from "@/hooks/useRealtime"
import { DashboardLayout } from "@/components/Sidebar"

export default function DashboardPage() {
  const { user } = useAuth()
  const { requests, loading } = useRealtimeRequests()
  const [state, setState] = useState("")

  useEffect(() => {
    // Side effects here
  }, [dependencies])

  if (loading) return <DashboardLayout title="Dashboard"><p>Loading...</p></DashboardLayout>

  return (
    <DashboardLayout title="Dashboard">
      {/* Content here */}
    </DashboardLayout>
  )
}
```

## Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client initialization |
| `lib/database.ts` | All database query functions |
| `lib/loadBalancer.ts` | Load balancing algorithm |
| `hooks/useRealtime.ts` | Real-time data hooks |
| `contexts/AuthContext.tsx` | Authentication state management |
| `components/Sidebar.tsx` | Navigation sidebar component |
| `app/layout.tsx` | Root layout with AuthProvider |

## Common Tasks

### Add a New Dashboard
1. Create `/app/dashboard/[role]/page.tsx`
2. Import `useAuth()`, `useLotimeRequests()` hooks
3. Use `<DashboardLayout>` component
4. Fetch and display relevant data
5. Add role-based logic as needed

### Add a New Database Query
1. Add function to `lib/database.ts`
2. Use `createClient()` for Supabase instance
3. Handle errors properly
4. Return typed results
5. Export function for use in components

### Add Real-Time Updates
1. Use `useRealtimeRequests()` or `useRealtimeHospitals()` hook
2. Subscriptions auto-managed by hook
3. Data auto-refreshes on database changes
4. No manual subscription cleanup needed

### Add Form Submission
1. Use React form with `<form onSubmit>`
2. Set loading state while submitting
3. Call database function in try-catch
4. Show success/error messages
5. Reset form on success
6. Refetch data to trigger real-time updates

## Testing Guidelines

### Manual Testing Checklist
- [ ] Test role-based access (try accessing restricted routes)
- [ ] Test form submissions (create request, update beds)
- [ ] Test real-time updates (open 2 tabs, make change in one)
- [ ] Test error handling (wrong credentials, network error)
- [ ] Test load balancer (insufficient beds, different severities)

### Browser Console
- No TypeScript errors
- No unhandled promise rejections
- No missing dependencies warnings
- Check Network tab for API calls

## Performance Tips

- Minimize re-renders with proper dependency arrays
- Use `useCallback()` for function props
- Lazy load components with `next/dynamic`
- Optimize images with Next.js `<Image>`
- Profile with React DevTools
- Use `generateStaticParams()` for static generation

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database tables created with RLS policies
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] All routes tested in production build
- [ ] Real-time subscriptions working
- [ ] Authentication flow tested
- [ ] Load balancer tested with sample data

## Debugging Tips

### Real-Time Updates Not Working
1. Check Supabase RLS policies
2. Verify subscription channel name matches table
3. Use browser DevTools → Network to see WebSocket
4. Check browser console for errors
5. Verify database changes are actually being made

### Authentication Issues
1. Check `.env.local` for correct Supabase keys
2. Verify user exists in Supabase Auth
3. Check profiles table for user record
4. Look at browser console for auth errors
5. Check Supabase Auth logs

### Load Balancer Not Working
1. Verify hospitals table has entries with beds
2. Check requests are in "pending" status
3. Review severity values (critical/medium/low)
4. Check browser console for errors
5. Verify database write permissions

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/description

# Make changes
# Commit with descriptive messages
git commit -m "feature: add new load balancer algorithm"

# Push and create PR
git push origin feature/description
```

## Code Review Checklist

- [ ] TypeScript types are correct
- [ ] No console.logs left in code
- [ ] Error handling is complete
- [ ] No hardcoded values/secrets
- [ ] Component properly uses hooks
- [ ] Real-time subscriptions cleanup on unmount
- [ ] Loading and error states handled
- [ ] Responsive design tested
- [ ] Tests pass locally
- [ ] Build succeeds

## Future Improvements

- Add unit tests with Jest
- Add E2E tests with Playwright
- Implement pagination for large datasets
- Add data export functionality
- Add advanced filtering/search
- Implement caching strategies
- Add audit logging
- Add notification system
- Mobile app with React Native
- Advanced analytics dashboard
