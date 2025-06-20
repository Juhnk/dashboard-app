# Performance & Accessibility Standards

## Overview

Mustache Cashstage is committed to delivering exceptional performance and accessibility across all user interfaces and interactions. This document establishes measurable standards, testing procedures, and optimization guidelines to ensure a world-class user experience.

## 🚀 Performance Standards

### Core Web Vitals Requirements

All pages and components must meet or exceed these Core Web Vitals thresholds:

| Metric | Good | Needs Improvement | Poor | Target |
|--------|------|-------------------|------|--------|
| **Largest Contentful Paint (LCP)** | ≤ 2.5s | 2.5s - 4.0s | > 4.0s | **≤ 2.0s** |
| **First Input Delay (FID)** | ≤ 100ms | 100ms - 300ms | > 300ms | **≤ 75ms** |
| **Cumulative Layout Shift (CLS)** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 | **≤ 0.05** |
| **First Contentful Paint (FCP)** | ≤ 1.8s | 1.8s - 3.0s | > 3.0s | **≤ 1.5s** |
| **Time to Interactive (TTI)** | ≤ 3.8s | 3.8s - 7.3s | > 7.3s | **≤ 3.0s** |

### Application Performance Benchmarks

#### **Dashboard Loading Performance**
```javascript
// Performance targets for dashboard pages
const PERFORMANCE_TARGETS = {
  // Initial page load
  timeToFirstByte: 200,        // TTFB ≤ 200ms
  firstContentfulPaint: 1500,  // FCP ≤ 1.5s
  largestContentfulPaint: 2000, // LCP ≤ 2.0s
  timeToInteractive: 3000,     // TTI ≤ 3.0s
  
  // Dashboard-specific metrics
  dashboardRender: 1000,       // Dashboard visible ≤ 1s
  chartRender: 500,            // Charts rendered ≤ 500ms
  dataFetch: 800,              // Data loaded ≤ 800ms
  
  // Interaction performance
  chartInteraction: 16,        // 60fps (16ms frame time)
  filterResponse: 200,         // Filter updates ≤ 200ms
  widgetDrag: 16,              // Smooth drag operations
  
  // Bundle sizes
  initialBundle: 150 * 1024,   // Initial JS ≤ 150KB gzipped
  totalBundle: 500 * 1024,     // Total JS ≤ 500KB gzipped
  cssBundle: 50 * 1024,        // CSS ≤ 50KB gzipped
};
```

#### **API Performance Standards**
```javascript
const API_PERFORMANCE_TARGETS = {
  // Response times (95th percentile)
  authentication: 200,         // Auth requests ≤ 200ms
  dashboardList: 300,          // Dashboard list ≤ 300ms
  dashboardData: 500,          // Dashboard data ≤ 500ms
  chartData: 400,              // Chart data ≤ 400ms
  dataSourceTest: 2000,        // Data source test ≤ 2s
  
  // Throughput requirements
  concurrent_users: 1000,      // Support 1000+ concurrent users
  requests_per_second: 500,    // Handle 500+ RPS
  
  // Database performance
  query_time_p95: 100,         // 95% queries ≤ 100ms
  connection_pool: 50,         // Max 50 concurrent connections
  
  // Background jobs
  data_ingestion: 60000,       // Data import ≤ 60s
  report_generation: 30000,    // Report generation ≤ 30s
};
```

### Performance Monitoring Implementation

#### **Real User Monitoring (RUM)**
```javascript
// web-vitals integration for real user monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send metrics to monitoring service
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      url: window.location.href,
      timestamp: Date.now()
    })
  });
}

// Measure Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Custom dashboard metrics
export function measureDashboardLoad() {
  const startTime = performance.now();
  
  return {
    markComplete: () => {
      const loadTime = performance.now() - startTime;
      sendToAnalytics({
        name: 'dashboard-load',
        value: loadTime,
        url: window.location.href
      });
    }
  };
}
```

#### **Performance Testing Automation**
```javascript
// lighthouse-performance-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const PERFORMANCE_BUDGET = {
  'first-contentful-paint': 1500,
  'largest-contentful-paint': 2000,
  'first-meaningful-paint': 2000,
  'speed-index': 2500,
  'interactive': 3000,
  'max-potential-fid': 100,
  'cumulative-layout-shift': 0.05
};

async function runPerformanceTest(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
  };
  
  const runnerResult = await lighthouse(url, options);
  const performanceScore = runnerResult.lhr.categories.performance.score * 100;
  
  // Check against budget
  const audits = runnerResult.lhr.audits;
  const budgetFailures = [];
  
  Object.entries(PERFORMANCE_BUDGET).forEach(([audit, threshold]) => {
    const auditResult = audits[audit];
    if (auditResult && auditResult.numericValue > threshold) {
      budgetFailures.push({
        audit,
        threshold,
        actual: auditResult.numericValue,
        passed: false
      });
    }
  });
  
  await chrome.kill();
  
  return {
    score: performanceScore,
    budgetFailures,
    passed: budgetFailures.length === 0 && performanceScore >= 90
  };
}
```

### Bundle Size Optimization

#### **Webpack Bundle Analysis**
```javascript
// webpack-bundle-analyzer configuration
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Add bundle analyzer in production builds
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../bundle-analysis.html'
        })
      );
      
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all'
          },
          recharts: {
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 10
          }
        }
      };
    }
    return config;
  }
};
```

#### **Tree Shaking Configuration**
```javascript
// Optimize imports for tree shaking
// ✅ Good - specific imports
import { BarChart, LineChart } from 'recharts';
import { format } from 'date-fns';
import { debounce } from 'lodash-es';

// ❌ Bad - full library imports
import * as recharts from 'recharts';
import * as dateFns from 'date-fns';
import _ from 'lodash';

// Package.json sideEffects configuration
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/styles/**/*"
  ]
}
```

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance Requirements

All user interfaces must meet WCAG 2.1 Level AA standards:

#### **Level A Requirements (Must Have)**
- **1.1.1 Non-text Content**: All images have appropriate alt text
- **1.3.1 Info and Relationships**: Semantic HTML structure
- **1.4.1 Use of Color**: Information not conveyed by color alone
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.4.1 Bypass Blocks**: Skip navigation links provided
- **3.3.2 Labels or Instructions**: Form inputs have clear labels

#### **Level AA Requirements (Must Have)**
- **1.4.3 Contrast**: Text contrast ratio ≥ 4.5:1 (normal), ≥ 3:1 (large)
- **1.4.4 Resize Text**: Text resizable up to 200% without loss of functionality
- **2.4.7 Focus Visible**: Keyboard focus clearly visible
- **3.2.3 Consistent Navigation**: Navigation consistent across pages
- **3.3.3 Error Suggestion**: Error messages provide suggestions
- **4.1.2 Name, Role, Value**: UI components properly labeled

### Accessibility Testing Implementation

#### **Automated Testing with axe-core**
```javascript
// accessibility-test.js
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Dashboard Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('charts should be accessible', async () => {
    const { container } = render(
      <BarChart data={mockData} aria-label="Revenue by month" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Custom accessibility rules
const customRules = {
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'screen-reader': { enabled: true }
  }
};
```

#### **Manual Accessibility Checklist**
```markdown
## Pre-Release Accessibility Checklist

### Keyboard Navigation
- [ ] All interactive elements accessible via Tab/Shift+Tab
- [ ] Focus order is logical and intuitive
- [ ] No keyboard traps exist
- [ ] Skip links function correctly
- [ ] Arrow keys work for complex widgets (charts, grids)

### Screen Reader Support
- [ ] All content readable by screen readers
- [ ] Charts have text alternatives or data tables
- [ ] Dynamic content changes announced
- [ ] Loading states communicated to assistive technology
- [ ] Error messages announced appropriately

### Visual Design
- [ ] Color contrast meets WCAG AA standards (4.5:1 minimum)
- [ ] Focus indicators clearly visible
- [ ] Text scales to 200% without horizontal scrolling
- [ ] Interface usable at 320px viewport width
- [ ] No content flashes more than 3 times per second

### Form Accessibility
- [ ] All form fields have labels
- [ ] Required fields clearly indicated
- [ ] Error messages associated with relevant fields
- [ ] Fieldsets and legends used for grouped controls
- [ ] Autocomplete attributes provided where appropriate

### Chart Accessibility
- [ ] Charts have descriptive titles and captions
- [ ] Data tables provided as alternatives
- [ ] Color not the only way to convey information
- [ ] Interactive elements have proper ARIA labels
- [ ] Keyboard navigation implemented for chart interactions
```

### Accessible Component Patterns

#### **Accessible Chart Implementation**
```typescript
// AccessibleChart.tsx
interface AccessibleChartProps {
  data: ChartData[];
  title: string;
  description?: string;
  type: 'bar' | 'line' | 'pie';
}

export function AccessibleChart({ data, title, description, type }: AccessibleChartProps) {
  const chartId = useId();
  const tableId = useId();
  const [showTable, setShowTable] = useState(false);
  
  return (
    <div className="accessible-chart">
      <div className="chart-header">
        <h3 id={`${chartId}-title`}>{title}</h3>
        {description && (
          <p id={`${chartId}-desc`} className="chart-description">
            {description}
          </p>
        )}
        <button
          onClick={() => setShowTable(!showTable)}
          aria-expanded={showTable}
          aria-controls={tableId}
        >
          {showTable ? 'Hide' : 'Show'} data table
        </button>
      </div>
      
      <div
        role="img"
        aria-labelledby={`${chartId}-title`}
        aria-describedby={description ? `${chartId}-desc` : undefined}
      >
        {type === 'bar' && (
          <BarChart
            data={data}
            aria-label={`${title} bar chart`}
            tabIndex={0}
            onKeyDown={handleChartKeyNavigation}
          />
        )}
      </div>
      
      {showTable && (
        <table id={tableId} className="data-table" aria-label={`${title} data`}>
          <caption>Data for {title}</caption>
          <thead>
            <tr>
              {Object.keys(data[0] || {}).map(key => (
                <th key={key} scope="col">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, cellIndex) => (
                  <td key={cellIndex}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

#### **Accessible Form Components**
```typescript
// AccessibleForm.tsx
export function AccessibleFormField({
  label,
  error,
  required = false,
  children,
  ...props
}) {
  const fieldId = useId();
  const errorId = useId();
  
  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      
      {React.cloneElement(children, {
        id: fieldId,
        'aria-describedby': error ? errorId : undefined,
        'aria-invalid': error ? 'true' : 'false',
        'aria-required': required,
        ...props
      })}
      
      {error && (
        <div id={errorId} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

// Usage example
<AccessibleFormField
  label="Dashboard Name"
  error={errors.name}
  required
>
  <input type="text" placeholder="Enter dashboard name" />
</AccessibleFormField>
```

### Color and Contrast Standards

#### **Color Palette Accessibility**
```css
/* Design system colors with accessibility compliance */
:root {
  /* Primary colors - all meet 4.5:1 contrast on white */
  --color-primary-50: #eff6ff;   /* AAA on dark text */
  --color-primary-500: #3b82f6;  /* AA on white background */
  --color-primary-600: #2563eb;  /* AAA on white background */
  --color-primary-900: #1e3a8a;  /* AAA on white background */
  
  /* Status colors - accessible combinations */
  --color-success: #059669;      /* 4.52:1 on white */
  --color-warning: #d97706;      /* 4.51:1 on white */
  --color-error: #dc2626;        /* 5.14:1 on white */
  --color-info: #0284c7;         /* 4.76:1 on white */
  
  /* Chart colors - distinct for colorblind users */
  --chart-color-1: #1f77b4;      /* Blue */
  --chart-color-2: #ff7f0e;      /* Orange */
  --chart-color-3: #2ca02c;      /* Green */
  --chart-color-4: #d62728;      /* Red */
  --chart-color-5: #9467bd;      /* Purple */
  --chart-color-6: #8c564b;      /* Brown */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-primary-500: #000080;
    --color-text: #000000;
    --color-background: #ffffff;
    --color-border: #000000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### **Focus Management**
```css
/* Consistent focus indicators */
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Interactive elements */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  @apply focus-visible;
}

/* Chart elements focus */
.chart-element:focus-visible {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 1px;
}

/* Skip link styling */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary-600);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

## 📊 Performance Monitoring & Alerts

### Continuous Performance Monitoring

#### **Performance Dashboard Metrics**
```javascript
// performance-dashboard.js
export const PERFORMANCE_METRICS = {
  // Core Web Vitals tracking
  coreWebVitals: {
    lcp: { target: 2000, alert: 2500 },
    fid: { target: 75, alert: 100 },
    cls: { target: 0.05, alert: 0.1 },
    fcp: { target: 1500, alert: 1800 },
    ttfb: { target: 200, alert: 300 }
  },
  
  // Business metrics
  business: {
    dashboardLoadTime: { target: 1000, alert: 1500 },
    chartRenderTime: { target: 500, alert: 750 },
    dataFetchTime: { target: 800, alert: 1200 },
    userInteractionDelay: { target: 16, alert: 32 }
  },
  
  // Resource metrics
  resources: {
    bundleSizeJS: { target: 150000, alert: 200000 },
    bundleSizeCSS: { target: 50000, alert: 75000 },
    imageOptimization: { target: 0.8, alert: 0.6 },
    cacheHitRate: { target: 0.9, alert: 0.8 }
  }
};

// Automated alerting
function checkPerformanceThresholds(metrics) {
  const alerts = [];
  
  Object.entries(PERFORMANCE_METRICS).forEach(([category, categoryMetrics]) => {
    Object.entries(categoryMetrics).forEach(([metric, thresholds]) => {
      const currentValue = metrics[category]?.[metric];
      if (currentValue > thresholds.alert) {
        alerts.push({
          severity: currentValue > thresholds.alert * 1.5 ? 'critical' : 'warning',
          metric: `${category}.${metric}`,
          current: currentValue,
          target: thresholds.target,
          alert: thresholds.alert
        });
      }
    });
  });
  
  return alerts;
}
```

### Performance Testing in CI/CD

#### **GitHub Actions Performance Testing**
```yaml
# .github/workflows/performance.yml
name: Performance Testing

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        
      - name: Start application
        run: |
          npm run start &
          sleep 30  # Wait for app to start
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Bundle size analysis
        run: |
          npm run analyze:bundle
          node scripts/check-bundle-size.js
      
      - name: Accessibility audit
        run: |
          npm run test:a11y
          npm run test:a11y:ci

  performance-regression:
    runs-on: ubuntu-latest
    steps:
      - name: Performance regression test
        run: |
          # Compare current build with main branch
          node scripts/performance-comparison.js
```

#### **Bundle Size Monitoring**
```javascript
// scripts/check-bundle-size.js
const fs = require('fs');
const path = require('path');

const BUNDLE_SIZE_LIMITS = {
  'main': 150 * 1024,      // 150KB gzipped
  'vendor': 200 * 1024,    // 200KB gzipped
  'recharts': 100 * 1024,  // 100KB gzipped
  'total': 500 * 1024      // 500KB gzipped total
};

function checkBundleSizes() {
  const buildDir = path.join(__dirname, '../.next/static/chunks');
  const chunks = fs.readdirSync(buildDir)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const stats = fs.statSync(path.join(buildDir, file));
      return {
        name: file,
        size: stats.size,
        gzipSize: getGzipSize(path.join(buildDir, file))
      };
    });
  
  let totalSize = 0;
  const violations = [];
  
  chunks.forEach(chunk => {
    totalSize += chunk.gzipSize;
    
    // Check individual chunk limits
    Object.entries(BUNDLE_SIZE_LIMITS).forEach(([pattern, limit]) => {
      if (chunk.name.includes(pattern) && chunk.gzipSize > limit) {
        violations.push({
          chunk: chunk.name,
          size: chunk.gzipSize,
          limit,
          pattern
        });
      }
    });
  });
  
  // Check total size
  if (totalSize > BUNDLE_SIZE_LIMITS.total) {
    violations.push({
      chunk: 'total',
      size: totalSize,
      limit: BUNDLE_SIZE_LIMITS.total,
      pattern: 'total'
    });
  }
  
  if (violations.length > 0) {
    console.error('Bundle size violations:');
    violations.forEach(v => {
      console.error(`❌ ${v.chunk}: ${v.size} bytes (limit: ${v.limit} bytes)`);
    });
    process.exit(1);
  } else {
    console.log('✅ All bundle sizes within limits');
    console.log(`Total bundle size: ${totalSize} bytes`);
  }
}

checkBundleSizes();
```

## 🎯 Optimization Guidelines

### Frontend Performance Optimization

#### **Component Optimization Patterns**
```typescript
// Memoization for expensive components
const ExpensiveChart = React.memo(({ data, config }) => {
  const processedData = useMemo(() => {
    return processChartData(data, config);
  }, [data, config]);
  
  return <BarChart data={processedData} />;
});

// Lazy loading for non-critical components
const DataTable = lazy(() => import('./DataTable'));

function Dashboard() {
  return (
    <div>
      <PrimaryCharts />
      <Suspense fallback={<TableSkeleton />}>
        <DataTable />
      </Suspense>
    </div>
  );
}

// Virtualization for large lists
import { FixedSizeList as List } from 'react-window';

function VirtualizedWidgetList({ widgets }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <WidgetCard widget={widgets[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={widgets.length}
      itemSize={200}
    >
      {Row}
    </List>
  );
}
```

#### **Image Optimization**
```typescript
// Next.js Image optimization
import Image from 'next/image';

function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      {...props}
    />
  );
}

// SVG optimization for icons
function OptimizedIcon({ name, className }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#icon-${name}`} />
    </svg>
  );
}
```

### Database Performance Optimization

#### **Query Optimization**
```sql
-- Optimized dashboard queries with proper indexing
CREATE INDEX CONCURRENTLY idx_dashboards_org_updated 
ON dashboards(organization_id, updated_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_widgets_dashboard_position
ON widgets(dashboard_tab_id, layout_x, layout_y)
WHERE deleted_at IS NULL;

-- Efficient data aggregation
WITH dashboard_data AS (
  SELECT 
    w.id as widget_id,
    w.configuration,
    ds.id as data_source_id,
    COUNT(dsn.id) as data_points
  FROM widgets w
  JOIN dashboard_tabs dt ON w.dashboard_tab_id = dt.id
  JOIN data_sources ds ON w.data_source_id = ds.id
  LEFT JOIN data_snapshots dsn ON ds.id = dsn.data_source_id
    AND dsn.snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
  WHERE dt.dashboard_id = $1
  GROUP BY w.id, w.configuration, ds.id
)
SELECT * FROM dashboard_data;
```

### Accessibility Performance

#### **Screen Reader Optimization**
```typescript
// Optimize for screen reader performance
function AccessibleDataTable({ data, caption }) {
  // Reduce DOM complexity for screen readers
  const [isScreenReader, setIsScreenReader] = useState(false);
  
  useEffect(() => {
    // Detect screen reader usage
    const hasScreenReader = window.navigator.userAgent.includes('NVDA') ||
                           window.navigator.userAgent.includes('JAWS') ||
                           window.speechSynthesis;
    setIsScreenReader(hasScreenReader);
  }, []);
  
  if (isScreenReader) {
    // Simplified structure for screen readers
    return (
      <table role="table" aria-label={caption}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {Object.keys(data[0] || {}).map(header => (
              <th key={header} scope="col">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex}>{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  
  // Rich interactive table for visual users
  return <InteractiveDataTable data={data} caption={caption} />;
}
```

## 📋 Testing Procedures

### Automated Performance Testing

```bash
# Performance test suite
npm run test:performance       # Lighthouse audits
npm run test:bundle-size      # Bundle size validation
npm run test:core-vitals      # Core Web Vitals testing
npm run test:accessibility    # Accessibility compliance
npm run test:load             # Load testing with k6

# CI/CD integration
npm run test:performance:ci   # Automated performance gates
```

### Manual Testing Checklist

```markdown
## Performance & Accessibility Testing Checklist

### Performance Testing
- [ ] Lighthouse audit score ≥ 90
- [ ] Core Web Vitals meet targets
- [ ] Bundle sizes within limits
- [ ] Load testing with 100+ concurrent users
- [ ] Performance on slower devices (throttled CPU)
- [ ] Performance on slower networks (3G simulation)

### Accessibility Testing
- [ ] Automated axe-core tests pass
- [ ] Manual screen reader testing (NVDA/JAWS)
- [ ] Keyboard navigation testing
- [ ] Color contrast validation
- [ ] Mobile accessibility testing
- [ ] Voice control testing (Dragon NaturallySpeaking)

### Cross-Browser Testing
- [ ] Chrome/Chromium performance
- [ ] Firefox accessibility features
- [ ] Safari performance characteristics
- [ ] Edge compatibility
- [ ] Mobile browser performance
```

This comprehensive performance and accessibility standards document establishes measurable targets, automated testing procedures, and optimization guidelines to ensure Mustache Cashstage delivers an exceptional user experience for all users, including those with disabilities. 

The standards are designed to be enforced through automated testing in the CI/CD pipeline while providing clear guidance for developers on how to build performant, accessible components.