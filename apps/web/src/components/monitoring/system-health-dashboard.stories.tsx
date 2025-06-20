import type { Meta, StoryObj } from '@storybook/react'
import { SystemHealthDashboard } from './system-health-dashboard'

/**
 * SystemHealthDashboard stories demonstrating our elite monitoring capabilities
 * 
 * These stories showcase the sophisticated real-time monitoring interface
 * that provides complete visibility into our anti-fragile infrastructure.
 */

const meta: Meta<typeof SystemHealthDashboard> = {
  title: 'Monitoring/SystemHealthDashboard',
  component: SystemHealthDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The SystemHealthDashboard provides comprehensive real-time monitoring of our anti-fragile backend infrastructure.

## Features

- **Real-time Health Status**: Live monitoring with automatic refresh
- **Circuit Breaker State**: Visual indicators of circuit breaker status  
- **Performance Metrics**: Memory, CPU, and response time monitoring
- **Database & Cache Status**: Connection health and performance metrics
- **Data Pipeline Health**: Job queue status and connector monitoring
- **Error Tracking**: Detailed error information with trace correlation

## Anti-Fragile Architecture

This dashboard demonstrates the observability principles that make our system production-ready:

1. **Glass Box Monitoring**: Complete visibility into system internals
2. **Proactive Alerting**: Early warning of potential issues
3. **Performance Tracking**: Continuous monitoring of key metrics
4. **Dependency Health**: Status of all external dependencies
5. **Operational Intelligence**: Actionable insights for operators

The dashboard automatically adapts its refresh rate based on system status and provides
detailed diagnostics for troubleshooting production issues.
        `
      }
    }
  },
  argTypes: {
    // No props for this component
  }
}

export default meta
type Story = StoryObj<typeof SystemHealthDashboard>

/**
 * Default dashboard showing healthy system state
 */
export const HealthySystem: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Shows the dashboard in a healthy state with all services operational.

- All services showing green status
- Normal performance metrics
- Active data pipeline
- Operational job queue
        `
      }
    }
  }
}

/**
 * Dashboard with degraded services
 */
export const DegradedSystem: Story = {
  parameters: {
    mockData: {
      healthStatus: {
        api: { status: 'degraded' },
        cache: { status: 'unavailable' },
        database: { status: 'healthy' }
      }
    },
    docs: {
      description: {
        story: `
Shows the dashboard when some services are degraded or unavailable.

- Cache service unavailable (yellow warning)
- API service degraded (orange status)
- Database still healthy (green status)
- System operating in graceful degradation mode
        `
      }
    }
  }
}

/**
 * Dashboard showing system under load
 */
export const SystemUnderLoad: Story = {
  parameters: {
    mockData: {
      performanceMetrics: {
        responseTime: '250ms',
        memoryUsage: { used: 85, total: 100 },
        cpuUsage: { user: 75000, system: 25000 }
      }
    },
    docs: {
      description: {
        story: `
Shows the dashboard when the system is under high load.

- Elevated response times
- High memory usage
- Increased CPU utilization
- Job queue processing backlog
        `
      }
    }
  }
}

/**
 * Dashboard with circuit breaker open
 */
export const CircuitBreakerOpen: Story = {
  parameters: {
    mockData: {
      connectors: {
        googleSheets: {
          status: 'circuit_open',
          circuitBreaker: 'open'
        }
      }
    },
    docs: {
      description: {
        story: `
Shows the dashboard when circuit breakers are protecting the system.

- Google Sheets connector circuit breaker open
- Automatic protection from external service failures
- System continuing to operate with graceful degradation
- Circuit breaker will automatically retry after timeout
        `
      }
    }
  }
}

/**
 * Error state with connection failures
 */
export const ErrorState: Story = {
  parameters: {
    mockData: {
      error: 'Failed to connect to backend services'
    },
    docs: {
      description: {
        story: `
Shows the dashboard when it cannot connect to backend services.

- Clear error messaging
- Retry functionality available
- Graceful handling of connectivity issues
- Maintains UI responsiveness during outages
        `
      }
    }
  }
}