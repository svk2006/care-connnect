# CareConnect - Hospital Load Balancing System

A full-stack hospital load balancing web application built with Next.js, React, and Supabase. This system intelligently distributes patient requests across hospitals based on availability, severity, and capacity.

## 🎯 Features

### Authentication & Authorization
- **Email/Password Authentication** with Supabase
- **Role-Based Access Control** with 7 user roles
- **Automatic Role Detection** and dashboard routing

### User Roles

1. **Patient** - View own medical requests status
2. **Receptionist** - Create and manage patient requests
3. **Hospital Admin** - Manage hospital beds and patient assignments
4. **Operator** - Control load balancer and view all system operations
5. **Government Admin** - View system analytics and statistics
6. **Master Admin** - Manage user roles and permissions
7. **DB Admin** - System-wide monitoring and statistics

### Core Functionality

- 🏥 **Multi-Hospital System** - Manage multiple hospitals with dynamic bed capacity
- 📋 **Request Management** - Receptionists create requests with patient details
- 🤖 **Smart Load Balancer** - Automatically assigns requests to optimal hospitals
- 📊 **Real-Time Analytics** - Live statistics and system monitoring
- 🔄 **Real-Time Updates** - Supabase subscriptions keep all dashboards synchronized
- 🎯 **Severity-Based Routing** - Critical requests prioritized to emergency capacity

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (https://supabase.com)

### Installation

1. **Navigate to the project directory:**
```bash
cd careconnect
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase dashboard:
- Go to Settings → API
- Copy your Project URL and Anon Key

### Database Setup

Execute the following SQL in your Supabase SQL Editor to create the required tables:

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

-- Indexes for performance
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_requests_assigned_hospital ON requests(assigned_hospital);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users to read)
CREATE POLICY "Users can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can read hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Users can read all requests" ON requests FOR SELECT USING (true);
CREATE POLICY "Users can insert own requests" ON requests FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Receptionists can update requests" ON requests FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('receptionist', 'operator', 'master')
  )
);
```

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard router
│   │   ├── patient/
│   │   │   └── page.tsx          # Patient dashboard
│   │   ├── receptionist/
│   │   │   └── page.tsx          # Receptionist dashboard
│   │   ├── hospital/
│   │   │   └── page.tsx          # Hospital admin dashboard
│   │   ├── operator/
│   │   │   └── page.tsx          # Operator dashboard
│   │   ├── government/
│   │   │   └── page.tsx          # Government analytics
│   │   ├── master/
│   │   │   └── page.tsx          # Master admin dashboard
│   │   └── db-admin/
│   │       └── page.tsx          # DB admin dashboard
│   ├── page.tsx                  # Root redirect
│   └── layout.tsx                # Root layout
├── components/
│   └── Sidebar.tsx               # Navigation sidebar
├── contexts/
│   └── AuthContext.tsx           # Authentication context
├── hooks/
│   └── useRealtime.ts            # Real-time data hooks
└── lib/
    ├── supabase.ts               # Supabase client init
    ├── database.ts               # Database queries
    └── loadBalancer.ts           # Load balancing logic
```

## 🔌 API Integration

### Supabase Queries

All database operations use Supabase client:

**Select:**
```typescript
const { data, error } = await supabase.from("requests").select("*");
```

**Insert:**
```typescript
const { data, error } = await supabase.from("requests").insert([request]);
```

**Update:**
```typescript
const { data, error } = await supabase.from("requests").update(updates).eq("id", id);
```

### Real-Time Subscriptions

```typescript
supabase
  .channel("requests-channel")
  .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, callback)
  .subscribe();
```

## 🤖 Load Balancer Logic

The load balancer intelligently assigns hospital beds based on:

1. **Availability Filter** - Only considers hospitals with available beds
2. **Severity-Based Sorting**:
   - **Critical** → Sorted by `emergency_capacity` (DESC)
   - **Medium/Low** → Sorted by `available_beds` (DESC)
3. **Auto-Update** - Request status changes to "assigned", hospital beds decremented

## 📊 Dashboard Features

### Patient Dashboard
- View personal medical requests
- Track request status and assigned hospital
- Real-time status updates

### Receptionist Dashboard
- Create new patient requests
- Specify patient name and severity level
- View all requests in the system
- Monitor request assignments

### Hospital Admin Dashboard
- View hospital details and bed capacity
- Update available beds
- View assigned patients
- Track patient load by severity

### Operator Dashboard
- View all hospitals and requests
- **Run Load Balancer** button to auto-assign pending requests
- Monitor system queue
- Real-time statistics

### Government Dashboard
- Analytics charts and statistics
- Request severity distribution
- Hospital resource utilization
- Bed usage metrics
- Read-only access

### Master Admin Dashboard
- View and manage all users
- Assign/change user roles
- User statistics by role
- Comprehensive user management

### DB Admin Dashboard
- System-wide statistics
- Database performance metrics
- Hospital and request counts
- Severity distribution graphs

## 🔐 Authentication

### Login Flow
1. User enters email and password
2. Supabase authenticates credentials
3. User profile fetched from `profiles` table
4. Role detected and user redirected to appropriate dashboard
5. Session maintained via Supabase auth state

## 🎨 UI/UX

- **Clean Dashboard Cards** - Organized information display
- **Data Tables** - Sortable, responsive tables
- **Progress Bars** - Visual analytics representation
- **Status Badges** - Color-coded request statuses
- **Gradient Cards** - Modern gradient backgrounds
- **Sidebar Navigation** - Role-based menu
- **Responsive Design** - Mobile-friendly layout

## 🧪 Testing

### Demo Credentials
Test the system with demo accounts created in your Supabase:

1. Create users in Supabase Authentication
2. Add profiles with different roles
3. Create sample hospitals and requests
4. Test different user workflows

## 🚀 Deployment

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Other Platforms
- Build: `npm run build`
- Start: `npm run start`
- Ensure environment variables are set

## 📝 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## 💡 Key Technologies

- **Next.js** - React framework with server-side rendering
- **React** - UI library
- **TypeScript** - Type safety
- **Supabase** - Backend-as-a-Service
- **Tailwind CSS** - Utility-first CSS
- **Real-Time Subscriptions** - Live data updates

## 🆘 Troubleshooting

### Not receiving real-time updates?
- Verify Supabase RLS policies are configured correctly
- Check browser console for subscription errors

### Load balancer not assigning beds?
- Verify hospitals have beds available
- Check hospital data in Supabase
- Review request severity levels

### Dashboard not loading?
- Check authentication status
- Verify user profile exists in `profiles` table
- Check browser console for errors

## 📧 Support

For issues or questions, please check Supabase documentation at https://supabase.com/docs

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
