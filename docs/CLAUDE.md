# CLAUDE.md - Development Reference

> **Primary Documentation**: See [README.md](README.md) for project overview, installation, and general information.

## Development-Specific Information

This file contains detailed development information for working with the Mustache Cashstage codebase. For project overview, installation, and general documentation, see [README.md](README.md).

## 1. STATE MANAGEMENT ARCHITECTURE

### Zustand Store Structure
```typescript
// Dashboard Store - apps/web/src/stores/dashboard-store.ts
interface DashboardStore {
  // Dashboard state
  dashboards: Dashboard[]
  currentDashboard: Dashboard | null
  
  // Widget management
  widgets: Widget[]
  selectedWidget: Widget | null
  
  // Auto-save functionality
  isDirty: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  
  // Actions
  createDashboard: (dashboard: Partial<Dashboard>) => void
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void
  saveChanges: () => Promise<void>
}
```

### Data Flow Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │ -> │  Worker Service  │ -> │  PostgreSQL     │
│  (Google Sheets)│    │  (Background     │    │  (Processed     │
│  (CSV, APIs)    │    │   Processing)    │    │   Data)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          |
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │ <- │   Next.js API    │ <- │   Redis Cache   │
│  (React Charts) │    │  (Query Layer)   │    │  (Fast Access)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 2. CRITICAL DEVELOPMENT FILES

### Core Application Files
```bash
# Main application entry points
apps/web/src/app/page.tsx                    # Homepage with dashboard builder
apps/web/src/app/layout.tsx                  # Root layout with providers

# Dashboard system
apps/web/src/components/dashboard/
├── dashboard-builder.tsx                    # Main dashboard builder component
├── dashboard-grid.tsx                       # Grid layout system
├── widget-card.tsx                          # Individual widget container
└── widget-editor-sidebar.tsx               # Widget configuration panel

# Chart components
apps/web/src/components/charts/
├── bar-chart.tsx                           # Bar chart implementation
├── line-chart.tsx                          # Line chart with time series
├── pie-chart.tsx                           # Pie/donut charts
├── metric-card.tsx                         # KPI metric cards
└── data-table.tsx                          # Tabular data display

# State management
apps/web/src/stores/
├── dashboard-store.ts                      # Dashboard state (Zustand)
├── data-source-store.ts                    # Data source management
└── ui-store.ts                             # UI state and selections

# Data layer
apps/web/src/lib/
├── demo-data.ts                            # Demo data generation
├── demo-data-service.ts                    # Demo data API
├── semantic-merge-engine.ts                # Multi-source data merging
└── chart-utils.ts                          # Chart data processing
```

### Configuration Files
```bash
# Root configuration
package.json                                # Monorepo dependencies
turbo.json                                  # Turborepo configuration
docker-compose.dev.yml                     # Development environment

# Database
apps/web/prisma/schema.prisma              # Database schema
apps/web/prisma/migrations/                # Database migrations

# TypeScript & ESLint
tsconfig.base.json                          # Base TypeScript config
apps/web/.eslintrc.json                     # Next.js ESLint config
packages/*/tsconfig.json                    # Package-specific configs

# Storybook
apps/web/.storybook/main.ts                # Storybook configuration
apps/web/chromatic.config.json             # Visual testing config
```

## 3. DEVELOPMENT WORKFLOW

### Daily Development Commands
```bash
# Start development environment
npm run dev                     # Start all services (recommended)
npm run dev:web                 # Web app only (port 3000)
npm run dev:api                 # API service only (port 3001)

# Database management
npm run docker:dev              # Start PostgreSQL & Redis
npm run db:studio               # Prisma Studio (database GUI)
npm run db:migrate              # Run database migrations
npm run db:reset                # Reset database to clean state

# Component development
npm run storybook               # Start Storybook (port 6006)
npm run chromatic               # Visual regression testing
npm run build-storybook         # Build static Storybook

# Code quality
npm run lint                    # ESLint all packages
npm run typecheck               # TypeScript validation
npm run format                  # Prettier code formatting
npm run test                    # Run all tests
```

### Debugging & Diagnostics
```bash
# View logs
npm run docker:logs             # Docker service logs
npm run docker:logs:db          # PostgreSQL logs only

# Database inspection
psql $DATABASE_URL              # Direct database access
npm run db:seed                 # Seed with demo data

# Performance profiling
npm run analyze                 # Bundle size analysis
npm run lighthouse              # Performance audit
```

### WSL2 Specific Commands
```bash
# Port forwarding (if needed)
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.x.x.x

# WSL2 diagnostics
wsl --list --verbose            # Check WSL2 status
wsl --shutdown                  # Restart WSL2 if needed
```

## 4. INTEGRATION ARCHITECTURE

### Current Data Sources
```typescript
// Google Sheets Integration
interface GoogleSheetsConfig {
  spreadsheetId: string
  sheetName: string
  range: string
  authMethod: 'oauth' | 'service_account'
  refreshInterval: number
}

// Demo Data Service
interface DemoDataConfig {
  type: 'marketing_campaigns' | 'sales_funnel' | 'user_engagement'
  dateRange: { start: Date; end: Date }
  granularity: 'daily' | 'weekly' | 'monthly'
  metrics: string[]
}
```

### Backend API Architecture
```typescript
// NestJS API Structure
apps/api/src/
├── modules/
│   ├── dashboard/              # Dashboard CRUD operations
│   ├── data-sources/           # Data source management
│   ├── auth/                   # Authentication & authorization
│   └── ingestion/              # Background data processing
├── guards/                     # Authentication guards
├── pipes/                      # Validation pipes
└── interceptors/               # Request/response interceptors
```

### External API Integration Points
- **`/api/v1/data-ingestion/google-sheets`** - Google Sheets data import
- **`/api/v1/health`** - System health monitoring
- **`/api/v1/organizations/{id}/dashboards`** - Multi-tenant dashboard access
- **`/api/auth/[...nextauth]`** - NextAuth.js authentication flow

## 5. DEVELOPMENT PATTERNS & CONVENTIONS

### Component Development Pattern
```typescript
// 1. Create component with TypeScript interface
interface ChartWidgetProps {
  data: ChartData[]
  config: ChartConfig
  onUpdate?: (config: ChartConfig) => void
}

// 2. Implement component with Radix UI primitives
export function ChartWidget({ data, config, onUpdate }: ChartWidgetProps) {
  // Component logic
}

// 3. Create Storybook story
export default {
  title: 'Dashboard/ChartWidget',
  component: ChartWidget,
} as Meta<typeof ChartWidget>

// 4. Export from package index
export { ChartWidget } from './chart-widget'
```

### State Management Pattern
```typescript
// Zustand store with TypeScript
interface DashboardStore {
  // State
  currentDashboard: Dashboard | null
  
  // Computed values
  selectedWidgets: Widget[]
  
  // Actions
  selectWidget: (widgetId: string) => void
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void
}

// TanStack Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['dashboard', dashboardId],
  queryFn: () => fetchDashboard(dashboardId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### Error Handling Pattern
```typescript
// API error handling
try {
  const result = await api.createWidget(widgetData)
  return result
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
    toast.error(error.message)
  } else if (error instanceof NetworkError) {
    // Handle network errors
    toast.error('Network error. Please try again.')
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error)
    toast.error('An unexpected error occurred.')
  }
  throw error
}
```

## 6. TROUBLESHOOTING

### Common Development Issues

**Port conflicts**:
```bash
# Check what's using port 3000
lsof -i :3000
# Kill process if needed
kill -9 <PID>
```

**Database connection issues**:
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.dev.yml ps
# Restart database
npm run docker:restart
```

**TypeScript errors after dependency changes**:
```bash
# Clean TypeScript cache
npm run clean
# Reinstall dependencies
npm install
# Rebuild packages
npm run build
```

**Storybook build failures**:
```bash
# Clear Storybook cache
npm run storybook:clean
# Rebuild Storybook
npm run build-storybook
```

### WSL2 Specific Issues

**Database connection from Windows host**:
```bash
# Get WSL2 IP address
wsl hostname -I
# Update DATABASE_URL in .env.local
DATABASE_URL=postgresql://mustache:mustache_dev_password@172.x.x.x:5432/mustache_dev
```

**Performance issues**:
- Ensure project is in WSL2 filesystem (not Windows filesystem)
- Use WSL2 terminal for all development commands
- Configure Windows Defender exclusions for WSL2 directories

---

## DEVELOPMENT INSTRUCTION REMINDERS

### Core Principles
- **Do what has been asked; nothing more, nothing less**
- **NEVER create files unless absolutely necessary for achieving your goal**
- **ALWAYS prefer editing existing files to creating new ones**
- **NEVER proactively create documentation files (*.md) or README files unless explicitly requested**

### CLAUDE.MD UPDATE TRIGGER
**Preferred reminder prompt**: "Please update CLAUDE.md with any significant changes or new information discovered during this work."

**Update triggers**:
- Adding new features or major functionality
- Changing architecture or tech stack
- Adding new packages or dependencies
- Discovering important patterns or conventions
- Completing significant refactoring
- Adding new development tools or scripts
- Updating critical file paths or configurations

### Quick Reference
- **Main docs**: [README.md](../README.md) - Project overview and setup
- **API docs**: [api/README.md](api/README.md) - Complete API reference
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- **Performance**: [PERFORMANCE_STANDARDS.md](PERFORMANCE_STANDARDS.md) - Performance standards