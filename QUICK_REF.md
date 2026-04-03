# CareConnect - Developer Quick Reference

## 📚 Documentation Map

| Document | Purpose | When to Read |
|---|---|---|
| **README.md** | Project overview, features, setup | Starting out |
| **SETUP.md** | Step-by-step setup guide | Before first run |
| **ARCHITECTURE.md** | Technical architecture, API docs | Understanding codebase |
| **PROJECT_SUMMARY.md** | Complete file listing, checklist | Project overview |
| **copilot-instructions.md** | Development guidelines | Before coding |
| **QUICK_REF.md** | This file - quick lookup | During development |

---

## 🚀 Quick Commands

```bash
# Setup
npm install                    # Install dependencies
npm run dev                   # Start dev server (http://localhost:3000)
npm run build                 # Build for production
npm run start                 # Start production server
npm run lint                  # Run linter

# Database
# Run SQL in Supabase SQL Editor (see SETUP.md)
```

---

## 📂 Where to Find Things

### Adding a New Feature

**New Page/Dashboard**
→ Create file in `src/app/dashboard/[role]/page.tsx`

**New API Query**
→ Add function to `src/lib/database.ts`

**New Hook**
→ Create file in `src/hooks/`

**New Component**
→ Create file in `src/components/`

**New Style**
→ Use Tailwind CSS classes directly in JSX

### Common Files

| Task | File |
|------|------|
| Authentication | `src/contexts/AuthContext.tsx` |
| Database Queries | `src/lib/database.ts` |
| Load Balancer | `src/lib/loadBalancer.ts` |
| Supabase Client | `src/lib/supabase.ts` |
| Real-Time Hooks | `src/hooks/useRealtime.ts` |
| Navigation | `src/components/Sidebar.tsx` |
| Root Layout | `src/app/layout.tsx` |
| Login Page | `src/app/login/page.tsx` |

---

## 🔌 Common Code Snippets

### Use Auth in Component
```typescript
import { useAuth } from "@/contexts/AuthContext"

const { user, profile, signOut } = useAuth()
// user: Current authenticated user
// profile: User profile with role
// signOut(): Logout function
```

### Fetch Real-Time Data
```typescript
import { useRealtimeRequests } from "@/hooks/useRealtime"

const { requests, loading, error, refetch } = useRealtimeRequests()
// Auto-subscribes to changes
// Auto-refreshes on updates
// Call refetch() manually if needed
```

### Create Database Item
```typescript
import { createRequest } from "@/lib/database"

try {
  await createRequest({
    patient_name: "John Doe",
    severity: "critical",
    created_by: user.id
  })
  // Success - data updated via real-time
} catch (error) {
  // Handle error
}
```

### Update Database Item
```typescript
import { updateRequest } from "@/lib/database"

try {
  await updateRequest(requestId, {
    status: "assigned",
    assigned_hospital: hospitalId
  })
} catch (error) {
  // Handle error
}
```

### Create Dashboard Page
```typescript
"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRealtimeRequests } from "@/hooks/useRealtime"
import { DashboardLayout } from "@/components/Sidebar"

export default function Dashboard() {
  const { user } = useAuth()
  const { requests, loading } = useRealtimeRequests()

  if (loading) return <DashboardLayout title="Dashboard"><p>Loading...</p></DashboardLayout>

  return (
    <DashboardLayout title="Dashboard">
      {/* Your content */}
    </DashboardLayout>
  )
}
```

---

## 🧾 Database Operations

### Select All
```typescript
const requests = await fetchRequests()
const hospitals = await fetchHospitals()
const users = await fetchAllUsers()
```

### Select One User's Data
```typescript
const userRequests = await fetchUserRequests(userId)
const profile = await fetchUserProfile(userId)
```

### Insert New Record
```typescript
const newRequest = await createRequest({
  patient_name: "Jane Doe",
  severity: "medium",
  created_by: userId
})
```

### Update Record
```typescript
await updateRequest(requestId, {
  status: "assigned",
  assigned_hospital: hospitalId
})

await updateHospital(hospitalId, {
  available_beds: 45
})
```

### Run Load Balancer
```typescript
import { runLoadBalancer } from "@/lib/loadBalancer"

const assignedHospitals = await runLoadBalancer(requests, hospitals)
// Returns array of hospital IDs that were assigned
```

---

## 🎨 Styling with Tailwind

### Common Patterns

```jsx
// Container/Card
<div className="bg-white rounded-lg shadow p-6">
  {/* content */}
</div>

// Button
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Click Me
</button>

// Status Badge
<span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  Pending
</span>

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* items */}
</div>

// Table
<table className="w-full">
  <thead className="bg-gray-100 border-b">
    <tr>
      <th className="px-6 py-3 text-left text-sm font-semibold">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4">Data</td>
    </tr>
  </tbody>
</table>

// Gradient
<div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
  {/* content */}
</div>
```

---

## ⚠️ Common Mistakes to Avoid

| Mistake | ❌ Wrong | ✅ Right |
|---------|---------|----------|
| Missing "use client" | `import { useState }` in server component | `"use client"` at top of file |
| No error handling | `await fetchRequests()` | `try { ... } catch { ... }` |
| Direct DB access in components | `supabase.from("requests").select()` | Use functions from `lib/database.ts` |
| Forgetting dependency array | `useEffect(() => fetch())` | `useEffect(() => fetch(), [deps])` |
| Type errors | `let x = any` | `let x: Type = value` |
| RLS permission denied | Queries fail silently | Check RLS policies in Supabase |
| Missing env variables | App crashes at runtime | Add to `.env.local` |

---

## 🐛 Debugging

### Check Authentication
```typescript
// In browser console
const { data } = await supabase.auth.getSession()
console.log(data.session?.user)
```

### Check Real-Time Subscription
```typescript
// In browser console
// Open DevTools Network tab
// Look for WebSocket connections to Supabase
// Should show "established"
```

### View Database Activity
```
Supabase Dashboard → SQL Editor → Run queries
Supabase Dashboard → Database → Inspect tables
```

### Check Logs
```
Browser Console: F12 → Console tab
Network Tab: F12 → Network tab
Supabase: Dashboard → Logs
```

---

## 🧪 Testing Checklist

Before submitting code:
- [ ] No console errors
- [ ] TypeScript no errors (`npm run build`)
- [ ] Component loads without crashing
- [ ] Real-time updates work (test in 2 tabs)
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Forms submit correctly
- [ ] Redirects work based on role

---

## 📊 Database Queries Used

### Fetch Operations (SELECT)
- `fetchRequests()` - All requests
- `fetchUserRequests(userId)` - User's own requests
- `fetchHospitals()` - All hospitals
- `fetchHospitalById(id)` - Single hospital
- `fetchUserProfile(userId)` - User profile
- `fetchAllUsers()` - All users

### Write Operations (INSERT/UPDATE)
- `createRequest(data)` - New request
- `updateRequest(id, updates)` - Update request
- `updateHospital(id, updates)` - Update hospital
- `updateUserRole(userId, role)` - Change user role

### Authentication
- `signUp(email, password, name)` - Register
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `getCurrentUser()` - Get current user

### Real-Time
- `subscribeToRequests(callback)` - Listen to request changes
- `subscribeToHospitals(callback)` - Listen to hospital changes

---

## 🚨 Troubleshooting

### App won't start
```
Error: Module not found
→ Run: npm install
```

### Build fails
```
Error: env variables
→ Check .env.local exists with correct values
```

### Supabase connection fails
```
Error: Cannot connect
→ Verify NEXT_PUBLIC_SUPABASE_URL is correct
→ Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
```

### Real-time not working
```
→ Check browser console for errors
→ Verify RLS policies in Supabase
→ Check WebSocket connection in Network tab
→ Try refreshing page
```

### Load balancer doesn't work
```
→ Verify hospitals have available_beds > 0
→ Verify requests exist and status = "pending"
→ Check browser console for errors
→ Verify database permissions
```

---

## 📝 Code Review Checklist

When reviewing your own code:
- [ ] TypeScript compiles without errors
- [ ] All functions have proper types
- [ ] Error handling is complete (try-catch)
- [ ] No hardcoded secrets in code
- [ ] Components use proper hooks
- [ ] Real-time subscriptions cleanup
- [ ] Loading/error states handled
- [ ] Tailwind classes used correctly
- [ ] No console.logs left
- [ ] Comments for complex logic

---

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs/)

---

## 💡 Tips & Tricks

1. **Use VS Code Extensions**
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets

2. **Debug Real-Time**
   - Open DevTools → Network → Filter by "WebSocket"
   - Should show active connection to Supabase

3. **Test Multiple Roles**
   - Open separate browser profiles
   - One profile per role
   - Easier to test workflows

4. **Database Testing**
   - Use Supabase SQL Editor for quick queries
   - Insert test data directly
   - Test load balancer logic manually

5. **Performance**
   - Use React DevTools Profiler
   - Check for unnecessary re-renders
   - Profile with Lighthouse

---

## ✅ Ready to Code!

You have everything you need to develop, maintain, and extend CareConnect.

**Questions?** Check the documentation files or Supabase docs.

Happy coding! 🎉
