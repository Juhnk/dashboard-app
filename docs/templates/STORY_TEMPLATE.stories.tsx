import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { within, userEvent, expect } from '@storybook/test'

import { ComponentName } from './ComponentName'

// Meta configuration for the component
const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    // Layout configuration
    layout: 'centered',
    
    // Documentation
    docs: {
      description: {
        component: 'ComponentName provides [brief description]. Use this component when [use case description].',
      },
    },
    
    // Design tokens (if applicable)
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/...',
    },
  },
  
  // Control types for props
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary'],
      description: 'The visual variant of the component',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the component',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: 'text',
      description: 'The content of the component',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback fired when component is clicked',
    },
  },
  
  // Default args applied to all stories
  args: {
    children: 'Component content',
    onClick: action('onClick'),
  },
  
  // Tags for organization
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Basic story - the default state
export const Default: Story = {
  args: {
    children: 'Default component',
  },
}

// Primary variant
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary component',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the primary variant for the main call-to-action.',
      },
    },
  },
}

// Secondary variant
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary component',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the secondary variant for less prominent actions.',
      },
    },
  },
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ComponentName size="sm">Small</ComponentName>
      <ComponentName size="md">Medium</ComponentName>
      <ComponentName size="lg">Large</ComponentName>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The component supports three sizes: small, medium, and large.',
      },
    },
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <ComponentName variant="default">Default</ComponentName>
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all available variants.',
      },
    },
  },
}

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled component',
  },
  parameters: {
    docs: {
      description: {
        story: 'Components can be disabled to prevent interaction.',
      },
    },
  },
}

// Interactive story with user actions
export const Interactive: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const component = canvas.getByRole('button') // Adjust role as needed
    
    // Test interaction
    await userEvent.click(component)
    
    // Assert expected behavior
    expect(component).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates interactive behavior and includes automated tests.',
      },
    },
  },
}

// Error state (if applicable)
export const WithError: Story = {
  args: {
    children: 'Component with error',
    // Add error-related props
  },
  parameters: {
    docs: {
      description: {
        story: 'How the component handles error states.',
      },
    },
  },
}

// Loading state (if applicable)
export const Loading: Story = {
  args: {
    children: 'Loading...',
    disabled: true,
    // Add loading-related props
  },
  parameters: {
    docs: {
      description: {
        story: 'How the component appears during loading.',
      },
    },
  },
}

// Complex composition story
export const ComplexExample: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <ComponentName variant="primary" size="lg">
        Large Primary Component
      </ComponentName>
      <ComponentName variant="secondary">
        Secondary Component
      </ComponentName>
      <ComponentName size="sm" disabled>
        Small Disabled Component
      </ComponentName>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of using multiple components together in a real-world scenario.',
      },
    },
  },
}

// Accessibility story
export const AccessibilityDemo: Story = {
  args: {
    children: 'Accessible component',
    'aria-label': 'Accessible component example',
    description: 'This component demonstrates accessibility features',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story highlights accessibility features like ARIA labels and descriptions.',
      },
    },
    a11y: {
      // Axe accessibility testing configuration
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
}