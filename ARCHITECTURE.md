# Architecture Guide

This document explains the architecture and setup of the e-commerce platform.

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles and CSS variables
│
├── components/                   # React components
│   ├── common/                  # Reusable common components
│   │   ├── Button.tsx          # Button wrapper (Ant Design)
│   │   ├── Input.tsx           # Input wrapper (Ant Design)
│   │   ├── Select.tsx          # Select wrapper (Ant Design)
│   │   ├── ProtectedRoute.tsx  # Route protection component
│   │   └── index.ts            # Exports
│   └── providers/              # Context providers
│       ├── StoreProvider.tsx   # Redux store provider
│       └── AntdProvider.tsx    # Ant Design theme provider
│
├── lib/                         # Core utilities and configurations
│   ├── constants/              # Application constants
│   │   └── index.ts           # Roles, colors, route permissions, etc.
│   ├── endpoints/              # API endpoints configuration
│   │   └── index.ts           # All API endpoints defined here
│   ├── store/                  # Redux store
│   │   ├── api/               # RTK Query API slices
│   │   │   ├── baseApi.ts    # Base API configuration
│   │   │   └── productsApi.ts # Example API slice
│   │   ├── slices/            # Redux slices
│   │   │   └── authSlice.ts  # Authentication state
│   │   ├── hooks.ts           # Typed Redux hooks
│   │   └── index.ts           # Store configuration
│   ├── utils/                  # Utility functions
│   │   ├── apiHelpers.ts      # API helper functions
│   │   └── index.ts           # Exports
│   └── data/                   # TypeScript interfaces and data
│       └── index.ts           # Type definitions (Product, Order, etc.)
│
└── public/                      # Static assets
```

## Key Concepts

### 1. State Management (Redux Toolkit + RTK Query)

**Store Setup:**
- Store is configured in `lib/store/index.ts`
- Uses RTK Query for all API calls
- Authentication state managed in `lib/store/slices/authSlice.ts`

**Usage Example:**
```typescript
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { useGetProductsQuery } from "@/lib/store/api/productsApi";

function MyComponent() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetProductsQuery({ page: 1, limit: 10 });
  
  // Component logic
}
```

### 2. API Calls (RTK Query)

**Pattern:**
1. All endpoints defined in `lib/endpoints/index.ts`
2. Base API configuration in `lib/store/api/baseApi.ts`
3. Feature-specific API slices extend baseApi (see `productsApi.ts` as example)

**Creating New API Slice:**
```typescript
import { baseApi } from "./baseApi";
import { ENDPOINTS, getEndpoint } from "@/lib/endpoints";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => getEndpoint(ENDPOINTS.CATEGORIES.LIST),
      providesTags: ["Category"],
    }),
    // Add more endpoints...
  }),
});

export const { useGetCategoriesQuery } = categoriesApi;
```

### 3. Route Protection (RBAC)

**Configuration:**
- Route permissions defined in `lib/constants/index.ts` (`ROUTE_PERMISSIONS`)
- Use `ProtectedRoute` component to wrap protected pages

**Usage:**
```typescript
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function CartPage() {
  return (
    <ProtectedRoute>
      <div>Cart Content</div>
    </ProtectedRoute>
  );
}
```

**Route Permissions:**
- `/admin` → ADMIN only
- `/cart` → CUSTOMER only
- `/checkout` → CUSTOMER only
- `/profile` → CUSTOMER, ADMIN
- `/orders` → CUSTOMER, ADMIN

### 4. Common Components

**Usage:**
```typescript
import { Button, Input, Select } from "@/components/common";

function MyForm() {
  return (
    <>
      <Input placeholder="Enter text" />
      <Select options={[...]} />
      <Button variant="primary">Submit</Button>
    </>
  );
}
```

### 5. Styling

**Color Scheme:**
- Colors defined in `lib/constants/index.ts` (`COLORS`)
- CSS variables in `app/globals.css`
- Use CSS variables for consistency and dark mode support

**Example:**
```css
.my-element {
  color: var(--color-primary);
  background: var(--color-bg-gray);
  border: 1px solid var(--color-border);
}
```

**Fonts:**
- Inter and Open Sans configured in `app/layout.tsx`
- Available via CSS variables: `var(--font-inter)`, `var(--font-open-sans)`

### 6. Authentication

**Token Management:**
- Currently uses localStorage (see `STORAGE_KEYS` in constants)
- Token automatically added to API requests via baseApi
- Future: Will migrate to cookies

**Auth Actions:**
```typescript
import { useAppDispatch } from "@/lib/store/hooks";
import { setCredentials, logout } from "@/lib/store/slices/authSlice";

const dispatch = useAppDispatch();

// Login
dispatch(setCredentials({ user, token }));

// Logout
dispatch(logout());
```

## Next Steps

1. **Create Pages:**
   - Set up routes in `app/` directory
   - Use `ProtectedRoute` for protected pages
   - Follow the existing structure

2. **Add API Slices:**
   - Create new API slices following `productsApi.ts` pattern
   - Add endpoints to `lib/endpoints/index.ts`
   - Use typed hooks in components

3. **Add Components:**
   - Create feature-specific components
   - Extend common components from `components/common/`
   - Use Ant Design components directly when needed

4. **Data Management:**
   - Currently using JSON (see `lib/data/index.ts` for types)
   - Future: Replace with API calls
   - All types defined in `lib/data/index.ts`

5. **Styling:**
   - Use Tailwind CSS classes
   - Use CSS variables for colors
   - Maintain consistency with design system

## Best Practices

1. **API Calls:**
   - Always use RTK Query hooks
   - Don't create separate API calling logic
   - Use endpoints from `lib/endpoints/index.ts`

2. **State Management:**
   - Use Redux for global state
   - Use RTK Query for server state
   - Use local state for component-specific state

3. **Components:**
   - Prefer reusable common components
   - Extend Ant Design components when needed
   - Keep components small and focused

4. **Type Safety:**
   - Define types in `lib/data/index.ts`
   - Use TypeScript strictly
   - Export types for reuse

5. **Security:**
   - Always protect routes with `ProtectedRoute`
   - Validate user roles before sensitive operations
   - Token automatically included in API requests

