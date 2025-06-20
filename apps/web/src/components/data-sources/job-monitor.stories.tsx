import type { Meta, StoryObj } from '@storybook/react'
import { JobMonitor } from './job-monitor'

/**
 * JobMonitor stories demonstrating real-time job monitoring capabilities
 * 
 * These stories showcase the sophisticated job monitoring interface that provides
 * complete visibility into our asynchronous data processing pipeline.
 */

const meta: Meta<typeof JobMonitor> = {
  title: 'Data Sources/JobMonitor',
  component: JobMonitor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The JobMonitor component provides real-time monitoring of data ingestion jobs
with sophisticated polling, progress tracking, and error handling.

## Features

- **Real-time Status Updates**: Intelligent polling with adaptive intervals
- **Progress Visualization**: Visual progress bars with percentage indicators
- **Trace Correlation**: Every job linked to trace ID for debugging
- **Performance Metrics**: Processing time and attempt tracking
- **Error Handling**: Detailed error messages with retry information
- **Live Indicators**: Visual cues for active monitoring state

## Anti-Fragile Design

The JobMonitor demonstrates elite monitoring patterns:

1. **Adaptive Polling**: Faster polling for active jobs, slower for stable states
2. **Circuit Breaking**: Stops polling on permanent failures
3. **Graceful Degradation**: Continues to work even when backend is unavailable
4. **Complete Observability**: Every state change is logged and tracked
5. **User Experience**: Clear visual feedback and actionable information

This component shows how to build production-grade monitoring UIs that provide
operators with the information they need to understand system behavior.
        `
      }
    }
  },
  argTypes: {
    jobId: {
      control: 'text',
      description: 'Unique identifier for the job to monitor'
    },
    onComplete: {
      action: 'job completed',
      description: 'Callback fired when job completes successfully'
    },
    onError: {
      action: 'job error',
      description: 'Callback fired when job encounters an error'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for styling'
    }
  }
}

export default meta
type Story = StoryObj<typeof JobMonitor>

/**
 * Job in queued state waiting to be processed
 */
export const QueuedJob: Story = {
  args: {
    jobId: 'gs-1703123456789-abc123def',
  },
  parameters: {
    mockJobStatus: {
      status: 'queued',
      progress: 0,
      startedAt: new Date().toISOString()
    },
    docs: {
      description: {
        story: `
Shows a job that has been queued and is waiting to be processed.

- Yellow status indicator for queued state
- Clock icon showing waiting status
- Job ID truncated for display
- Trace ID for correlation
        `
      }
    }
  }
}

/**
 * Active job with progress indication
 */
export const ActiveJob: Story = {
  args: {
    jobId: 'gs-1703123456789-def456ghi',
  },
  parameters: {
    mockJobStatus: {
      status: 'active',
      progress: 65,
      startedAt: new Date(Date.now() - 30000).toISOString(),
      processingTime: '30s',
      attempt: 1,
      maxAttempts: 3
    },
    docs: {
      description: {
        story: `
Shows an actively processing job with progress indication.

- Blue status with spinning icon
- Progress bar showing 65% completion
- Processing time and attempt counters
- Live polling indicator active
        `
      }
    }
  }
}

/**
 * Successfully completed job
 */
export const CompletedJob: Story = {
  args: {
    jobId: 'gs-1703123456789-ghi789jkl',
  },
  parameters: {
    mockJobStatus: {
      status: 'completed',
      progress: 100,
      startedAt: new Date(Date.now() - 120000).toISOString(),
      completedAt: new Date().toISOString(),
      processingTime: '2m 15s',
      result: {
        recordCount: 1247,
        processingTime: '135s'
      }
    },
    docs: {
      description: {
        story: `
Shows a job that has completed successfully.

- Green status with checkmark icon
- Completion details and metrics
- Record count and final processing time
- No more polling (live indicator off)
        `
      }
    }
  }
}

/**
 * Failed job with error details
 */
export const FailedJob: Story = {
  args: {
    jobId: 'gs-1703123456789-jkl012mno',
  },
  parameters: {
    mockJobStatus: {
      status: 'failed',
      progress: 45,
      startedAt: new Date(Date.now() - 90000).toISOString(),
      processingTime: '1m 30s',
      attempt: 3,
      maxAttempts: 3,
      error: 'Google Sheets API rate limit exceeded - circuit breaker opened'
    },
    docs: {
      description: {
        story: `
Shows a job that has failed after exhausting all retry attempts.

- Red status with X icon
- Detailed error message
- Attempt counter showing all retries used
- Error state prevents further polling
        `
      }
    }
  }
}

/**
 * Stalled job detection
 */
export const StalledJob: Story = {
  args: {
    jobId: 'gs-1703123456789-mno345pqr',
  },
  parameters: {
    mockJobStatus: {
      status: 'stalled',
      progress: 25,
      startedAt: new Date(Date.now() - 300000).toISOString(),
      processingTime: '5m 0s',
      attempt: 2,
      maxAttempts: 3
    },
    docs: {
      description: {
        story: `
Shows a job that has been detected as stalled.

- Orange status indicating potential issues
- Long processing time suggesting problems
- System will attempt to recover or retry
- Monitoring continues to track recovery
        `
      }
    }
  }
}

/**
 * No job ID provided (hidden state)
 */
export const NoJob: Story = {
  args: {
    jobId: null,
  },
  parameters: {
    docs: {
      description: {
        story: `
Shows the component when no job ID is provided.

- Component renders nothing (returns null)
- Graceful handling of missing job ID
- No polling or API calls initiated
        `
      }
    }
  }
}

/**
 * Job with polling error
 */
export const PollingError: Story = {
  args: {
    jobId: 'gs-1703123456789-pqr678stu',
  },
  parameters: {
    mockError: 'Failed to fetch job status: Network connection lost',
    docs: {
      description: {
        story: `
Shows the component when it cannot fetch job status.

- Red error banner with clear message
- Polling stops to prevent spam
- Error icon and descriptive text
- Component remains responsive
        `
      }
    }
  }
}