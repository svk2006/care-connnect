# CareConnect - Architecture & API Documentation

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│         Frontend (Next.js + React)              │
│  - Dashboard Components                         │
│  - Role-Based UI                                │
│  - Real-Time Subscriptions                      │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│    Authentication & State Management            │
│  - AuthContext (Login/Session)                  │
│  - Real-time Hooks (useRealtimeRequests, etc.)  │
│  - Load Balancer Logic                          │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│    Supabase (Backend-as-a-Service)              │
│  - PostgreSQL Database                          │
│  - Real-Time Subscriptions                      │
│  - Authentication (Auth)                        │
│  - Row-Level Security (RLS)                     │
└─────────────────────────────────────────────────┘
```

## Database Schema

### profiles Table
```sql
- id (UUID): Primary key, references auth.users
- email (TEXT): User email
- full_name (TEXT): User full name
- role (TEXT): User role (patient, receptionist, hospital_admin, operator, government_admin, master, db_admin)
- created_at (TIMESTAMP): Creation timestamp
```

### hospitals Table
```sql
- id (UUID): Primary key
- name (TEXT): Hospital name
- location (TEXT): Hospital location
- available_beds (INTEGER): Number of available beds
- emergency_capacity (INTEGER): Emergency bed capacity
- updated_at (TIMESTAMP): Last update timestamp
```

### requests Table
```sql
- id (UUID): Primary key
- patient_name (TEXT): Patient name
- severity (TEXT): Request severity (low, medium, critical)
- status (TEXT): Request status (pending, assigned, completed)
- assigned_hospital (UUID): Assigned hospital ID (foreign key)
- created_by (UUID): User who created request (foreign key to profiles)
- created_at (TIMESTAMP): Creation timestamp
```

## API Functions

### Database Functions (lib/database.ts)

#### Request Operations

```typescript
// Fetch all requests
async function fetchRequests(): Promise<Request[]>

// Fetch user's own requests
async function fetchUserRequests(userId: string): Promise<Request[]>

// Create new request
async function createRequest(request: {
  patient_name: string
  severity: string
  created_by: string
}): Promise<Request>

// Update request
async function updateRequest(
  id: string,
  updates: Partial<Request>
): Promise<Request>
```

#### Hospital Operations

```typescript
// Fetch all hospitals
async function fetchHospitals(): Promise<Hospital[]>

// Fetch specific hospital
async function fetchHospitalById(id: string): Promise<Hospital>

// Update hospital details
async function updateHospital(
  id: string,
  updates: Partial<Hospital>
): Promise<Hospital>
```

#### Profile Operations

```typescript
// Fetch user profile
async function fetchUserProfile(userId: string): Promise<UserProfile>

// Fetch all users
async function fetchAllUsers(): Promise<UserProfile[]>

// Update user role
async function updateUserRole(
  userId: string,
  role: string
): Promise<UserProfile>
```

#### Authentication

```typescript
// Sign up new user
async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<AuthData>

// Sign in user
async function signIn(
  email: string,
  password: string
): Promise<AuthData>

// Sign out user
async function signOut(): Promise<void>

// Get current user
async function getCurrentUser(): Promise<User>
```

#### Real-Time Subscriptions

```typescript
// Subscribe to request changes
function subscribeToRequests(
  callback: (payload: any) => void
): RealtimeChannel

// Subscribe to hospital changes
function subscribeToHospitals(
  callback: (payload: any) => void
): RealtimeChannel
```

### Custom Hooks (hooks/useRealtime.ts)

```typescript
// Hook for real-time requests with auto-refresh
function useRealtimeRequests(): {
  requests: Request[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Hook for real-time hospitals with auto-refresh
function useRealtimeHospitals(): {
  hospitals: Hospital[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

### Load Balancer Functions (lib/loadBalancer.ts)

```typescript
// Assign single request to best hospital
async function assignHospital(
  request: Request,
  hospitals: Hospital[]
): Promise<string | null>

// Batch assign all pending requests
async function runLoadBalancer(
  requests: Request[],
  hospitals: Hospital[]
): Promise<string[]>

// Get system analytics
function getAnalytics(
  requests: Request[],
  hospitals: Hospital[]
): {
  totalRequests: number
  assignedRequests: number
  pendingRequests: number
  completedRequests: number
  totalBedsAvailable: number
  totalEmergencyCapacity: number
  criticalRequests: number
  mediumRequests: number
  lowRequests: number
  bedUtilization: string
}
```

## Load Balancer Algorithm

The load balancer uses an intelligent algorithm to assign patient requests:

### Algorithm Steps

1. **Filter Available Hospitals**
   - Only consider hospitals with `available_beds > 0`
   - Return null if no hospitals available

2. **Sort by Priority**
   - **If Critical Severity**:
     - Sort by `emergency_capacity` (descending)
     - Ensures critical cases get emergency beds
   - **If Medium/Low Severity**:
     - Sort by `available_beds` (descending)
     - Uses general bed capacity

3. **Select Top Hospital**
   - Pick the first hospital after sorting
   - If no hospitals match criteria, return null

4. **Update Records**
   - Set request `status` to "assigned"
   - Set request `assigned_hospital` to selected hospital ID
   - Decrement selected hospital `available_beds` by 1

### Example Scenario

```
Hospitals:
- Hospital A: 50 beds, 20 emergency
- Hospital B: 30 beds, 25 emergency
- Hospital C: 10 beds, 5 emergency

Request 1: Critical (severity=critical)
→ Sort by emergency_capacity: B(25) > A(20) > C(5)
→ Assign to Hospital B

Request 2: Medium (severity=medium)
→ Filter same hospitals
→ Sort by available_beds: A(50) > B(29) > C(10)
→ Assign to Hospital A
```

## Authentication Flow

### User Login
1. User enters email/password in login form
2. `signIn()` called with credentials
3. Supabase validates credentials
4. Session token returned
5. `fetchUserProfile()` retrieves user role
6. AuthContext updated with user data
7. Component redirects based on role

### User Registration
1. User enters email/password/name in signup form
2. `signUp()` called
3. Supabase creates auth user
4. Profile record auto-created with role="patient"
5. User logs in and is redirected to /dashboard/patient

### Role-Based Routing

```typescript
const roleRoutes = {
  patient: "/dashboard/patient",
  receptionist: "/dashboard/receptionist",
  hospital_admin: "/dashboard/hospital",
  operator: "/dashboard/operator",
  government_admin: "/dashboard/government",
  master: "/dashboard/master",
  db_admin: "/dashboard/db-admin",
}
```

## Real-Time Features

### Subscription Architecture

```
Supabase Real-Time Subscriptions
│
├─ requests channel
│  ├─ INSERT: New request created
│  ├─ UPDATE: Request status changed
│  └─ DELETE: Request removed
│
└─ hospitals channel
   ├─ INSERT: New hospital added
   ├─ UPDATE: Beds updated
   └─ DELETE: Hospital removed
```

### Auto-Refresh Flow

1. Hook created with `useEffect()`
2. Subscribe to Supabase channel
3. On changes, callback fires
4. `fetchData()` refreshes local state
5. Component re-renders with new data
6. Unsubscribe on unmount

## Row-Level Security (RLS)

### Policies

```sql
-- Profiles: All users can read
- SELECT: true (anyone authenticated)

-- Hospitals: All users can read
- SELECT: true (anyone authenticated)

-- Requests: All users can read
- SELECT: true (anyone authenticated)

-- Requests: Users can only insert their own
- INSERT: auth.uid() = created_by

-- Requests: Only authorized roles can update
- UPDATE: role IN ('receptionist', 'operator', 'master', 'hospital_admin')
```

## Component Structure

### Page Components

```
/dashboard/patient/page.tsx
  ├─ useAuth() - get current user
  ├─ useRealtimeRequests() - get user's requests
  ├─ useEffect() - filter for current user
  └─ Table - display requests

/dashboard/receptionist/page.tsx
  ├─ Create form
  │  ├─ inputName
  │  ├─ selectSeverity
  │  └─ createRequest()
  └─ Requests table

/dashboard/operator/page.tsx
  ├─ Load balancer control
  ├─ runLoadBalancer() button
  └─ Real-time requests/hospitals
```

### Shared Components

```
Sidebar.tsx
  ├─ Navigation links
  ├─ User profile display
  ├─ Logout button
  └─ DashboardLayout wrapper
```

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const data = await fetchRequests()
  setData(data)
} catch (error) {
  const message = error instanceof Error ? error.message : "Error"
  setError(message)
} finally {
  setLoading(false)
}
```

### User Feedback

- Error messages displayed in red banners
- Success messages in green
- Loading states with spinners
- Auto-hide messages after 3-5 seconds

## Performance Optimization

- Real-time subscriptions only active while component mounted
- Memoized callbacks prevent unnecessary re-renders
- Efficient filtering with JavaScript Array methods
- Images optimized with Next.js Image component
- CSS Tailwind utilities for minimal bundle size

## Security Considerations

- Environment variables for sensitive data
- Row-Level Security enforced on all tables
- Authentication required for all routes
- User can only see their own data (with exceptions for admin)
- No sensitive data in URL parameters
- HTTPS enforced in production

## Testing Checklist

- [ ] User signup creates profile
- [ ] Login with correct credentials works
- [ ] Wrong credentials show error
- [ ] Role detection redirects correctly
- [ ] Receptionist can create requests
- [ ] Load balancer assigns beds
- [ ] Hospital beds decrease after assignment
- [ ] Real-time updates appear across all tabs
- [ ] Master admin can change roles
- [ ] Logout works correctly
- [ ] Government analytics display correctly
- [ ] DB admin stats are accurate
