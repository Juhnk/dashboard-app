# [Component/Package/Feature Name]

Brief description of what this component/package/feature does and its primary purpose.

## Overview

Detailed description of the component/package/feature, including:
- What problem it solves
- Key features and capabilities
- When to use it vs alternatives

## Installation

```bash
# If it's a package
npm install @mustache/package-name

# If it's part of the main project
# Installation instructions or prerequisites
```

## Quick Start

```tsx
// Basic usage example
import { ComponentName } from '@mustache/package-name'

function App() {
  return (
    <ComponentName
      variant="primary"
      size="md"
      onClick={(data) => console.log(data)}
    >
      Hello World
    </ComponentName>
  )
}
```

## API Reference

### Props/Parameters

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | The visual variant of the component |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | The size of the component |
| `disabled` | `boolean` | `false` | Whether the component is disabled |
| `onClick` | `(data: T) => void` | - | Callback fired when clicked |
| `children` | `ReactNode` | - | The content of the component |

### Methods (if applicable)

#### `methodName(param1, param2)`

Description of what the method does.

**Parameters:**
- `param1` (string): Description of parameter
- `param2` (number, optional): Description of optional parameter

**Returns:** Description of return value

**Example:**
```tsx
const result = methodName('value', 42)
```

## Examples

### Basic Usage

```tsx
import { ComponentName } from '@mustache/package-name'

function BasicExample() {
  return (
    <ComponentName variant="primary">
      Basic example
    </ComponentName>
  )
}
```

### Advanced Usage

```tsx
import { ComponentName } from '@mustache/package-name'
import { useState } from 'react'

function AdvancedExample() {
  const [data, setData] = useState(null)

  return (
    <ComponentName
      variant="secondary"
      size="lg"
      disabled={!data}
      onClick={(newData) => setData(newData)}
    >
      Advanced example with state
    </ComponentName>
  )
}
```

### With Custom Styling

```tsx
import { ComponentName } from '@mustache/package-name'

function StyledExample() {
  return (
    <ComponentName
      variant="primary"
      className="custom-class"
      style={{ margin: '1rem' }}
    >
      Custom styled example
    </ComponentName>
  )
}
```

## Accessibility

This component follows WCAG 2.1 AA guidelines:

- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Color contrast compliance
- ✅ Screen reader compatibility
- ✅ Focus management

### ARIA Attributes

| Attribute | Purpose |
|-----------|---------|
| `aria-label` | Provides accessible name when text content is insufficient |
| `aria-describedby` | References additional descriptive text |
| `aria-disabled` | Indicates disabled state to assistive technology |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Space/Enter` | Activates the component |
| `Tab` | Moves focus to the component |
| `Escape` | Closes/cancels if applicable |

## Styling

### CSS Classes

The component uses the following CSS classes:

```css
.component-base {
  /* Base styles applied to all variants */
}

.component-primary {
  /* Primary variant styles */
}

.component-secondary {
  /* Secondary variant styles */
}
```

### Customization

You can customize the component using:

1. **CSS Custom Properties:**
```css
:root {
  --component-primary-color: #your-color;
  --component-border-radius: 8px;
}
```

2. **Tailwind Classes:**
```tsx
<ComponentName className="bg-blue-500 hover:bg-blue-600" />
```

3. **Styled Components/Emotion:**
```tsx
const StyledComponent = styled(ComponentName)`
  background-color: ${props => props.theme.primary};
`
```

## Performance

### Bundle Size
- Minified: ~2.4kB
- Gzipped: ~1.1kB

### Optimization Tips
- Use tree shaking by importing only what you need
- Lazy load if not immediately visible
- Consider virtualization for large lists

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## Testing

### Unit Tests

```bash
npm run test
```

### Storybook

View component variations in Storybook:

```bash
npm run storybook
```

### Accessibility Testing

```bash
npm run test:a11y
```

## Contributing

Please read our [Contributing Guide](../CONTRIBUTING.md) for development workflow and coding standards.

### Development Setup

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Start development environment
npm run dev

# Run tests
npm run test

# Build package
npm run build
```

### Creating Issues

When reporting bugs or requesting features, please include:

1. **Environment details** (OS, browser, version)
2. **Steps to reproduce** (for bugs)
3. **Expected vs actual behavior**
4. **Code examples** (minimal reproduction case)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and migration guides.

## License

This project is licensed under the [LICENSE NAME] - see the [LICENSE](LICENSE) file for details.

## Related

- [Related Component/Package](../related-package/README.md)
- [Design System](../docs/design/DESIGN_SYSTEM.md)
- [API Documentation](../docs/api/README.md)

## Support

- **Documentation**: [Full documentation](https://docs.mustache-cashstage.dev)
- **Issues**: [GitHub Issues](https://github.com/your-org/repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/repo/discussions)
- **Email**: support@mustache-cashstage.dev

---

**Last Updated**: [DATE]  
**Version**: [VERSION]  
**Maintainer**: [MAINTAINER NAME]