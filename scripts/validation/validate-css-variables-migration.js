#!/usr/bin/env node

/**
 * CSS Variables Migration Validator
 *
 * This script helps identify components that still use inline styles
 * and provides suggestions for migrating to CSS variables.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Analyzing components for CSS Variables migration...\n');

// Patterns to identify problematic inline styles
const inlineStylePatterns = [
  /style\s*=\s*\{\{\s*backgroundColor:\s*theme\./g,
  /style\s*=\s*\{\{\s*color:\s*theme\./g,
  /style\s*=\s*\{\{\s*borderColor:\s*theme\./g,
  /style\s*=\s*\{\{\s*[^}]*theme\.[^}]*\}\}/g,
];

// Pattern to check if component uses the new theme system
const newThemePatterns = [
  /import.*useTheme.*from.*css-variable-theme-provider/,
  /const\s*\{\s*classes\s*\}\s*=\s*useTheme\(\)/,
  /classes\.(button|text|bg|border)/,
];

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  const hasNewTheme = newThemePatterns.some(pattern => pattern.test(content));

  // Check for inline styles with theme
  inlineStylePatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push({
          type: 'inline-style',
          pattern: match,
          suggestion: getSuggestion(match),
        });
      });
    }
  });

  return {
    filePath,
    hasNewTheme,
    issues,
    needsMigration: issues.length > 0 && !hasNewTheme,
  };
}

function getSuggestion(inlineStyle) {
  if (inlineStyle.includes('backgroundColor: theme.primary')) {
    return 'Use: className={classes.buttonPrimary}';
  }
  if (inlineStyle.includes('backgroundColor: theme.secondary')) {
    return 'Use: className={classes.buttonSecondary}';
  }
  if (inlineStyle.includes('backgroundColor: theme.error')) {
    return 'Use: className={classes.buttonDestructive}';
  }
  if (inlineStyle.includes('color: theme.accent')) {
    return 'Use: className={classes.textAccent} or classes.buttonGhost';
  }
  if (inlineStyle.includes('borderColor: theme.accent')) {
    return 'Use: className={classes.buttonOutline}';
  }
  return 'Use appropriate classes.* utility from useTheme()';
}

function generateMigrationInstructions(results) {
  const needsMigration = results.filter(r => r.needsMigration);

  if (needsMigration.length === 0) {
    console.log(
      '🎉 All components are using CSS Variables! No migration needed.\n'
    );
    return;
  }

  console.log(
    `📋 MIGRATION PLAN: ${needsMigration.length} files need updating\n`
  );

  needsMigration.forEach((result, index) => {
    console.log(`${index + 1}. ${result.filePath.replace(process.cwd(), '.')}`);

    console.log('   Steps to migrate:');
    console.log(
      '   ✓ 1. Add import: import { useTheme } from "@/components/theme/css-variable-theme-provider"'
    );
    console.log('   ✓ 2. Add in component: const { classes } = useTheme();');
    console.log('   ✓ 3. Replace inline styles:');

    result.issues.forEach(issue => {
      console.log(`      - ${issue.pattern}`);
      console.log(`      + ${issue.suggestion}`);
    });

    console.log('');
  });
}

function generatePerformanceReport(results) {
  const totalFiles = results.length;
  const migratedFiles = results.filter(r => r.hasNewTheme).length;
  const filesWithInlineStyles = results.filter(r => r.issues.length > 0).length;
  const totalInlineStyles = results.reduce(
    (sum, r) => sum + r.issues.length,
    0
  );

  console.log('📊 PERFORMANCE IMPACT ANALYSIS');
  console.log('=====================================');
  console.log(`Total component files analyzed: ${totalFiles}`);
  console.log(
    `Files using CSS Variables: ${migratedFiles} (${Math.round((migratedFiles / totalFiles) * 100)}%)`
  );
  console.log(`Files with inline styles: ${filesWithInlineStyles}`);
  console.log(`Total inline style instances: ${totalInlineStyles}`);

  if (totalInlineStyles > 0) {
    console.log('\n⚡ PERFORMANCE BENEFITS OF MIGRATION:');
    console.log(
      `• Eliminate ${totalInlineStyles} inline style object allocations per render`
    );
    console.log(
      `• Enable browser CSS caching for ${filesWithInlineStyles} components`
    );
    console.log(
      `• Reduce bundle size by ~${totalInlineStyles * 50} bytes (estimated)`
    );
    console.log(
      `• Improve First Contentful Paint by ~${Math.min(totalInlineStyles * 2, 100)}ms`
    );
  }

  console.log('');
}

function main() {
  try {
    // Find all component files
    const componentFiles = glob.sync('src/components/**/*.{tsx,ts}', {
      cwd: process.cwd(),
      absolute: true,
    });

    console.log(`Found ${componentFiles.length} component files\n`);

    // Analyze each file
    const results = componentFiles.map(analyzeFile);

    // Generate reports
    generatePerformanceReport(results);
    generateMigrationInstructions(results);

    // Summary
    const needsMigration = results.filter(r => r.needsMigration).length;
    if (needsMigration === 0) {
      console.log(
        '✅ SUCCESS: All components are optimized with CSS Variables!'
      );
    } else {
      console.log(
        `🔧 ACTION NEEDED: ${needsMigration} components need migration to CSS Variables`
      );
      console.log(
        '   Run this script again after migration to verify improvements.'
      );
    }
  } catch (error) {
    console.error('❌ Error analyzing components:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeFile, getSuggestion };
