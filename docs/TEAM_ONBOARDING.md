# Team Onboarding Checklist

Welcome to the JobAI development team! This checklist will help you get set up with our code quality standards and development workflow.

## ✅ Setup Checklist

### 1. Repository Setup

- [ ] Clone the repository: `git clone https://github.com/hannanel100/jobai.git`
- [ ] Navigate to project: `cd jobai`
- [ ] Install dependencies: `npm install`
- [ ] Verify setup: `npm run quality:check`

### 2. Development Environment

- [ ] Node.js 18.x or 20.x installed
- [ ] Git configured with your name and email
- [ ] VS Code (recommended) with extensions:
  - [ ] ESLint extension
  - [ ] Prettier extension
  - [ ] TypeScript extension
  - [ ] Git Lens (optional)

### 3. Understanding the Workflow

- [ ] Read [Quality Gates Documentation](QUALITY_GATES.md)
- [ ] Review [Quick Reference Guide](QUICK_REFERENCE.md)
- [ ] Understand pre-commit hooks
- [ ] Learn conventional commit format

### 4. Test Your Setup

#### Make a Test Change

1. [ ] Create a new branch: `git checkout -b test/onboarding-[your-name]`
2. [ ] Edit `README.md` (add your name to contributors)
3. [ ] Stage changes: `git add .`
4. [ ] Commit: `git commit -m "docs: add [your-name] to contributors"`
5. [ ] Verify hooks ran successfully
6. [ ] Push: `git push origin test/onboarding-[your-name]`
7. [ ] Create a Pull Request
8. [ ] Verify CI pipeline passes
9. [ ] Delete test branch after review

## 🔧 IDE Configuration

### VS Code Settings (Optional)

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### VS Code Extensions

Install these extensions for the best development experience:

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **TypeScript Importer** (`pmneo.tsimporter`)
4. **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
5. **Bracket Pair Colorizer** (`coenraads.bracket-pair-colorizer`)

## 📚 Learning Resources

### Required Reading

- [ ] [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ ] [Next.js Documentation](https://nextjs.org/docs)

### Recommended Reading

- [ ] [ESLint Rules](https://eslint.org/docs/rules/)
- [ ] [Prettier Options](https://prettier.io/docs/en/options.html)
- [ ] [React Best Practices](https://react.dev/learn)

## 🚀 First Tasks

After completing setup, try these beginner-friendly tasks:

### Easy

- [ ] Fix a TypeScript type issue
- [ ] Add JSDoc comments to a function
- [ ] Update component prop types

### Medium

- [ ] Implement a new utility function
- [ ] Add form validation
- [ ] Create a reusable component

### Advanced

- [ ] Add unit tests for a component
- [ ] Implement error boundary
- [ ] Optimize performance issue

## 🆘 Getting Help

### Common Issues

1. **Husky hooks not working**: Run `npx husky install`
2. **TypeScript errors**: Check `tsconfig.json` paths
3. **ESLint conflicts**: Check `.eslintrc` configuration
4. **Prettier not formatting**: Check VS Code default formatter

### Support Channels

- 💬 **Slack**: #dev-team channel
- 🐛 **Issues**: Create GitHub issues for bugs
- 📖 **Documentation**: Check `docs/` folder
- 🤝 **Code Review**: Ask for help in PRs

## ✨ Quality Standards

Remember our core principles:

1. **Type Safety First**: No `any` types, proper interfaces
2. **Consistent Formatting**: Let Prettier handle it
3. **Meaningful Commits**: Use conventional commit format
4. **Test Everything**: Write tests for new features
5. **Document Changes**: Update docs when needed

## 🎯 Success Criteria

You're ready to contribute when you can:

- [ ] Make changes without breaking quality checks
- [ ] Write proper commit messages
- [ ] Create clean, typed TypeScript code
- [ ] Follow the established patterns
- [ ] Ask questions when unsure

Welcome to the team! 🎉

---

_Questions? Reach out to the team lead or create an issue._
