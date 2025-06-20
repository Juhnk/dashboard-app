import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'

import { cn } from '@/lib/utils'

// Component interface - always export for external usage
export interface ComponentNameProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * The variant of the component
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'secondary'
  
  /**
   * The size of the component
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean
  
  /**
   * Optional description for accessibility
   */
  description?: string
}

/**
 * ComponentName provides [brief description of what the component does].
 * 
 * @example
 * ```tsx
 * <ComponentName variant="primary" size="lg">
 *   Content goes here
 * </ComponentName>
 * ```
 */
const ComponentName = forwardRef<
  ElementRef<'div'>,
  ComponentNameProps
>(({ 
  variant = 'default',
  size = 'md',
  disabled = false,
  description,
  className,
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        // Base styles
        'relative flex items-center justify-center',
        'rounded-md border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        
        // Variant styles
        variant === 'default' && 'bg-background text-foreground border-border',
        variant === 'primary' && 'bg-primary text-primary-foreground border-primary',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground border-secondary',
        
        // Size styles
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4',
        size === 'lg' && 'h-12 px-6 text-lg',
        
        // Disabled styles
        disabled && 'opacity-50 cursor-not-allowed',
        
        className
      )}
      aria-disabled={disabled}
      aria-describedby={description ? `${props.id}-description` : undefined}
      {...props}
    >
      {children}
      {description && (
        <span id={`${props.id}-description`} className="sr-only">
          {description}
        </span>
      )}
    </div>
  )
})

ComponentName.displayName = 'ComponentName'

export { ComponentName }
export default ComponentName