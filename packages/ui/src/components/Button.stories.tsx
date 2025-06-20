import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'Core/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Supports loading states and full accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Visual style variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows loading spinner and disables interaction',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: { type: 'text' },
      description: 'Button content',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Primary Stories - Most common use cases
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Danger: Story = {
  args: {
    children: 'Delete Item',
    variant: 'danger',
  },
}

// Size Variations
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}

// State Variations
export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

export const LoadingSecondary: Story = {
  args: {
    children: 'Processing...',
    variant: 'secondary',
    loading: true,
  },
}

// Interactive Examples
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Item
      </>
    ),
  },
}

export const LongText: Story = {
  args: {
    children: 'This is a button with very long text to test overflow behavior',
  },
}

// Accessibility Testing
export const HighContrast: Story = {
  args: {
    children: 'High Contrast',
    variant: 'primary',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

// All Variants Showcase
export const AllVariants: Story = {
  args: {
    children: 'Button',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex gap-2">
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button variant="secondary" loading>Loading Secondary</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive overview of all button variations and states.',
      },
    },
  },
}

// Real-world Usage Examples
export const DashboardActions: Story = {
  args: {
    children: 'Action',
  },
  render: () => (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold">Dashboard Actions</h3>
      <div className="flex gap-2">
        <Button variant="primary">Save Dashboard</Button>
        <Button variant="secondary">Preview</Button>
        <Button variant="ghost">Cancel</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm">Add Widget</Button>
        <Button variant="danger" size="sm">Delete</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of how buttons are used in the dashboard interface.',
      },
    },
  },
}

export const DataSourceConnection: Story = {
  args: {
    children: 'Connect',
  },
  render: () => (
    <div className="flex flex-col gap-4 p-4 border rounded-lg max-w-md">
      <h3 className="text-lg font-semibold">Connect Data Source</h3>
      <p className="text-sm text-gray-600">Choose how to connect your marketing data</p>
      <div className="flex flex-col gap-2">
        <Button variant="primary" className="w-full">Connect Google Sheets</Button>
        <Button variant="secondary" className="w-full">Upload CSV</Button>
        <Button variant="ghost" className="w-full">Use Demo Data</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example of button usage in data source connection flow.',
      },
    },
  },
}