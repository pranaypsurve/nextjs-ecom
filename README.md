# E-Commerce Platform

A modern, scalable, and secure e-commerce platform built with Next.js, Redux Toolkit, RTK Query, Ant Design, and Tailwind CSS.

## Features

### Customer Features
- 🏠 Home page with featured products, categories, and banners
- 📦 Product browsing and detailed product pages
- 🛒 Shopping cart management
- 💳 Checkout with payment options and address management
- 📋 Order confirmation and tracking
- 👤 User profile management
- 📍 Address management (add, edit, delete)
- 💰 Payment method management
- 🔔 Notification management
- 🎫 Coupon application

### Admin Features
- 📊 Dashboard
- 📂 Category management
- 📦 Product management
- 📋 Order management (status, payment, delivery)
- 👥 User management
- 🎫 Coupon management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **State Management**: Redux Toolkit
- **Data Fetching**: RTK Query
- **UI Library**: Ant Design
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Fonts**: Inter, Open Sans

## Project Structure

```
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── common/            # Reusable common components
│   └── providers/         # Context providers (Redux, Ant Design)
├── lib/                   # Core utilities and configurations
│   ├── constants/         # Application constants (roles, colors, etc.)
│   ├── endpoints/         # API endpoints configuration
│   ├── store/             # Redux store and slices
│   │   ├── api/          # RTK Query API slices
│   │   └── slices/       # Redux slices
│   ├── utils/             # Utility functions
│   └── data/              # TypeScript interfaces and initial data
└── public/                # Static assets
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Colors

The application uses a consistent color scheme defined in `lib/constants/index.ts`:

- Primary: `#1890ff` (Blue)
- Secondary: `#52c41a` (Green)
- Accent: `#fa8c16` (Orange)

## Architecture

### State Management

- **Redux Toolkit**: Global state management
- **RTK Query**: API calls and data fetching
- **Reusable API Pattern**: All API calls use a centralized base API configuration

### Route Protection

Routes are protected based on user roles:
- `/admin` → ADMIN only
- `/cart` → CUSTOMER only
- `/checkout` → CUSTOMER only
- `/profile` → CUSTOMER, ADMIN
- `/orders` → CUSTOMER, ADMIN

### API Structure

- All endpoints are defined in `lib/endpoints/index.ts`
- Base API configuration in `lib/store/api/baseApi.ts`
- Token authentication via headers (future: cookies)
- Prepared for GraphQL migration

### Common Components

Reusable components from Ant Design are wrapped in `components/common/`:
- Button
- Input
- Select
- ProtectedRoute

## Development Guidelines

1. **Colors**: Use the color constants from `lib/constants/index.ts`
2. **API Calls**: Use RTK Query hooks (see `lib/store/api/productsApi.ts` for example)
3. **Components**: Extend common components from `components/common/`
4. **Types**: Define types in `lib/data/index.ts`
5. **Routes**: Use `ProtectedRoute` component for route protection

## Future Enhancements

- [ ] Database integration
- [ ] GraphQL API support
- [ ] Cookie-based authentication
- [ ] Dark mode implementation
- [ ] SEO optimization
- [ ] Testing setup

## License

Private project
