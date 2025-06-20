# @mustache/eslint-config

Shared ESLint configuration for Mustache Cashstage projects.

## Installation

```bash
npm install --save-dev @mustache/eslint-config
```

## Usage

### For Next.js applications

```json
{
  "extends": ["@mustache/eslint-config/next"]
}
```

### For React applications

```json
{
  "extends": ["@mustache/eslint-config/react"]
}
```

### For TypeScript packages/libraries

```json
{
  "extends": ["@mustache/eslint-config/typescript"]
}
```

### For general JavaScript/TypeScript

```json
{
  "extends": ["@mustache/eslint-config"]
}
```

## Configurations

### Base (`@mustache/eslint-config`)
- ESLint recommended rules
- TypeScript support with `@typescript-eslint`
- Import organization with `eslint-plugin-import`
- Prettier integration

### React (`@mustache/eslint-config/react`)
- Extends base configuration
- React and React Hooks rules
- JSX accessibility rules with `eslint-plugin-jsx-a11y`

### Next.js (`@mustache/eslint-config/next`)
- Extends React configuration
- Next.js specific rules with `eslint-config-next`
- Core Web Vitals optimization rules
- App Router and Pages Router support

### TypeScript (`@mustache/eslint-config/typescript`)
- Extends base configuration
- Stricter TypeScript rules for libraries
- Type-aware linting with project references
- Naming conventions and best practices

## Rules Overview

### Key Features
- **Import Organization**: Automatic import sorting and grouping
- **TypeScript Integration**: Comprehensive TypeScript support
- **Accessibility**: WCAG compliance with jsx-a11y rules
- **Performance**: Next.js Core Web Vitals optimization
- **Code Quality**: Consistent naming conventions and best practices

### Disabled Rules
- `react/react-in-jsx-scope`: Not needed in React 17+
- `react/prop-types`: Using TypeScript for prop validation
- `@typescript-eslint/no-explicit-any`: Allowed in tests and stories

### Custom Rules
- Unused variables with underscore prefix are allowed
- Console statements are warnings (errors in production builds)
- Import order is enforced with automatic alphabetization
- TypeScript strict boolean expressions in TypeScript config

## Integration with Prettier

This configuration is designed to work with Prettier. Make sure you have Prettier configured in your project:

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
```

## VS Code Integration

Add to your VS Code settings:

```json
{
  "eslint.workingDirectories": [
    "apps/web",
    "packages/ui",
    "packages/types",
    "packages/utils",
    "packages/data"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```