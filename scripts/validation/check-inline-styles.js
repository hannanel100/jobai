const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for inline styles in components...\n');

// Simple function to find files recursively
function findFiles(dir, ext) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, ext));
    } else if (item.endsWith(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const inlineStyles =
    content.match(/style\s*=\s*\{\{[^}]*theme\.[^}]*\}\}/g) || [];
  const hasThemeImport =
    content.includes("from '@/lib/theme'") ||
    content.includes('from "@/lib/theme"');
  const hasNewTheme =
    content.includes('useTheme') &&
    content.includes('css-variable-theme-provider');

  return {
    filePath: filePath.replace(process.cwd(), '.'),
    inlineStyles: inlineStyles.length,
    hasThemeImport,
    hasNewTheme,
    needsMigration: inlineStyles.length > 0 && !hasNewTheme,
  };
}

try {
  const componentFiles = findFiles('./src/components', '.tsx');
  console.log(`Found ${componentFiles.length} component files\n`);

  const results = componentFiles.map(analyzeFile);
  const needsMigration = results.filter(r => r.needsMigration);
  const totalInlineStyles = results.reduce((sum, r) => sum + r.inlineStyles, 0);

  console.log('📊 ANALYSIS RESULTS');
  console.log('===================');
  console.log(`Total inline styles found: ${totalInlineStyles}`);
  console.log(`Files needing migration: ${needsMigration.length}`);

  if (needsMigration.length > 0) {
    console.log('\n🔧 FILES TO MIGRATE:');
    needsMigration.forEach(file => {
      console.log(`  ${file.filePath} (${file.inlineStyles} inline styles)`);
    });

    console.log('\n⚡ PERFORMANCE IMPACT:');
    console.log(`• ${totalInlineStyles} style objects created per render`);
    console.log(`• ~${totalInlineStyles * 50} bytes of unnecessary JavaScript`);
    console.log(`• Missing CSS caching benefits`);
  } else {
    console.log('\n✅ All components are optimized!');
  }
} catch (error) {
  console.error('Error:', error.message);
}
