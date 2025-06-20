# Commit Guidelines

This document outlines the commit message conventions and development workflow for Mustache Cashstage.

## 🎯 Overview

We use [Conventional Commits](https://www.conventionalcommits.org/) specification to ensure consistent, meaningful commit messages that enable automated versioning and changelog generation.

## 📝 Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Required Elements

- **type**: The type of change (see types below)
- **description**: A short description of the change (imperative mood)

### Optional Elements

- **scope**: The area of codebase affected (e.g., `dashboard`, `charts`, `auth`)
- **body**: Longer description of the change
- **footer**: Additional information (breaking changes, issue references)

## 🏷️ Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(dashboard): add widget drag and drop` |
| `fix` | Bug fix | `fix(charts): resolve line chart rendering issue` |
| `docs` | Documentation changes | `docs(readme): update installation guide` |
| `style` | Code style changes | `style(components): fix formatting issues` |
| `refactor` | Code refactoring | `refactor(utils): extract chart utility functions` |
| `perf` | Performance improvements | `perf(charts): optimize data processing` |
| `test` | Adding/updating tests | `test(dashboard): add unit tests for store` |
| `build` | Build system changes | `build(deps): update to React 18` |
| `ci` | CI/CD changes | `ci(github): add automated testing workflow` |
| `chore` | Maintenance tasks | `chore(deps): update development dependencies` |
| `revert` | Revert previous commit | `revert: feat(dashboard): add widget drag and drop` |

## 🎯 Scopes

Use these common scopes to indicate which part of the codebase is affected:

### Frontend Scopes
- `dashboard`: Dashboard-related features
- `charts`: Chart components and visualization
- `auth`: Authentication and authorization
- `ui`: UI components and design system
- `stores`: State management (Zustand stores)
- `hooks`: Custom React hooks
- `components`: React components
- `pages`: Next.js pages and routing

### Backend Scopes
- `api`: API routes and endpoints
- `db`: Database schema and migrations
- `workers`: Background job processing
- `auth`: Authentication middleware
- `validation`: Input validation and schemas

### Infrastructure Scopes
- `docker`: Docker configuration
- `ci`: CI/CD pipelines
- `deployment`: Deployment configuration
- `monitoring`: Logging and monitoring
- `security`: Security-related changes

## ✅ Good Examples

### Feature Additions
```bash
feat(dashboard): add real-time widget updates
feat(charts): implement donut chart component
feat(auth): add Google OAuth integration
```

### Bug Fixes
```bash
fix(charts): resolve data loading race condition
fix(dashboard): prevent widget overlap on small screens
fix(api): handle database connection timeout errors
```

### Documentation
```bash
docs(contributing): add SDLC process documentation
docs(api): update endpoint documentation
docs(readme): add WSL2 development setup guide
```

### Testing
```bash
test(charts): add E2E tests for chart rendering
test(dashboard): increase unit test coverage to 85%
test(api): add integration tests for dashboard endpoints
```

### Refactoring
```bash
refactor(components): extract shared chart utilities
refactor(stores): simplify dashboard state management
refactor(api): consolidate validation middleware
```

## ❌ Examples to Avoid

```bash
# Too vague
fix: bug fix
feat: new feature
update: changes

# Missing type
dashboard: add new widget
resolve chart issues
update documentation

# Wrong mood (should be imperative)
feat(dashboard): added new widget functionality
fix(charts): fixed the rendering bug
docs(readme): updated the setup instructions

# Too long subject (over 72 characters)
feat(dashboard): add comprehensive drag and drop functionality with keyboard navigation support and accessibility features
```

## 🔧 Automated Enforcement

### Pre-commit Hooks

Commitlint validates commit messages automatically:

```bash
# This will be rejected
git commit -m "fixed bug"

# This will be accepted
git commit -m "fix(charts): resolve data loading issue"
```

### Configuration

See `commitlint.config.js` for our specific rules:
- Maximum header length: 72 characters
- Subject must not end with period
- Subject must be in lowercase
- Type must be from approved list

## 🚀 Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the footer:

```bash
feat(api): restructure dashboard API endpoints

BREAKING CHANGE: The /api/dashboard endpoint now returns data in a different format. 
Clients need to update to handle the new response structure.

Closes #123
```

Or use the `!` shorthand:

```bash
feat(api)!: restructure dashboard API endpoints
```

## 🔄 Multi-line Commits

For complex changes, use the body and footer:

```bash
feat(dashboard): implement advanced filtering system

Add comprehensive filtering capabilities including:
- Date range filtering
- Multi-select category filters  
- Search functionality
- Filter state persistence

The new system improves user productivity by allowing
quick data discovery and analysis.

Closes #456
Refs #123, #789
```

## 🏃‍♂️ Development Workflow

### 1. Start Feature
```bash
git checkout -b feat/widget-drag-drop
```

### 2. Make Changes with Good Commits
```bash
git add .
git commit -m "feat(dashboard): add basic drag and drop structure"

git add .
git commit -m "feat(dashboard): implement drop zone detection"

git add .
git commit -m "test(dashboard): add E2E tests for drag and drop"
```

### 3. Create Pull Request
The PR will automatically include all commit messages and trigger CI/CD pipelines.

## 📊 Benefits

Following these conventions enables:

### Automated Versioning
- `feat`: Minor version bump (1.1.0 → 1.2.0)
- `fix`: Patch version bump (1.1.0 → 1.1.1)
- `BREAKING CHANGE`: Major version bump (1.1.0 → 2.0.0)

### Automated Changelog
```markdown
## [1.2.0] - 2024-01-15

### ✨ Features
- **dashboard**: add widget drag and drop functionality
- **charts**: implement donut chart component

### 🐛 Bug Fixes
- **charts**: resolve data loading race condition
- **api**: handle database connection timeout errors
```

### Better Git History
```bash
git log --oneline
feat(dashboard): add widget drag and drop functionality
fix(charts): resolve line chart rendering issue
test(components): add unit tests for LineChart
docs(contributing): update SDLC process documentation
```

## 🆘 Getting Help

### Commit Message Issues
- Use `git commit --amend` to fix the last commit message
- Use `git rebase -i` to fix multiple commit messages
- Ask team members for review before pushing

### Pre-commit Hook Issues
```bash
# Skip hooks temporarily (not recommended)
git commit --no-verify -m "emergency fix"

# Fix and recommit
npm run lint
git add .
git commit -m "fix(charts): resolve critical rendering bug"
```

### Tools and Resources
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitizen](https://github.com/commitizen/cz-cli) - Interactive commit tool
- [Commitlint](https://commitlint.js.org/) - Commit message linting
- VS Code Extension: "Conventional Commits"