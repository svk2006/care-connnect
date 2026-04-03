# CareConnect - Setup Instructions

## Quick Start Guide

### Step 1: Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: From Supabase Dashboard → Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase Dashboard → Settings → API

### Step 2: Supabase Configuration

#### Create Tables
Run this SQL in Supabase SQL Editor:

```sql
-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hospitals Table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  available_beds INTEGER NOT NULL DEFAULT 0,
  emergency_capacity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Requests Table
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed')),
  assigned_hospital UUID REFERENCES hospitals(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_requests_assigned_hospital ON requests(assigned_hospital);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can read hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Users can read all requests" ON requests FOR SELECT USING (true);
CREATE POLICY "Users can insert own requests" ON requests FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authorized users can update requests" ON requests FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('receptionist', 'operator', 'master', 'hospital_admin')
  )
);
```

#### Insert Sample Data

```sql
-- Insert sample hospitals
INSERT INTO hospitals (name, location, available_beds, emergency_capacity) VALUES
  ('Central Medical Hospital', 'Downtown', 50, 20),
  ('North General Hospital', 'North District', 40, 15),
  ('South Medical Center', 'South District', 35, 12);

-- Create test user (after first signup in UI)
-- User will be auto-created in profiles table via the signup flow
```

### Step 3: Create Test Users

Option 1: Via Authentication UI
1. Go to `/login`
2. Sign up with test emails
3. Profiles are auto-created on signup

Option 2: Manual via Supabase
1. Go to Authentication → Users
2. Add new users
3. Manually create profiles in the profiles table

### Step 4: Assign Roles

Use Master Admin dashboard to assign roles:
- patient
- receptionist
- hospital_admin
- operator
- government_admin
- master
- db_admin

### Step 5: Run the Application

```bash
npm install
npm run dev
```

Visit: `http://localhost:3000`

## Testing Workflows

### Test 1: Patient Creates Request
1. Login as **receptionist**
2. Go to Receptionist Dashboard
3. Create a request (Patient: "John Doe", Severity: "critical")
4. View in Requests table
5. Status should be "pending"

### Test 2: Load Balancer Assignment
1. Login as **operator**
2. Go to Operator Dashboard
3. Verify pending requests exist
4. Click "Run Load Balancer"
5. Requests should move to "assigned" status
6. Hospital beds should decrease

### Test 3: View Analytics
1. Login as **government_admin**
2. See charts and statistics
3. Try as **db_admin** for system stats

### Test 4: Manage Users
1. Login as **master**
2. View all users
3. Change a user's role
4. Test user sees new dashboard

### Test 5: Real-Time Updates
1. Open two browser windows
2. Login as different users
3. Create requests in one
4. Watch update in realtime in other

## Troubleshooting

### Issue: Login doesn't work
- ✅ Check Supabase URL and Key are correct
- ✅ Verify user exists in Supabase Auth
- ✅ Check profiles table has user's profile
- ✅ Browser console for auth errors

### Issue: Load Balancer doesn't work
- ✅ Verify hospitals have beds available
- ✅ Check hospital data exists
- ✅ Verify requests are in "pending" status
- ✅ Check browser console for errors

### Issue: Real-time updates not working
- ✅ Verify RLS Policies are set correctly
- ✅ Check Supabase RLS is enabled on tables
- ✅ Restart the dev server
- ✅ Check browser WebSocket connection

### Issue: Role-based access not working
- ✅ Verify profile has correct role
- ✅ Check role string matches exactly (use lowercase with underscores)
- ✅ Logout and login again to refresh
- ✅ Check browser console for routing errors

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## File Structure Overview

```
src/
├── app/                    # Next.js app routes
├── components/             # Reusable React components
├── contexts/              # React contexts (Auth)
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities and logic
    ├── database.ts        # Supabase queries
    ├── loadBalancer.ts    # Load balancing algorithm
    └── supabase.ts        # Supabase client
```

## Key Components

### Authentication Context (`contexts/AuthContext.tsx`)
- Manages user state
- Fetches user profile on login
- Provides auth status to app

### Real-time Hooks (`hooks/useRealtime.ts`)
- Provides live data from Supabase
- Auto-subscribes to table changes
- Updates UI in real-time

### Load Balancer (`lib/loadBalancer.ts`)
- Filters hospitals by availability
- Prioritizes by severity (critical uses emergency_capacity)
- Updates request and hospital status

## Production Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms
1. Build: `npm run build`
2. Set environment variables
3. Start: `npm run start`
4. Point domain to deployment

## API Reference

### Database Functions (lib/database.ts)

```typescript
// Requests
fetchRequests()
fetchUserRequests(userId)
createRequest(request)
updateRequest(id, updates)

// Hospitals
fetchHospitals()
updateHospital(id, updates)

// Profiles
fetchUserProfile(userId)
fetchAllUsers()
updateUserRole(userId, role)

// Authentication
signUp(email, password, fullName)
signIn(email, password)
signOut()
getCurrentUser()

// Real-time
subscribeToRequests(callback)
subscribeToHospitals(callback)
```

### Load Balancer Functions (lib/loadBalancer.ts)

```typescript
assignHospital(request, hospitals): Promise<string | null>
runLoadBalancer(requests, hospitals): Promise<string[]>
getAnalytics(requests, hospitals): Object
```

## Next Steps

1. ✅ Set up Supabase account
2. ✅ Create tables and test data
3. ✅ Configure environment variables
4. ✅ Run development server
5. ✅ Test all dashboards and workflows
6. ✅ Deploy to production

For more help, see README.md or Supabase docs at https://supabase.com/docs
