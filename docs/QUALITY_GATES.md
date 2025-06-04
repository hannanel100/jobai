# Code Quality Gates

This document outlines the comprehensive code quality infrastructure implemented for the JobAI Next.js application.

## Overview

Our code quality gates ensure that all code meets high standards for:

- **Type Safety**: TypeScript compilation without errors
- **Code Style**: Consistent formatting with Prettier
- **Code Quality**: ESLint rules enforcement
- **Commit Standards**: Conventional commit messages
- **Automated Checks**: Pre-commit hooks and CI/CD pipeline

## Tools and Configuration

### 1. TypeScript

- **Purpose**: Static type checking for JavaScript
- **Configuration**: `tsconfig.json`
- **Command**: `npm run type-check`

### 2. ESLint

- **Purpose**: Code linting and quality enforcement
- **Configuration**: `eslint.config.mjs`
- **Command**: `npm run lint` or `npm run lint:fix`
- **Rules**: Next.js recommended rules with TypeScript support

### 3. Prettier

- **Purpose**: Code formatting
- **Configuration**: `.prettierrc`
- **Settings**:
  - Semi-colons: enabled
  - Single quotes: enabled
  - Line width: 80 characters
  - Tab width: 2 spaces
- **Command**: `npm run format`

### 4. Commitlint

- **Purpose**: Enforce conventional commit messages
- **Configuration**: `commitlint.config.js`
- **Format**: `type(scope): description`
- **Types**: feat, fix, docs, style, refactor, test, chore

### 5. Husky + lint-staged

- **Purpose**: Git hooks automation
- **Pre-commit**: Runs linting, formatting, and type checking on staged files
- **Commit-msg**: Validates commit message format

## Development Workflow

### 1. Making Changes

1. Make your code changes
2. Stage files: `git add .`
3. Commit with conventional message: `git commit -m "feat: add new feature"`

### 2. Pre-commit Process (Automatic)

When you commit, the following happens automatically:

1. **lint-staged** runs on staged files:

   - ESLint with auto-fix
   - Prettier formatting
   - Re-stage formatted files

2. **Type checking** runs on entire codebase
3. **Commit message validation** ensures conventional format

### 3. Manual Quality Checks

Run all quality checks manually:

```bash
npm run quality:check
```

This runs:

- TypeScript compilation
- ESLint linting
- Prettier format check
- Build process

## Available Scripts

| Script                  | Purpose      | Description                     |
| ----------------------- | ------------ | ------------------------------- |
| `npm run lint`          | ESLint check | Check for linting errors        |
| `npm run lint:fix`      | ESLint fix   | Fix auto-fixable linting errors |
| `npm run type-check`    | TypeScript   | Check for type errors           |
| `npm run format`        | Prettier     | Format all files                |
| `npm run quality:check` | All checks   | Run all quality checks          |

## CI/CD Pipeline

### GitHub Actions Workflow

Location: `.github/workflows/ci.yml`

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to these branches

**Steps**:

1. Setup Node.js (versions 18.x and 20.x)
2. Install dependencies
3. Run TypeScript compilation
4. Run ESLint checks
5. Run Prettier format verification
6. Build the application

**Status**: Must pass before merging PRs

## Configuration Files

### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### `commitlint.config.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
    ],
  },
};
```

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
npx lint-staged
npm run type-check
```

## Troubleshooting

### Common Issues

1. **Pre-commit hook fails**

   - Fix TypeScript errors: `npm run type-check`
   - Fix ESLint errors: `npm run lint:fix`
   - Format code: `npm run format`

2. **Commit message rejected**

   - Use conventional format: `type(scope): description`
   - Valid types: feat, fix, docs, style, refactor, test, chore

3. **CI pipeline fails**
   - Check all quality gates pass locally: `npm run quality:check`
   - Ensure all files are committed and pushed

### Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit hook (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"

# Skip commit message validation (NOT RECOMMENDED)
git commit --no-verify -m "quick fix"
```

## Team Guidelines

### 1. Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Examples**:

- `feat: add user authentication`
- `fix: resolve resume upload issue`
- `docs: update API documentation`
- `style: apply code formatting`
- `refactor: optimize database queries`
- `test: add unit tests for auth`
- `chore: update dependencies`

### 2. Code Style Guidelines

- **Use TypeScript**: No `any` types, proper interfaces
- **Follow ESLint rules**: Fix all warnings and errors
- **Consistent formatting**: Let Prettier handle formatting
- **Meaningful names**: Variables, functions, and components
- **Small commits**: Atomic changes with clear messages

### 3. Pull Request Process

1. Create feature branch from `develop`
2. Make changes following quality standards
3. Ensure all quality checks pass locally
4. Push branch and create PR
5. CI pipeline must pass
6. Code review required
7. Merge to `develop`, then to `main`

## Monitoring and Metrics

### Quality Metrics

Track these metrics to maintain code quality:

- **TypeScript Coverage**: Percentage of typed vs untyped code
- **ESLint Violations**: Number of linting errors/warnings
- **Test Coverage**: Percentage of code covered by tests
- **Build Success Rate**: Percentage of successful builds
- **Commit Message Compliance**: Adherence to conventional commits

### Quality Reports

- **GitHub Actions**: Build status and quality check results
- **SonarQube**: (Future) Code quality analysis
- **Codecov**: (Future) Test coverage reports

## Maintenance

### Regular Tasks

1. **Weekly**: Review and update ESLint rules
2. **Monthly**: Update dependencies and check for security vulnerabilities
3. **Quarterly**: Review and update quality standards
4. **As needed**: Add new quality rules based on team feedback

### Updating Tools

```bash
# Update ESLint
npm update eslint @typescript-eslint/eslint-plugin

# Update Prettier
npm update prettier

# Update Husky
npm update husky

# Update Commitlint
npm update @commitlint/cli @commitlint/config-conventional
```

## Support and Resources

- **Internal**: Create issues in the repository for quality-related problems
- **ESLint**: https://eslint.org/docs/
- **Prettier**: https://prettier.io/docs/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Husky**: https://typicode.github.io/husky/

---

_This document is maintained by the development team and should be updated as quality standards evolve._
