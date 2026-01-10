# Contributing to Erold CLI

Thank you for your interest in contributing to the Erold CLI! This document provides guidelines for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/cli.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development

```bash
# Run tests
npm test

# Run in development mode
npm run dev

# Build
npm run build
```

## Git Workflow

### Branching Strategy

```
main                    # Production-ready code
├── feature/*           # New features (feature/add-command)
├── bugfix/*            # Bug fixes (bugfix/fix-output)
├── hotfix/*            # Urgent fixes (hotfix/security-patch)
└── docs/*              # Documentation (docs/update-readme)
```

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/short-description` | `feature/add-sync-command` |
| Bug fix | `bugfix/short-description` | `bugfix/fix-config-path` |
| Hotfix | `hotfix/short-description` | `hotfix/security-patch` |
| Docs | `docs/short-description` | `docs/update-usage-guide` |

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add task sync command
fix: resolve config path resolution
docs: update CLI usage examples
chore: bump dependencies
```

## Pull Request Process

1. Create a branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Format code: `npm run format` (if available)
5. Submit PR with clear description
6. Address review feedback
7. Squash merge to main

## Code Style

- Use consistent formatting (we use Prettier)
- Write descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Reporting Bugs

Use the bug report template when creating issues. Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## Questions?

Feel free to open an issue for questions or reach out at contact@erold.dev.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
