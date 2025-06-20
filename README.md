# Mustache Cashstage

> Unify, visualize, and act on your marketing data.

A next-generation marketing performance dashboard designed for clarity, speed, and total control. Mustache Cashstage helps marketing teams bring together scattered channel data into one intuitive interface — making it easy to compare, customize, and act on campaign performance insights.

**Business Goal**: Surpass Looker Studio's capabilities for marketing analytics dashboards with enhanced UX, advanced customization, and comprehensive multi-source data aggregation.

## ✨ Key Features

### Dashboard Builder System

- 🎯 **Drag & Drop Interface** - Create pixel-perfect dashboards with intuitive drag-and-drop positioning
- 📊 **Multi-Source Data Aggregation** - Combine data from up to 10 sources per chart with semantic merge engine
- 🔄 **Real-Time Auto-Save** - Automatic persistence of dashboard changes
- 📑 **Multi-Tab Dashboards** - Organize widgets across multiple dashboard tabs
- 🎨 **Brand Customization** - Add logos, colors, fonts for full white-label use

### Advanced Analytics

- 📈 **9 Chart Types** - Line charts, bar charts, pie charts, metrics cards, tables, funnels, gauges, heatmaps
- 🔍 **Campaign-Level Drilldowns** - Go from overview to ad creative insights
- 🧠 **Smart Data Processing** - Context-aware aggregation and intelligent filtering
- ⚡ **Real-Time Previews** - See exactly what you're building as you go
- 🎲 **Demo Data System** - 90 days of realistic marketing performance data

### User Experience

- 👥 **Role-Based Access** - Admin, Editor, Viewer modes with granular permissions
- 🏢 **Multi-Tenant Architecture** - Organization-based data isolation
- 🔐 **Google OAuth Integration** - Seamless authentication and data source connections
- 📱 **Fully Responsive** - Desktop-first design with tablet and mobile support
- 🌐 **WSL2 Optimized** - Enhanced development environment for Windows users

## 🏗️ Technical Architecture

### Frontend Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with design tokens
- **UI Components**: Radix UI, custom component library (@mustache/ui)
- **Data Visualization**: Recharts, D3.js integration
- **Interactions**: @dnd-kit, react-grid-layout for drag & drop
- **Animations**: Framer Motion

### Backend & Data

- **API Services**: NestJS (API service), Bull queues for background jobs
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session storage and data caching
- **State Management**: Zustand stores, TanStack Query for server state
- **Authentication**: NextAuth.js with Google OAuth

### Infrastructure & Tooling

- **Monorepo**: Turborepo with shared packages
- **Development**: Docker Compose environment
- **Component Development**: Storybook with Chromatic visual testing
- **Code Quality**: ESLint, TypeScript strict mode, Zod validation

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd dashboard-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development services**

   ```bash
   # Start PostgreSQL and Redis
   npm run docker:dev

   # Start all services (recommended)
   npm run dev

   # Or start only web application
   npm run dev:web
   ```

5. **Access the application**
   - **Web App**: http://localhost:3000
   - **API Service**: http://localhost:3001
   - **Database Admin**: http://localhost:8080 (Adminer)
   - **Storybook**: http://localhost:6006

### Development Workflow

```bash
# Start all services
npm run dev

# Start only web app
npm run dev:web

# View database
# Go to http://localhost:8080
# Server: postgres, Username: mustache, Password: mustache_dev_password, Database: mustache_dev

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck
```

## 📁 Project Structure

```
dashboard-app/
├── apps/
│   ├── web/          # Next.js frontend (main application)
│   ├── api/          # NestJS backend API service
│   └── worker/       # Background job processing service
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # TypeScript type definitions (Zod schemas)
│   ├── utils/        # Shared utilities (lodash-es integration)
│   └── data/         # Data processing utilities (aggregation, filtering, validation)
├── docs/             # Comprehensive documentation
│   ├── api/          # API documentation
│   └── deployment/   # Deployment guides
├── docker/           # Database initialization scripts
├── scripts/          # Development and deployment scripts
└── [governance files] # CONTRIBUTING.md, SECURITY.md, etc.
```

## 📊 Current Implementation Status

### ✅ Completed Features

- **Complete Infrastructure**: Monorepo setup with Turborepo and Docker development environment
- **Dashboard Builder**: Full drag-and-drop dashboard builder with widget positioning
- **Chart Library**: Complete chart component library (9 chart types)
- **Authentication System**: Google OAuth with NextAuth.js and role-based access
- **Data Architecture**: Demo data system with realistic marketing metrics
- **State Management**: Zustand stores with TanStack Query integration
- **Component Development**: Storybook environment with Chromatic visual testing
- **Multi-Source Support**: Semantic merge engine for combining data sources
- **WSL2 Optimization**: Enhanced development tooling for Windows users

### 🔄 In Progress

- **Backend API Development**: NestJS API service with comprehensive endpoints
- **Data Integration Enhancements**: Advanced Google Sheets integration
- **Performance Optimization**: Chart rendering and data processing improvements

### 🎯 Next Priorities

- **Production Deployment**: Kubernetes deployment configuration
- **Advanced Integrations**: Google Ads API, Facebook Ads API connectors
- **Real-time Updates**: WebSocket integration for live data updates
- **Advanced Analytics**: Predictive analytics and automated insights

## 🗄️ Database Architecture

PostgreSQL database with comprehensive schema supporting multi-tenancy and advanced analytics:

### Core Tables

- **`organizations`** - Multi-tenant organization structure
- **`users`** - Role-based user accounts (Admin, Editor, Viewer)
- **`dashboards`** - Dashboard configurations with metadata
- **`dashboard_tabs`** - Tab-based dashboard organization
- **`widgets`** - Chart configurations with position, styling, and data mappings
- **`data_sources`** - Connected source configurations (Google Sheets, CSV, APIs)
- **`data_snapshots`** - Cached/historical data (date partitioned for performance)
- **`themes`** - Custom branding and white-label styling

### Advanced Features

- **Multi-tenant isolation**: Organization-scoped data access
- **Date partitioning**: Optimized for time-series analytics
- **JSON configuration**: Flexible widget and data source configurations
- **Audit trail**: Change tracking for dashboard modifications

## ⚙️ Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database & Caching
DATABASE_URL=postgresql://mustache:mustache_dev_password@localhost:5432/mustache_dev
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret

# Google Integration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Configuration
API_BASE_URL=http://localhost:3001
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Development
NODE_ENV=development
TURBO_TELEMETRY_DISABLED=1
```

### WSL2 Configuration

For Windows users with WSL2, additional port forwarding may be required:

```bash
# Add to your .bashrc or .zshrc
export WSL_HOST=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
export DATABASE_URL=postgresql://mustache:mustache_dev_password@$WSL_HOST:5432/mustache_dev
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for detailed development workflows, code standards, and testing procedures.

### Quick Start for Contributors

1. **Fork and clone** the repository
2. **Create a feature branch** from `main`
3. **Make your changes** following our code standards
4. **Run the full test suite**:
   ```bash
   npm run test              # Run all tests
   npm run typecheck         # TypeScript validation
   npm run lint              # Code linting
   npm run format            # Code formatting
   ```
5. **Test your changes** in Storybook and the application
6. **Submit a pull request** with a clear description

### Development Standards

- **TypeScript**: Strict mode with comprehensive typing
- **Components**: All UI components must have Storybook stories
- **Testing**: Visual regression testing with Chromatic
- **Documentation**: Update relevant docs for new features
- **Commits**: Use conventional commit messages

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for complete guidelines.

## Development Commands

```bash
# Package management
npm run clean          # Clean all node_modules and build artifacts
npm run reset          # Clean and reinstall all dependencies

# Database
npm run db:setup       # Start database and wait for readiness

# Development
npm run dev            # Start all apps in development mode
npm run build          # Build all apps for production
npm run test           # Run all tests
npm run typecheck      # Type check all packages
```

## 🏛️ Architecture Decisions

### Design Principles

- **Performance First**: Optimized for speed with intelligent caching and lazy loading
- **Developer Experience**: Comprehensive tooling with TypeScript, Storybook, and hot reload
- **Scalability**: Multi-tenant architecture supporting enterprise-level usage
- **Flexibility**: Extensible component system and plugin architecture
- **Reliability**: Anti-fragile backend with comprehensive monitoring and error handling

### Technology Choices

- **Monorepo (Turborepo)**: Simplified dependency management and code sharing across services
- **TypeScript Strict Mode**: Enhanced type safety and developer experience
- **Tailwind CSS**: Utility-first styling with design system integration
- **Zustand**: Lightweight client-side state management
- **TanStack Query**: Powerful server state management with caching and synchronization
- **Zod**: Runtime type validation ensuring data integrity
- **PostgreSQL**: Robust relational database with advanced JSON support
- **Redis**: High-performance caching and session storage
- **NextAuth.js**: Secure authentication with OAuth provider support
- **Radix UI**: Accessible, unstyled UI primitives

### Architectural Patterns

- **Component Composition**: Reusable, composable UI components
- **Unidirectional Data Flow**: Predictable state management
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
- **Anti-Fragile Design**: Self-healing systems with comprehensive error handling

## 📚 Documentation

- **[📋 Documentation Hub](docs/README.md)** - Complete documentation index and navigation
- **[🚀 Contributing Guide](docs/CONTRIBUTING.md)** - Development workflow and standards
- **[📐 Style Guide](docs/STYLE_GUIDE.md)** - Coding standards and best practices
- **[🏷️ Versioning Guide](docs/VERSIONING_GUIDE.md)** - Release management and versioning strategy
- **[🔒 Security Policy](docs/SECURITY.md)** - Security guidelines and vulnerability reporting
- **[📊 API Documentation](docs/api/README.md)** - Comprehensive API reference
- **[🚀 Deployment Guide](docs/deployment/README.md)** - Production deployment instructions
- **[⚡ Performance Standards](docs/PERFORMANCE_STANDARDS.md)** - Performance and accessibility requirements
- **[🎨 Design System](docs/design/DESIGN_SYSTEM.md)** - UI components and design patterns
- **[📝 Changelog](docs/CHANGELOG.md)** - Version history and updates

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/dashboard-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/dashboard-app/discussions)
- **Documentation**: [docs/](docs/) directory
- **Email**: support@mustache-cashstage.dev

## 📄 License

Private - All rights reserved

---

**Mustache Cashstage** - Making marketing analytics as flexible as your campaigns.

_Surpassing Looker Studio with enhanced UX, advanced customization, and comprehensive multi-source data aggregation._
