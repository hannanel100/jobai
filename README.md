# JobAI - AI-Powered Job Application Assistant

A [Next.js](https://nextjs.org) application that helps users create and manage job applications with AI assistance.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/hannanel100/jobai.git
cd jobai

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📋 Available Scripts

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run dev`           | Start development server  |
| `npm run build`         | Build for production      |
| `npm run start`         | Start production server   |
| `npm run lint`          | Run ESLint                |
| `npm run lint:fix`      | Fix ESLint issues         |
| `npm run type-check`    | Check TypeScript types    |
| `npm run format`        | Format code with Prettier |
| `npm run quality:check` | Run all quality checks    |

## 🛡️ Code Quality

This project enforces high code quality standards with automated checks:

- **TypeScript**: Static type checking
- **ESLint**: Code linting and best practices
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks
- **Commitlint**: Conventional commit messages
- **GitHub Actions**: CI/CD pipeline

### Quick Reference

- 📖 [Full Quality Gates Documentation](docs/QUALITY_GATES.md)
- ⚡ [Quick Reference Guide](docs/QUICK_REFERENCE.md)

### Development Workflow

1. Make changes
2. Stage files: `git add .`
3. Commit: `git commit -m "feat: description"`
4. Push: `git push`

Pre-commit hooks automatically run linting, formatting, and type checking.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
