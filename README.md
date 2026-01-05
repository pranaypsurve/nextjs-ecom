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

The project uses environment variables for configuration. Environment files are provided:

- `.env.example` - Template with all required variables
- `.env.development` - Development defaults
- `.env.production` - Production template

#### Quick Setup

1. **For local development**, copy the development file:
   ```bash
   # Windows PowerShell
   Copy-Item .env.development .env.local
   
   # Linux/Mac
   cp .env.development .env.local
   ```

2. **Or use the setup script**:
   ```bash
   # Windows PowerShell
   powershell -ExecutionPolicy Bypass -File scripts/setup-env.ps1
   
   # Linux/Mac
   bash scripts/setup-env.sh
   ```

3. **Update `.env.local`** with your local values:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   NEXT_PUBLIC_ENCRYPTION_KEY=your-local-encryption-key-min-32-chars
   ```

4. **Generate a secure encryption key**:
   ```bash
   openssl rand -base64 32
   ```

#### Required Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL
  - Development: `http://localhost:3001`
  - Production: `https://api.yourdomain.com`

- `NEXT_PUBLIC_ENCRYPTION_KEY` - Encryption key for Redux Persist (minimum 32 characters)
  - Generate: `openssl rand -base64 32`
  - Use different keys for development and production

#### Production Deployment

Set environment variables in your deployment platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Other**: Set in your platform's environment configuration

See [Environment Setup Documentation](docs/ENVIRONMENT_SETUP.md) for detailed instructions.

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
- Base API configuration in `store/api/baseApi.ts`
- **Cookie-based authentication** - Tokens stored in httpOnly cookies
- Automatic token refresh on 401 errors
- Request queuing for concurrent 401s
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

## Documentation

- [Environment Setup](docs/ENVIRONMENT_SETUP.md) - Environment variables configuration
- [Cookie-Based Authentication](docs/COOKIE_AUTH_SETUP.md) - Authentication implementation
- [Redux Persist Setup](docs/REDUX_PERSIST_SETUP.md) - State persistence configuration

## Future Enhancements

- [ ] Database integration
- [ ] GraphQL API support
- [ ] Dark mode implementation
- [ ] SEO optimization
- [ ] Testing setup

## License

Private project
