# Style Guide & Best Practices

## Overview

This document establishes coding standards, naming conventions, and best practices for the Mustache Cashstage project. Following these guidelines ensures consistency, maintainability, and collaboration across the development team.

## 🎯 Core Principles

### Code Quality Standards
- **Readability First**: Code should be self-documenting and easy to understand
- **Consistency**: Follow established patterns and conventions throughout the codebase
- **Performance**: Write efficient code with consideration for user experience
- **Accessibility**: Ensure all UI components meet WCAG 2.1 AA standards
- **Type Safety**: Use TypeScript strictly to prevent runtime errors

### Development Philosophy
- **Component Composition**: Favor composition over inheritance
- **Functional Programming**: Use pure functions and immutable data where possible
- **Progressive Enhancement**: Build accessible foundations, enhance with JavaScript
- **Mobile-First**: Design and develop for mobile devices first
- **Performance Budget**: Maintain bundle size and performance targets

## 📝 Code Style Standards

### TypeScript Conventions

#### Naming Conventions

```typescript
// ✅ Interfaces - PascalCase without 'I' prefix
interface UserProfile {
  name: string
  email: string
}

// ✅ Types - PascalCase
type ComponentVariant = 'primary' | 'secondary' | 'danger'

// ✅ Enums - PascalCase with UPPER_CASE members
enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

// ✅ Functions and variables - camelCase
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ Constants - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3
const API_BASE_URL = 'https://api.mustache-cashstage.dev'

// ✅ React components - PascalCase
export function DashboardWidget({ title, children }: DashboardWidgetProps) {
  return (
    <div className="dashboard-widget">
      <h3>{title}</h3>
      {children}
    </div>
  )
}
```

#### Type Definitions

```typescript
// ✅ Prefer interfaces for object shapes
interface ChartConfig {
  type: ChartType
  title: string
  data: ChartData[]
  options?: ChartOptions
}

// ✅ Use type aliases for unions and computed types
type ChartType = 'bar' | 'line' | 'pie' | 'area'
type EventHandler<T> = (event: T) => void

// ✅ Use const assertions for readonly data
const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
] as const

// ✅ Prefer type imports
import type { User, Dashboard } from '@mustache/types'
```

#### Error Handling

```typescript
// ✅ Use specific error types
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// ✅ Handle errors explicitly
async function createDashboard(data: CreateDashboardInput): Promise<Dashboard> {
  try {
    const validated = validateDashboardInput(data)
    return await api.createDashboard(validated)
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new Error(`Invalid ${error.field}: ${error.message}`)
    }
    throw new Error('Failed to create dashboard')
  }
}

// ✅ Use Result types for error-prone operations
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

function parseDashboardConfig(input: unknown): Result<DashboardConfig> {
  try {
    const config = DashboardConfigSchema.parse(input)
    return { success: true, data: config }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}
```

### React Component Standards

#### Component Structure

```typescript
// ✅ Component file structure
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Types and interfaces first
interface DashboardCardProps {
  title: string
  description?: string
  children: ReactNode
  variant?: 'default' | 'elevated'
  className?: string
  onEdit?: () => void
}

// Component implementation
export function DashboardCard({
  title,
  description,
  children,
  variant = 'default',
  className,
  onEdit,
}: DashboardCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 text-card-foreground shadow-sm',
        variant === 'elevated' && 'shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

// Default export for components
export default DashboardCard
```

#### Hooks Conventions

```typescript
// ✅ Custom hooks - use prefix and descriptive names
export function useDashboardData(dashboardId: string) {
  return useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: () => fetchDashboard(dashboardId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ✅ State management hooks
export function useWidgetSelection() {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([])

  const selectWidget = useCallback((widgetId: string) => {
    setSelectedWidgets(prev => [...prev, widgetId])
  }, [])

  const deselectWidget = useCallback((widgetId: string) => {
    setSelectedWidgets(prev => prev.filter(id => id !== widgetId))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedWidgets([])
  }, [])

  return {
    selectedWidgets,
    selectWidget,
    deselectWidget,
    clearSelection,
  }
}
```

### CSS and Styling Standards

#### Tailwind CSS Conventions

```typescript
// ✅ Use cn() utility for conditional classes
import { cn } from '@/lib/utils'

function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        // Variant styles
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        // Size styles
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4',
        size === 'lg' && 'h-11 px-8',
        // Custom className last
        className
      )}
      {...props}
    />
  )
}

// ✅ Responsive design patterns
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {widgets.map(widget => (
    <WidgetCard key={widget.id} widget={widget} />
  ))}
</div>

// ✅ Dark mode support
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Dashboard
  </h1>
</div>
```

#### Component Styling Guidelines

```css
/* ✅ Use CSS custom properties for theming */
:root {
  --color-primary: 220 14% 96%;
  --color-primary-foreground: 220 9% 46%;
  --color-secondary: 220 14% 96%;
  --color-secondary-foreground: 220 9% 46%;
  --color-accent: 220 14% 96%;
  --color-accent-foreground: 220 9% 46%;
}

/* ✅ Component-scoped styles when needed */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
}

/* ✅ Animation and transition standards */
.fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## 📁 File Organization Standards

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Route groups
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── charts/           # Chart components
│   ├── dashboard/        # Dashboard-specific components
│   └── forms/            # Form components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── utils.ts          # General utilities
│   ├── api.ts            # API client
│   ├── auth.ts           # Authentication logic
│   └── validations.ts    # Zod schemas
├── stores/               # Zustand stores
├── types/                # TypeScript type definitions
└── constants/            # Application constants
```

### File Naming Conventions

```
✅ Good Examples:
- DashboardWidget.tsx (React components)
- useDashboardData.ts (Custom hooks)
- dashboard-store.ts (Stores and utilities)
- api-client.ts (Service files)
- user-profile.types.ts (Type-only files)

❌ Bad Examples:
- dashboardWidget.tsx (inconsistent casing)
- Dashboard_Widget.tsx (snake_case in React)
- use-dashboard-data.ts (kebab-case for hooks)
- ApiClient.ts (service files should be kebab-case)
```

### Import/Export Standards

```typescript
// ✅ Import order (automated by ESLint)
// 1. Node modules
import React from 'react'
import { NextResponse } from 'next/server'

// 2. Internal modules (absolute imports)
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/hooks/useDashboard'

// 3. Relative imports
import './styles.css'
import { validateInput } from '../utils'

// ✅ Export conventions
// Named exports for utilities and hooks
export { calculateMetrics, formatCurrency }

// Default export for React components and main modules
export default function DashboardPage() {
  return <div>Dashboard</div>
}

// ✅ Re-exports for barrel files
export { Button } from './button'
export { Input } from './input'
export { Select } from './select'
```

## 🎨 UI/UX Standards

### Design System Integration

```typescript
// ✅ Use design tokens from Tailwind config
const theme = {
  colors: {
    primary: {
      50: 'hsl(var(--primary-50))',
      500: 'hsl(var(--primary-500))',
      900: 'hsl(var(--primary-900))',
    },
  },
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
  },
}

// ✅ Consistent component API patterns
interface BaseComponentProps {
  className?: string
  children?: ReactNode
  'data-testid'?: string
}

interface VariantProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}
```

### Accessibility Standards

```typescript
// ✅ Semantic HTML and ARIA attributes
function DataTable({ data, caption }: DataTableProps) {
  return (
    <table role="table" aria-label={caption}>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.id} scope="col">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {columns.map(column => (
              <td key={column.id}>{row[column.id]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ✅ Keyboard navigation support
function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
    >
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )
}
```

## 🧪 Testing Standards

### Component Testing

```typescript
// ✅ Test file naming: ComponentName.test.tsx
// ✅ Test structure and assertions
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })
})
```

### Storybook Stories

```typescript
// ✅ Story file naming: ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
}
```

## 📦 Package Management

### Dependency Guidelines

```json
// ✅ Package.json organization
{
  "dependencies": {
    // Core framework dependencies first
    "react": "^18.0.0",
    "next": "^14.0.0",
    
    // UI and styling dependencies
    "@radix-ui/react-dialog": "^1.0.0",
    "tailwindcss": "^3.0.0",
    
    // Utility dependencies
    "lodash-es": "^4.17.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    // Build tools
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    
    // Testing dependencies
    "@testing-library/react": "^14.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Version Management

```bash
# ✅ Semantic versioning guidelines
# MAJOR.MINOR.PATCH
# 1.0.0 → 1.0.1 (patch: bug fixes)
# 1.0.1 → 1.1.0 (minor: new features, backward compatible)
# 1.1.0 → 2.0.0 (major: breaking changes)

# ✅ Lock file management
npm ci                    # Use in CI/CD
npm install              # Use in development
npm audit fix            # Fix security vulnerabilities
```

## 🔧 Development Workflow

### Git Conventions

```bash
# ✅ Branch naming
feature/dashboard-widgets
bugfix/chart-rendering
hotfix/security-patch
chore/update-dependencies

# ✅ Commit message format (Conventional Commits)
feat: add drag-and-drop widget positioning
fix: resolve chart rendering issue on mobile
docs: update API documentation
chore: upgrade dependencies
test: add unit tests for dashboard components
refactor: extract chart utilities to separate module

# ✅ Commit message structure
type(scope): description

[optional body]

[optional footer(s)]
```

### Code Review Guidelines

```markdown
## Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance is acceptable

### Code Quality
- [ ] Follows style guide conventions
- [ ] TypeScript types are accurate
- [ ] No unused code or dependencies
- [ ] Adequate test coverage

### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] README updated if needed
- [ ] API docs updated if needed

### Accessibility
- [ ] Semantic HTML elements used
- [ ] ARIA attributes where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards
```

## 📊 Performance Guidelines

### Bundle Size Management

```typescript
// ✅ Dynamic imports for code splitting
const DashboardBuilder = lazy(() => import('./components/DashboardBuilder'))
const ChartEditor = lazy(() => import('./components/ChartEditor'))

// ✅ Tree shaking friendly imports
import { debounce } from 'lodash-es'  // ✅ Specific import
import _ from 'lodash'                // ❌ Full library import

// ✅ Conditional loading
const DevTools = process.env.NODE_ENV === 'development' 
  ? lazy(() => import('./DevTools'))
  : null
```

### Performance Monitoring

```typescript
// ✅ Performance measurement
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Send to monitoring service
  console.log(metric)
}

// Measure Core Web Vitals
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

---

## 🎯 Quick Reference

### ESLint Rules Summary
- `@typescript-eslint/no-explicit-any`: Prevent `any` usage
- `import/order`: Enforce import organization
- `react/jsx-key`: Require keys in JSX lists
- `jsx-a11y/alt-text`: Require alt text for images

### Tailwind Class Order
1. Layout (display, position, etc.)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography (font, text)
5. Colors (background, text color)
6. Effects (shadow, opacity)

### TypeScript Best Practices
- Use `interface` for object shapes
- Use `type` for unions and computations
- Prefer `unknown` over `any`
- Use const assertions for readonly data
- Import types with `import type`

---

**Last Updated**: 2024-01-21  
**Version**: 1.0.0  
**Maintainer**: Mustache Cashstage Development Team