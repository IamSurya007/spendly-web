# Fiscora — Personal Finance OS

A modern Next.js frontend for the Fiscora personal finance platform.

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Auth**: Firebase Authentication (Google + Email/Password)
- **API**: Axios with automatic Firebase token injection
- **Icons**: Lucide React
- **Toast**: react-hot-toast

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy the environment template and fill in your Firebase project config:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your Firebase credentials from the Firebase Console → Project Settings → Your Apps.

### 3. Set the API URL

In `.env.local`, ensure `NEXT_PUBLIC_API_URL` points to your running NestJS backend:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Start development server

```bash
npm run dev
```

The app will be available at [http://localhost:3001](http://localhost:3001).

## Database Note

The NestJS backend uses TypeORM with `synchronize: true`. Upon the **first user sign-in**, the app sends a `POST /users/me` request to the backend which triggers automatic PostgreSQL table creation. No manual migrations are needed.

## Pages

| Route | Page |
|---|---|
| `/login` | Auth (Google + Email/Password) |
| `/` | Dashboard overview |
| `/expenses` | Expense tracker with CRUD |
| `/budgets` | Budget limits with progress cards |
| `/loans` | Loan management |
| `/investments` | Investment portfolio |
| `/settings` | Profile, Sheets integration, notifications |

## Project Structure

```
app/
  (auth)/login/       # Login page
  (dashboard)/        # Protected pages with sidebar layout
    page.tsx          # Dashboard
    expenses/
    budgets/
    loans/
    investments/
    settings/
components/
  ui/                 # Shared UI: Button, Modal, Input, Select, Badge, ProgressBar, Skeleton
  layout/             # Sidebar, Navbar
  dashboard/          # Summary cards, activity feed, sync button
  expenses/           # Table, modal, filters
  budgets/            # Cards, edit drawer
  loans/              # Modal, upcoming repayments
  investments/        # Modal, maturing soon
  settings/           # Sheets widget, FCM toggle
lib/
  firebase.ts         # Firebase initialization
  api.ts              # Axios client with token interceptor
  formatters.ts       # INR currency, date helpers
context/
  AuthContext.tsx     # Firebase auth + backend sync
middleware.ts         # Route protection
```
