# Quick Reference: Code Quality Gates

## 🚀 Quick Start

### Before Your First Commit

```bash
# Install dependencies (if not done)
npm install

# Check if everything works
npm run quality:check
```

### Daily Development Workflow

```bash
# 1. Make your changes
# 2. Stage files
git add .

# 3. Commit (hooks run automatically)
git commit -m "feat: add awesome feature"

# 4. Push
git push
```

## 📋 Available Commands

| Command                 | What it does            |
| ----------------------- | ----------------------- |
| `npm run lint`          | Check for code issues   |
| `npm run lint:fix`      | Fix auto-fixable issues |
| `npm run type-check`    | Check TypeScript types  |
| `npm run format`        | Format all code         |
| `npm run quality:check` | Run all quality checks  |

## ✅ Commit Message Format

```
type: description

Examples:
feat: add user login
fix: resolve upload bug
docs: update README
style: format code
refactor: optimize queries
test: add auth tests
chore: update deps
```

## 🚨 When Things Go Wrong

### Pre-commit hook fails?

```bash
npm run type-check  # Fix TypeScript errors
npm run lint:fix    # Fix linting issues
npm run format      # Format code
```

### Commit message rejected?

Use the format: `type: description`
Valid types: feat, fix, docs, style, refactor, test, chore

### CI pipeline fails?

Run locally first: `npm run quality:check`

## 🔧 Emergency Bypass (Use Sparingly!)

```bash
git commit --no-verify -m "emergency fix"
```

## 📚 Need More Info?

See the full documentation: `docs/QUALITY_GATES.md`
