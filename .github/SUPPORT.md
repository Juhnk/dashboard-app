# Support

We're here to help! This document outlines the various ways you can get support for Mustache Cashstage.

## 📋 Before Seeking Support

1. **Check existing documentation**: Browse our [Documentation Hub](../docs/README.md)
2. **Search existing issues**: Look through [GitHub Issues](https://github.com/your-org/dashboard-app/issues)
3. **Review discussions**: Check [GitHub Discussions](https://github.com/your-org/dashboard-app/discussions)

## 🎯 How to Get Help

### For General Questions

- **[GitHub Discussions](https://github.com/your-org/dashboard-app/discussions)** - Best for general questions, ideas, and community interaction
- **[Documentation](../docs/README.md)** - Comprehensive guides and references

### For Bug Reports

- **[GitHub Issues](https://github.com/your-org/dashboard-app/issues/new/choose)** - Use the bug report template
- Provide detailed information including:
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details
  - Console logs/screenshots

### For Feature Requests

- **[GitHub Issues](https://github.com/your-org/dashboard-app/issues/new/choose)** - Use the feature request template
- Include:
  - Problem statement
  - Proposed solution
  - User stories
  - Business value

### For Security Issues

- **[Security Advisories](https://github.com/your-org/dashboard-app/security/advisories/new)** - Report vulnerabilities privately
- **[Security Policy](../docs/SECURITY.md)** - Review our security guidelines

### For Documentation Issues

- **[GitHub Issues](https://github.com/your-org/dashboard-app/issues/new/choose)** - Use the documentation template
- Help us improve our docs by reporting:
  - Missing information
  - Unclear instructions
  - Outdated content
  - Broken links

## 📧 Direct Contact

### Email Support

- **General inquiries**: support@mustache-cashstage.dev
- **Business inquiries**: business@mustache-cashstage.dev
- **Security reports**: security@mustache-cashstage.dev

### Response Times

- **GitHub Issues**: 1-2 business days
- **Security issues**: Same day for critical issues
- **Email support**: 2-3 business days
- **General discussions**: Community-driven, varies

## 🚀 Contributing

The best way to get support is often to contribute back to the project:

1. **Fix documentation**: Help others by improving docs
2. **Answer questions**: Participate in discussions
3. **Submit PRs**: Fix bugs or add features
4. **Review PRs**: Help maintain code quality

See our [Contributing Guide](../docs/CONTRIBUTING.md) for detailed information.

## 📚 Resources

### Documentation

- **[Getting Started](../README.md)** - Project overview and quick start
- **[API Documentation](../docs/api/README.md)** - Complete API reference
- **[Style Guide](../docs/STYLE_GUIDE.md)** - Coding standards
- **[Performance Standards](../docs/PERFORMANCE_STANDARDS.md)** - Performance guidelines

### Development

- **[Development Guide](../docs/development/DEVELOPMENT_GUIDE.md)** - Detailed setup instructions
- **[Developer Reference](../docs/CLAUDE.md)** - Internal development notes
- **[Templates](../docs/templates/)** - Code templates and examples

### Community

- **[Code of Conduct](../docs/CODE_OF_CONDUCT.md)** - Community guidelines
- **[Security Policy](../docs/SECURITY.md)** - Security procedures
- **[Changelog](../docs/CHANGELOG.md)** - Version history

## ⚡ Quick Fixes

### Common Issues

- **Build failures**: Check Node.js version (18+) and run `npm install`
- **Port conflicts**: Default ports are 3000 (web) and 3001 (api)
- **Database issues**: Ensure PostgreSQL is running (`npm run docker:dev`)
- **WSL2 issues**: See [WSL2 Testing Guide](../docs/testing/WSL2_TESTING_GUIDE.md)

### Environment Setup

```bash
# Reset everything
npm run clean
npm install
npm run docker:dev
npm run dev
```

### Health Check

```bash
# Verify everything is working
npm run health
curl http://localhost:3000/api/health
```

## 🏷️ Issue Labels

When creating issues, these labels help us prioritize:

- **Priority**: `critical`, `high`, `medium`, `low`
- **Type**: `bug`, `enhancement`, `documentation`, `question`
- **Component**: `frontend`, `backend`, `api`, `ui`, `performance`
- **Status**: `triage`, `in-progress`, `blocked`, `ready-for-review`

## 🤝 Community Guidelines

- **Be respectful**: Follow our [Code of Conduct](../docs/CODE_OF_CONDUCT.md)
- **Be specific**: Provide detailed information in issue reports
- **Be patient**: Our team and community volunteers do their best to help
- **Be constructive**: Focus on solutions and improvements

## 🔄 Support Workflow

1. **Issue Created** → Community/team reviews
2. **Triage** → Issue is labeled and prioritized
3. **Assignment** → Issue is assigned to contributor
4. **Resolution** → Fix is implemented and tested
5. **Closure** → Issue is resolved and closed

---

Thank you for using Mustache Cashstage! We appreciate your feedback and contributions to making this project better for everyone.
