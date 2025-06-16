#!/usr/bin/env node

// Script to validate that all buttons use the theme system
const fs = require('fs');
const path = require('path');

// Recursively find all .tsx files
function findTsxFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== 'node_modules') {
        traverse(fullPath);
      } else if (item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Check if a file imports the theme
function hasThemeImport(content) {
  return (
    content.includes("from '@/lib/theme'") ||
    content.includes('from "@/lib/theme"')
  );
}

// Check if buttons use theme styling
function hasThemedButtons(content) {
  const themePatterns = [
    /style=\{\{[^}]*theme\./,
    /backgroundColor:\s*theme\./,
    /borderColor:\s*theme\./,
    /color:\s*theme\./,
  ];

  return themePatterns.some(pattern => pattern.test(content));
}

// Find buttons in content
function findButtons(content) {
  const buttonMatches = content.match(/<Button[^>]*>/g) || [];
  return buttonMatches;
}

// Main analysis
function analyzeComponents() {
  console.log('🔍 Analyzing components for theme compliance...\n');

  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const files = findTsxFiles(componentsDir);

  console.log(`Found ${files.length} component files\n`);

  const results = [];
  const needsUpdate = [];

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const buttons = findButtons(content);

    if (buttons.length > 0) {
      const hasTheme = hasThemeImport(content);
      const hasThemedBtns = hasThemedButtons(content);

      const analysis = {
        filePath: path.relative(process.cwd(), file),
        buttonCount: buttons.length,
        hasThemeImport: hasTheme,
        hasThemedButtons: hasThemedBtns,
        needsUpdate: !hasTheme || !hasThemedBtns,
      };

      results.push(analysis);

      if (analysis.needsUpdate) {
        needsUpdate.push(analysis);
      }
    }
  });

  // Report results
  console.log(`📊 THEME COMPLIANCE REPORT`);
  console.log('='.repeat(50));
  console.log(`Files with buttons: ${results.length}`);
  console.log(`Files compliant: ${results.length - needsUpdate.length}`);
  console.log(`Files needing updates: ${needsUpdate.length}\n`);

  if (needsUpdate.length > 0) {
    console.log('🚨 FILES NEEDING THEME UPDATES:');
    console.log('-'.repeat(40));

    needsUpdate.forEach(file => {
      console.log(`\n📄 ${file.filePath}`);
      console.log(`   Buttons: ${file.buttonCount}`);
      console.log(`   Theme import: ${file.hasThemeImport ? '✅' : '❌'}`);
      console.log(`   Themed buttons: ${file.hasThemedButtons ? '✅' : '❌'}`);
    });
  }

  const compliance = Math.round(
    ((results.length - needsUpdate.length) / results.length) * 100
  );
  console.log(`\n📋 COMPLIANCE: ${compliance}%`);

  if (needsUpdate.length === 0) {
    console.log('🎉 All buttons are properly themed!');
  }
}

// Run analysis
try {
  analyzeComponents();
} catch (error) {
  console.error('Error:', error.message);
}
