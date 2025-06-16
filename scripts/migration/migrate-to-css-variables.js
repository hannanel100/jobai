const fs = require('fs');
const path = require('path');

// Define the CSS variable replacements
const replacements = [
  // Theme imports
  {
    from: /import { theme } from '@\/lib\/theme';\n/g,
    to: '// Removed theme import - using CSS variables instead\n',
  },

  // Primary button styles
  {
    from: /style=\{\{ backgroundColor: theme\.primary \}\}/g,
    to: '',
  },
  {
    from: /className="([^"]*?)text-white hover:opacity-90 transition-opacity"/g,
    to: 'className="$1bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200"',
  },

  // Outline button styles
  {
    from: /style=\{\{ borderColor: theme\.accent, color: theme\.accent \}\}/g,
    to: '',
  },
  {
    from: /className="([^"]*?)hover:opacity-80 transition-opacity"/g,
    to: 'className="$1border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200"',
  },

  // Ghost button styles
  {
    from: /style=\{\{ color: theme\.accent \}\}/g,
    to: '',
  },
  {
    from: /className="([^"]*?)hover:opacity-80 transition-opacity" style=\{\{ color: theme\.accent \}\}/g,
    to: 'className="$1text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 transition-colors duration-200"',
  },

  // Error/destructive styles
  {
    from: /style=\{\{ backgroundColor: theme\.error \}\}/g,
    to: '',
  },
  {
    from: /className="([^"]*?)text-white hover:opacity-90 transition-opacity" style=\{\{ backgroundColor: theme\.error \}\}/g,
    to: 'className="$1bg-[var(--theme-error)] hover:bg-red-700 text-white transition-colors duration-200"',
  },

  // Secondary styles
  {
    from: /style=\{\{ backgroundColor: theme\.secondary \}\}/g,
    to: '',
  },
  {
    from: /className="([^"]*?)text-white hover:opacity-90 transition-opacity" style=\{\{ backgroundColor: theme\.secondary \}\}/g,
    to: 'className="$1bg-[var(--theme-secondary)] hover:bg-[var(--theme-accent)] text-white transition-colors duration-200"',
  },

  // Complex conditional styles need manual handling
  {
    from: /style=\{\{ backgroundColor: showJobInput \? theme\.secondary : theme\.primary \}\}/g,
    to: '',
  },
];

// Files to process
const filesToProcess = [
  'src/components/resumes/resume-content-viewer.tsx',
  'src/components/resumes/resume-detail-client.tsx',
  'src/components/resumes/resume-list.tsx',
  'src/components/resumes/resume-upload.tsx',
  'src/components/layout/mobile-nav.tsx',
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Apply replacements
    replacements.forEach(replacement => {
      const originalContent = content;
      content = content.replace(replacement.from, replacement.to);
      if (content !== originalContent) {
        changed = true;
      }
    });

    // Clean up empty style attributes
    content = content.replace(/\s+style=\{\{\s*\}\}/g, '');

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⭕ No changes: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🔄 Processing files for CSS variables migration...\n');

filesToProcess.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✨ CSS variables migration complete!');
console.log('📝 Note: Complex conditional styles may need manual review.');
console.log('🧪 Run: node check-inline-styles.js to verify results.');
