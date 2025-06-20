# Versioning & Release Management Guide

This document outlines the versioning strategy, release process, and best practices for Mustache Cashstage.

## 📋 Overview

Mustache Cashstage follows [Semantic Versioning (SemVer)](https://semver.org/) with additional guidelines for our monorepo structure and multi-package ecosystem.

## 🎯 Versioning Strategy

### Semantic Versioning Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

- **MAJOR**: Breaking changes that require user action
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and minor improvements
- **PRERELEASE**: Alpha, beta, or release candidate versions
- **BUILD**: Build metadata (CI build numbers, commit hashes)

### Version Examples

```bash
1.0.0          # Initial stable release
1.1.0          # New features added
1.1.1          # Bug fix release
1.2.0-alpha.1  # Alpha prerelease
1.2.0-beta.2   # Beta prerelease
1.2.0-rc.1     # Release candidate
2.0.0          # Major version with breaking changes
```

## 📦 Package Versioning

### Monorepo Versioning Strategy

We use **independent versioning** for packages with **synchronized major versions**:

- **Applications** (`apps/*`): Independent versioning
- **Shared Packages** (`packages/*`): Synchronized versioning within major version
- **Documentation**: Follows application versioning

### Package Version Matrix

| Package | Current Version | Next Minor | Next Major |
|---------|----------------|------------|------------|
| `@mustache/web` | 0.1.0 | 0.2.0 | 1.0.0 |
| `@mustache/api` | 0.1.0 | 0.2.0 | 1.0.0 |
| `@mustache/ui` | 0.1.0 | 0.1.1 | 0.2.0 |
| `@mustache/types` | 0.1.0 | 0.1.1 | 0.2.0 |
| `@mustache/utils` | 0.1.0 | 0.1.1 | 0.2.0 |
| `@mustache/eslint-config` | 0.1.0 | 0.1.1 | 0.2.0 |

### Breaking Change Policy

#### Major Version (Breaking Changes)
- API signature changes
- Removal of deprecated features
- Minimum Node.js version changes
- Database schema changes requiring migration
- UI component prop changes

#### Minor Version (New Features)
- New API endpoints
- New UI components
- New optional props or parameters
- Performance improvements
- New configuration options

#### Patch Version (Bug Fixes)
- Bug fixes
- Security patches
- Documentation updates
- Internal refactoring
- Dependency updates (non-breaking)

## 🚀 Release Process

### Release Branches

```bash
main                    # Stable production code
develop                 # Integration branch for next release
feature/feature-name    # Feature development
release/1.2.0          # Release preparation
hotfix/1.1.1           # Critical bug fixes
```

### Release Workflow

#### 1. Pre-Release Preparation

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Update version numbers
npm run version:bump minor

# Update CHANGELOG.md
npm run changelog:generate

# Run full test suite
npm run test:all
npm run test:e2e
npm run test:performance

# Update documentation
npm run docs:build
```

#### 2. Release Candidate Testing

```bash
# Build and tag release candidate
npm run build:all
git tag -a v1.2.0-rc.1 -m "Release candidate 1.2.0-rc.1"

# Deploy to staging environment
npm run deploy:staging

# Run automated tests
npm run test:integration
npm run test:accessibility
npm run test:security
```

#### 3. Production Release

```bash
# Merge to main
git checkout main
git merge release/1.2.0 --no-ff

# Tag the release
git tag -a v1.2.0 -m "Release 1.2.0"

# Deploy to production
npm run deploy:production

# Merge back to develop
git checkout develop
git merge main --no-ff

# Clean up release branch
git branch -d release/1.2.0
```

### Automated Versioning

#### Version Bump Scripts

```json
{
  "scripts": {
    "version:patch": "npm run version:bump patch",
    "version:minor": "npm run version:bump minor", 
    "version:major": "npm run version:bump major",
    "version:prerelease": "npm run version:bump prerelease",
    "version:bump": "node scripts/version-bump.js"
  }
}
```

#### Changelog Generation

```bash
# Generate changelog for current version
npm run changelog:generate

# Generate changelog for specific version
npm run changelog:generate -- --version 1.2.0

# Update existing changelog
npm run changelog:update
```

## 📝 Changelog Management

### Changelog Format

We follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature descriptions

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Now removed features

### Fixed
- Bug fixes

### Security
- Security improvements

## [1.2.0] - 2024-01-21

### Added
- Dashboard drag-and-drop functionality
- Google Sheets integration
- Real-time data updates

### Changed
- Improved chart rendering performance
- Updated design system tokens

### Fixed
- Fixed authentication token refresh
- Resolved mobile responsiveness issues

## [1.1.0] - 2024-01-15
...
```

### Changelog Automation

```bash
# Auto-generate from conventional commits
npm run changelog:auto

# Preview changelog before release
npm run changelog:preview

# Validate changelog format
npm run changelog:validate
```

## 🏷️ Git Tagging Strategy

### Tag Format

```bash
v1.2.0          # Release tag
v1.2.0-alpha.1  # Prerelease tag
v1.2.0-beta.2   # Beta tag
v1.2.0-rc.1     # Release candidate
```

### Tagging Commands

```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release version 1.2.0"

# Create signed tag (recommended for releases)
git tag -s v1.2.0 -m "Release version 1.2.0"

# Push tags to remote
git push origin --tags

# List all tags
git tag -l "v*"

# Delete tag
git tag -d v1.2.0
git push origin --delete v1.2.0
```

## 🚦 Release Channels

### Production Releases

- **Channel**: `latest`
- **Branch**: `main`
- **Deployment**: Production environment
- **Cadence**: Monthly minor releases, weekly patches

### Pre-Release Channels

- **Alpha**: `alpha` channel from `develop` branch
- **Beta**: `beta` channel from `release/*` branches  
- **Release Candidate**: `rc` channel before production

### Installation by Channel

```bash
# Latest stable
npm install @mustache/ui

# Specific version
npm install @mustache/ui@1.2.0

# Pre-release channels
npm install @mustache/ui@alpha
npm install @mustache/ui@beta
npm install @mustache/ui@rc
```

## 🔄 Migration Guides

### Breaking Changes Documentation

For each major release, provide migration guides:

```markdown
# Migration Guide: v1.x to v2.x

## Overview
This guide helps you migrate from version 1.x to 2.x.

## Breaking Changes

### API Changes
- `oldApiMethod()` renamed to `newApiMethod()`
- `deprecatedProp` removed from `ComponentName`

### Before (v1.x)
```typescript
import { ComponentName } from '@mustache/ui'

<ComponentName deprecatedProp="value" />
```

### After (v2.x)
```typescript
import { ComponentName } from '@mustache/ui'

<ComponentName newProp="value" />
```

## Automated Migration

Use our migration tool to automate most changes:

```bash
npx @mustache/migrate-v2
```
```

### Deprecation Warnings

```typescript
// Add deprecation warnings for removed features
/**
 * @deprecated Use newMethod() instead. Will be removed in v2.0.0
 */
export function oldMethod() {
  console.warn('oldMethod is deprecated. Use newMethod() instead.')
  return newMethod()
}
```

## 📊 Release Metrics

### Success Criteria

- **Build Success**: All CI/CD pipelines pass
- **Test Coverage**: Maintain >90% code coverage
- **Performance**: No regression in Core Web Vitals
- **Security**: No critical vulnerabilities
- **Accessibility**: WCAG 2.1 AA compliance

### Release Monitoring

```bash
# Monitor deployment health
npm run monitor:health

# Check performance metrics
npm run monitor:performance

# Validate feature flags
npm run monitor:features

# Error rate monitoring
npm run monitor:errors
```

## 🛠️ Development Tools

### Version Management Scripts

```javascript
// scripts/version-bump.js
const fs = require('fs')
const semver = require('semver')

function bumpVersion(type) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const newVersion = semver.inc(packageJson.version, type)
  
  packageJson.version = newVersion
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
  
  console.log(`Version bumped to ${newVersion}`)
  return newVersion
}
```

### Release Validation

```bash
# Pre-release checklist
npm run release:validate

# Security audit
npm audit --audit-level=high

# Bundle size check
npm run analyze:bundle

# Performance regression test
npm run test:performance
```

## 📋 Release Checklist

### Pre-Release Checklist

- [ ] All tests passing
- [ ] Security audit clean
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers bumped
- [ ] Migration guide written (if breaking changes)
- [ ] Stakeholder review complete

### Release Day Checklist

- [ ] Create release branch
- [ ] Run final test suite
- [ ] Deploy to staging
- [ ] Stakeholder acceptance testing
- [ ] Tag release
- [ ] Deploy to production
- [ ] Monitor deployment
- [ ] Update documentation site
- [ ] Send release announcement

### Post-Release Checklist

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Plan next release
- [ ] Update project roadmap

## 🎯 Best Practices

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(dashboard): add drag-and-drop widget positioning
fix(auth): resolve token refresh issue
docs(api): update authentication examples
chore(deps): upgrade react to v18.3.1
```

### Release Notes Template

```markdown
## 🚀 What's New in v1.2.0

### ✨ New Features
- **Dashboard Builder**: Drag-and-drop widget positioning
- **Data Integration**: Google Sheets connector
- **Real-time Updates**: Live data synchronization

### 🐛 Bug Fixes
- Fixed authentication token refresh (#123)
- Resolved mobile responsiveness issues (#124)

### 📊 Performance
- 40% faster chart rendering
- Reduced bundle size by 15%

### 🔒 Security
- Updated dependencies with security patches
- Enhanced input validation

### 📚 Documentation
- Complete API documentation
- New migration guide
- Updated getting started tutorial

## 📦 Installation

```bash
npm install @mustache/ui@1.2.0
```

## 🔗 Resources
- [Migration Guide](docs/migrations/v1.2.0.md)
- [API Documentation](docs/api/README.md)
- [GitHub Release](https://github.com/your-org/repo/releases/tag/v1.2.0)
```

---

## 📚 References

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Last Updated**: 2024-01-21  
**Version**: 1.0.0  
**Maintainer**: Mustache Cashstage Development Team