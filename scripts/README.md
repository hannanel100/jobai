# Project Scripts

This directory contains various utility scripts for testing, validation, migration, and debugging.

## 📁 Directory Structure

### 🧪 Testing Scripts (`test/`)
Scripts for testing various aspects of the application:

- **`test-accessibility-theme.js`** - Tests accessibility compliance of theme palettes
- **`test-ai-analysis.js`** - Sets up test data for AI analysis functionality
- **`test-ai-functionality.js`** - Tests OpenAI integration and AI analysis features
- **`test-ai-integration.js`** - Tests AI actions integration with authentication bypass
- **`test-auth-protection.js`** - Validates authentication protection on routes
- **`test-server-actions.js`** - Tests server action security and protection

### 🔄 Migration Scripts (`migration/`)
Scripts for migrating code and data:

- **`migrate-apps-auth.js`** - Migrates application and auth components from inline styles to CSS variables
- **`migrate-to-css-variables.js`** - Migrates component styles from theme objects to CSS custom properties

### ✅ Validation Scripts (`validation/`)
Scripts for validating code quality and compliance:

- **`check-inline-styles.js`** - Analyzes components for inline styles that need migration
- **`validate-css-variables-migration.js`** - Comprehensive CSS variables migration validator
- **`validate-theme-compliance.js`** - Validates that buttons use the theme system properly

### 🐛 Debug Scripts (`debug/`)
Scripts for debugging and troubleshooting:

- **`debug-resume-content.js`** - Inspects resume content structure in the database

## 🚀 Usage Examples

### Running Tests
```bash
# Test authentication protection
node scripts/test/test-auth-protection.js

# Test AI functionality
node scripts/test/test-ai-functionality.js

# Test accessibility compliance
node scripts/test/test-accessibility-theme.js
```

### Code Migration
```bash
# Migrate components to CSS variables
node scripts/migration/migrate-to-css-variables.js

# Migrate auth components
node scripts/migration/migrate-apps-auth.js
```

### Code Validation
```bash
# Check for inline styles
node scripts/validation/check-inline-styles.js

# Validate CSS variables migration
node scripts/validation/validate-css-variables-migration.js

# Check theme compliance
node scripts/validation/validate-theme-compliance.js
```

### Debugging
```bash
# Debug resume content
node scripts/debug/debug-resume-content.js
```

## 📋 Prerequisites

### Environment Variables
Some scripts require environment variables:
```bash
# For AI testing
OPENAI_API_KEY=your_openai_api_key

# For authentication bypass testing
NODE_ENV=development
BYPASS_AUTH=true
```

### Database
Scripts that interact with the database require:
- Prisma client configured
- Database running and accessible
- Valid database connection string in `.env`

### Development Server
Authentication and server action tests require:
- Next.js development server running on `http://localhost:3000`
- Or custom URL via `TEST_URL` environment variable

## 🔧 Development Workflow

### Theme Migration Workflow
1. Run `check-inline-styles.js` to identify components with inline styles
2. Use `migrate-to-css-variables.js` for automated migration
3. Validate with `validate-css-variables-migration.js`
4. Check compliance with `validate-theme-compliance.js`

### AI Development Workflow
1. Set up test data with `test-ai-analysis.js`
2. Test OpenAI integration with `test-ai-functionality.js`
3. Validate authentication with `test-ai-integration.js`
4. Debug issues with `debug-resume-content.js`

### Security Testing Workflow
1. Test route protection with `test-auth-protection.js`
2. Validate server actions with `test-server-actions.js`
3. Check accessibility with `test-accessibility-theme.js`

## 📊 Output Examples

Most scripts provide detailed output including:
- ✅ Success indicators
- ❌ Error indicators
- 📊 Summary statistics
- 🔧 Actionable recommendations
- 📋 Progress tracking

## 🛡️ Safety Notes

- **Migration scripts** modify source code - commit changes before running
- **Test scripts** may create test data in the database
- **Debug scripts** are read-only and safe to run
- **Validation scripts** are read-only and provide reports only

## 🤝 Contributing

When adding new scripts:
1. Place them in the appropriate subdirectory
2. Add clear documentation headers
3. Include usage examples
4. Update this README
5. Follow the existing naming convention

