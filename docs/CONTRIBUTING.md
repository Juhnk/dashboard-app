# Contributing to Mustache Cashstage

Thank you for your interest in contributing to Mustache Cashstage! This document provides comprehensive guidelines for contributing to our next-generation marketing analytics platform.

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js 18+** and npm
- **Docker & Docker Compose** for development services
- **Git** with conventional commit knowledge
- **WSL2** (if on Windows) - see [WSL2_TESTING_GUIDE.md](WSL2_TESTING_GUIDE.md)

### Setup Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/mustache-cashstage.git
   cd mustache-cashstage
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development environment:**
   ```bash
   npm run dev
   ```

5. **Verify setup:**
   ```bash
   npm run health
   ```

## 📋 Contribution Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
# or  
git checkout -b docs/documentation-update
```

### 2. Development Guidelines

#### **SDLC Process (Software Development Lifecycle)**
We follow a strict SDLC with automated quality gates:

- **Conventional Commits**: All commits must follow conventional commit format
- **Pre-commit Hooks**: Automatic linting, formatting, and type checking
- **Automated Testing**: Unit tests (70%+ coverage) + E2E tests required
- **Code Review**: All changes require PR approval
- **Automated Releases**: Semantic versioning with automated changelog generation

#### **Code Standards**
- **TypeScript**: Strict mode enabled, full type coverage required
- **ESLint**: Must pass with zero warnings
- **Prettier**: Auto-formatting enforced
- **Testing**: Required for new features and bug fixes (70%+ coverage)

#### **Development Commands**
```bash
# Development
npm run dev                 # Start development environment
npm run dev:web            # Start only web app (faster)

# Code Quality
npm run typecheck          # TypeScript validation
npm run lint               # ESLint validation  
npm run format             # Prettier formatting
npm run build              # Production build test

# Testing
npm run test               # Run all tests (via Turbo)
npm run test:unit          # Unit tests with Vitest
npm run test:e2e           # End-to-end tests with Playwright
npm run test:e2e:ui        # E2E tests with UI mode
npm run test:coverage      # Unit tests with coverage report
npm run storybook          # Component development
npm run chromatic          # Visual regression testing

# Health Monitoring  
npm run health             # Comprehensive health check
npm run wsl2:diagnose      # WSL2-specific diagnostics
```

### 3. Commit Message Format

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### **Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring (no functional changes)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD changes
- `chore`: Other changes (maintenance)

#### **Examples:**
```bash
feat(dashboard): add widget drag and drop functionality
fix(charts): resolve line chart rendering issue with empty data
docs(contributing): update SDLC process documentation
test(components): add unit tests for LineChart component
```

**Note:** Commit messages are validated by commitlint pre-commit hooks.

### 4. Code Quality Requirements

#### **Before Submitting PR:**
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] `npm run build` completes successfully
- [ ] `npm run test:unit` passes with 70%+ coverage
- [ ] `npm run test:e2e` passes (for features affecting UI)
- [ ] New components have Storybook stories
- [ ] Visual regression tests pass (`npm run chromatic`)
- [ ] Commit messages follow conventional format
- [ ] Pre-commit hooks pass automatically

#### **Code Style:**
- **Components**: Use functional components with TypeScript
- **State Management**: Zustand for client state, TanStack Query for server state
- **Styling**: Tailwind CSS with design tokens
- **Error Handling**: Comprehensive error boundaries and validation
- **Accessibility**: WCAG 2.1 AA compliance required

### 4. Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Feature additions
git commit -m "feat: add Google Ads data connector"
git commit -m "feat(dashboard): implement drag-and-drop widget builder"

# Bug fixes  
git commit -m "fix: resolve chart rendering issue with null data"
git commit -m "fix(auth): handle expired OAuth tokens properly"

# Documentation
git commit -m "docs: update API documentation for data sources"
git commit -m "docs(contributing): add testing guidelines"

# Code improvements
git commit -m "refactor: optimize data aggregation performance"
git commit -m "style: improve button component accessibility"

# CI/Build changes
git commit -m "ci: add visual regression testing workflow"
git commit -m "build: update dependencies for security patches"

# Breaking changes
git commit -m "feat!: redesign dashboard API structure"
```

**Commit Message Format:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semi colons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `ci`: CI configuration changes
- `build`: Build system or dependency changes
- `chore`: Other changes that don't modify src or test files

## 🏗️ Architecture Guidelines

### Monorepo Structure
```
dashboard-app/
├── apps/
│   ├── web/          # Next.js frontend application
│   ├── api/          # NestJS backend API
│   └── worker/       # Background job processing
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Shared utilities
│   └── data/         # Data processing utilities
```

### Component Development

#### **UI Components (packages/ui):**
- Must include TypeScript interfaces
- Require Storybook stories with all variants
- Follow Radix UI patterns for accessibility
- Include comprehensive prop documentation

#### **Chart Components (apps/web/src/components/charts):**
- Support multi-source data aggregation
- Implement responsive design patterns
- Include error states and loading scenarios
- Follow established chart configuration patterns

#### **Dashboard Components:**
- Support drag-and-drop functionality
- Implement real-time data updates
- Include builder and viewer modes
- Follow grid layout patterns

### State Management Patterns

#### **Zustand Stores:**
- **Dashboard Store**: Widget CRUD, layout management, auto-save
- **Data Source Store**: Connection management, query configuration
- **UI Store**: Application UI state, modals, selections

#### **TanStack Query:**
- Server state management with caching
- Real-time data updates
- Error handling and retry logic
- Optimistic updates for better UX

### API Development (NestJS)

#### **Controller Patterns:**
```typescript
@Controller('data-sources')
export class DataSourceController {
  @Get(':id/data')
  @UseGuards(JwtAuthGuard)
  async getData(@Param('id') id: string, @Query() query: DataQueryDto) {
    // Implementation
  }
}
```

#### **Service Patterns:**
- Dependency injection for all services
- Comprehensive error handling
- Logging and monitoring integration
- Rate limiting and security measures

## 🧪 Testing Guidelines

### Component Testing
- **Storybook Stories**: Required for all UI components
- **Visual Regression**: Chromatic integration for pixel-perfect consistency
- **Accessibility Testing**: Automated a11y validation
- **Interaction Testing**: User interaction scenarios

### Integration Testing
- **API Endpoints**: Full request/response testing
- **Database Operations**: Data integrity and performance
- **Authentication Flows**: Complete OAuth and JWT testing
- **Data Processing**: Multi-source aggregation testing

### Performance Testing
- **Bundle Size**: Monitor and enforce performance budgets
- **Rendering Performance**: Chart and dashboard optimization
- **API Response Times**: Backend performance monitoring
- **Memory Usage**: Client-side memory leak prevention

## 📊 Component Development Standards

### Storybook Requirements
Every component must include:
```typescript
// ComponentName.stories.tsx
export default {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    docs: {
      description: {
        component: 'Comprehensive component description'
      }
    }
  }
};

export const Default = {
  args: {
    // Default props
  }
};

export const AllVariants = {
  render: () => (
    // Showcase all variants
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all component variants and states'
      }
    }
  }
};
```

### Design System Compliance
- **Color Tokens**: Use only design system colors
- **Typography**: Follow established type scale
- **Spacing**: Use consistent spacing tokens
- **Animation**: Follow motion design principles
- **Accessibility**: WCAG 2.1 AA compliance mandatory

## 🔒 Security Guidelines

### Data Handling
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Prevention**: Proper output encoding
- **Authentication**: JWT tokens with proper expiration

### API Security
- **Rate Limiting**: Multiple-tier throttling
- **CORS Configuration**: Properly configured origins
- **Headers Security**: Comprehensive security headers
- **Environment Variables**: Sensitive data protection

### Client-Side Security
- **CSP Headers**: Content Security Policy implementation
- **Data Sanitization**: Client-side input validation
- **Session Management**: Secure token handling
- **Error Handling**: No sensitive data in error messages

## 📖 Documentation Standards

### Code Documentation
- **JSDoc Comments**: All public APIs documented
- **README Files**: Package-level documentation
- **Type Definitions**: Comprehensive TypeScript interfaces
- **Examples**: Working code examples for complex APIs

### Component Documentation
- **Storybook Stories**: Interactive documentation
- **Props Tables**: Auto-generated from TypeScript
- **Usage Examples**: Real-world implementation scenarios
- **Accessibility Notes**: Screen reader and keyboard navigation

## 🚀 Release Process

### Version Management
- **Semantic Versioning**: Major.Minor.Patch format
- **Changelog**: Automated changelog generation
- **Release Notes**: Comprehensive feature documentation
- **Breaking Changes**: Clear migration guides

### Deployment Pipeline
- **Staging Deployment**: Automatic on PR merge
- **Production Deployment**: Manual approval required
- **Rollback Strategy**: Immediate rollback capability
- **Health Monitoring**: Post-deployment verification

## 🤝 Community Guidelines

### Communication
- **Be Respectful**: Professional and inclusive communication
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Allow time for responses and reviews
- **Be Collaborative**: Work together toward common goals

### Issue Reporting
- **Use Templates**: Follow provided issue templates
- **Provide Context**: Include relevant environment details
- **Include Reproduction**: Steps to reproduce issues
- **Attach Logs**: Relevant error logs and screenshots

### Pull Request Guidelines
- **Clear Description**: Explain what and why changes were made
- **Link Issues**: Reference related issues and discussions
- **Small PRs**: Keep changes focused and reviewable
- **Update Documentation**: Include relevant documentation updates

## 📚 Learning Resources

### Project-Specific
- **[Development Guide](DEVELOPMENT_GUIDE.md)**: Comprehensive development setup
- **[Design System](DESIGN_SYSTEM.md)**: UI component library and standards
- **[WSL2 Guide](WSL2_TESTING_GUIDE.md)**: Windows development optimization
- **[User Testing](USER_TESTING_GUIDE.md)**: Testing workflows and procedures

### Technology Stack
- **[Next.js Documentation](https://nextjs.org/docs)**: Frontend framework
- **[NestJS Documentation](https://docs.nestjs.com/)**: Backend framework
- **[Tailwind CSS](https://tailwindcss.com/docs)**: Styling framework
- **[Storybook](https://storybook.js.org/docs)**: Component development
- **[TanStack Query](https://tanstack.com/query/latest)**: Server state management

## 🏆 Recognition

Contributors who make significant improvements will be recognized in:
- **CHANGELOG.md**: Feature and improvement credits
- **README.md**: Major contributor acknowledgments
- **Release Notes**: Specific contribution highlights

## 📞 Getting Help

### Development Support
- **GitHub Issues**: Technical questions and bug reports
- **GitHub Discussions**: Architecture and design discussions
- **Code Reviews**: Detailed feedback on pull requests

### Documentation
- **CLAUDE.md**: Comprehensive project reference
- **Development Guides**: Step-by-step setup and workflow
- **API Documentation**: Backend API reference
- **Component Library**: Interactive Storybook documentation

---

**Thank you for contributing to Mustache Cashstage!** Your contributions help build the next generation of marketing analytics platforms. Together, we're creating software that transforms how marketing teams understand and act on their data.

For questions or support, please create an issue or start a discussion on GitHub.