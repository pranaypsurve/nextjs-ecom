# Project Structure

This document outlines the scalable, industry-standard folder structure of the e-commerce platform.

## Folder Organization

```
├── app/                          # Next.js App Router (feature-based routing)
│   ├── admin/                   # Admin feature pages
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── categories/         # Category management
│   │   ├── products/           # Product management
│   │   ├── orders/             # Order management
│   │   ├── coupons/            # Coupon management
│   │   └── gift-cards/         # Gift card management
│   ├── profile/                # User profile feature
│   │   ├── page.tsx            # Profile page
│   │   ├── change-password/    # Change password
│   │   └── addresses/          # Address management
│   ├── orders/                 # User orders
│   ├── products/               # Product listing
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.scss            # Global styles
│
├── components/                  # React components
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx          # Site header with navigation
│   │   ├── Footer.tsx          # Site footer
│   │   └── MainLayout.tsx      # Main layout wrapper
│   ├── cart/                   # Cart feature components
│   │   └── CartDrawer.tsx      # Shopping cart drawer
│   ├── common/                 # Reusable common components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   └── providers/              # Context providers
│       ├── StoreProvider.tsx   # Redux store provider
│       └── AntdProvider.tsx    # Ant Design theme provider
│
├── store/                       # Redux store (root level)
│   ├── api/                    # RTK Query API slices
│   │   ├── baseApi.ts          # Base API configuration
│   │   └── productsApi.ts      # Products API (example)
│   ├── slices/                 # Redux slices
│   │   ├── authSlice.ts        # Authentication state
│   │   └── cartSlice.ts        # Shopping cart state
│   ├── hooks.ts                # Typed Redux hooks
│   └── index.ts                # Store configuration
│
├── lib/                         # Core utilities and configurations
│   ├── constants/              # Application constants
│   │   └── index.ts            # Roles, colors, routes, etc.
│   ├── endpoints/              # API endpoints configuration
│   │   └── index.ts            # All API endpoints
│   ├── services/               # Service layers
│   │   └── dataService.ts      # Data service (JSON for now)
│   ├── utils/                  # Utility functions
│   │   ├── apiHelpers.ts
│   │   └── index.ts
│   └── data/                   # TypeScript type definitions
│       └── index.ts            # Type interfaces
│
├── data/                        # JSON data files (temporary)
│   ├── products.json
│   ├── categories.json
│   ├── coupons.json
│   ├── giftCards.json
│   └── orders.json
│
└── public/                      # Static assets
```

## Design Principles

### 1. Feature-Based Routing (App Router)
- Routes organized by feature (admin, profile, products, orders)
- Each feature has its own folder with nested routes
- Clear separation of concerns

### 2. Component Organization
- **Layout**: Site-wide layout components
- **Common**: Reusable UI components
- **Feature-specific**: Components grouped by feature (cart, etc.)
- **Providers**: Context and state providers

### 3. State Management
- Store at root level for easy access
- Feature-based slices (auth, cart)
- API slices separated from state slices
- Typed hooks for type safety

### 4. Service Layer
- Data service abstracts data access
- Easy to replace JSON with API calls
- Consistent interface for data operations

### 5. Type Safety
- Type definitions centralized in `lib/data`
- Typed Redux hooks
- TypeScript throughout

## Scalability Features

1. **Easy Feature Addition**: Add new features by creating folders in `app/`
2. **Component Reusability**: Common components in `components/common/`
3. **API Flexibility**: Base API configuration supports future GraphQL migration
4. **State Management**: Redux Toolkit with RTK Query scales well
5. **Type Safety**: TypeScript ensures maintainability at scale

## Future Enhancements

When migrating to API/database:
1. Replace `dataService.ts` with API calls
2. Update API slices in `store/api/`
3. Remove JSON files from `data/`
4. Add API route handlers in `app/api/` (if using Next.js API routes)

## Best Practices Followed

- ✅ Feature-based organization
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Type safety
- ✅ Scalable architecture
- ✅ Industry-standard patterns
- ✅ Clear folder structure
- ✅ Consistent naming conventions

