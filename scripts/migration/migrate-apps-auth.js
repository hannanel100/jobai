const fs = require('fs');
const path = require('path');

// Enhanced replacements for application components
const replacements = [
  // Theme imports
  {
    from: /import { theme } from '@\/lib\/theme';\n/g,
    to: '// Removed theme import - using CSS variables instead\n',
  },

  // Primary button styles with various text combinations
  {
    from: /style=\{\{ backgroundColor: theme\.primary \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ backgroundColor: theme\.primary \}\}/g,
    to: 'className="$1bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200"',
  },

  // Outline/border styles
  {
    from: /style=\{\{ borderColor: theme\.accent, color: theme\.accent \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ borderColor: theme\.accent, color: theme\.accent \}\}/g,
    to: 'className="$1border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200"',
  },

  // Error/destructive styles
  {
    from: /style=\{\{ backgroundColor: theme\.error \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ backgroundColor: theme\.error \}\}/g,
    to: 'className="$1bg-[var(--theme-error)] hover:bg-red-700 text-white transition-colors duration-200"',
  },

  // Secondary background
  {
    from: /style=\{\{ backgroundColor: theme\.secondary \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ backgroundColor: theme\.secondary \}\}/g,
    to: 'className="$1bg-[var(--theme-secondary)] hover:bg-[var(--theme-accent)] text-white transition-colors duration-200"',
  },

  // Ghost/color only styles
  {
    from: /style=\{\{ color: theme\.accent \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ color: theme\.accent \}\}/g,
    to: 'className="$1text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 transition-colors duration-200"',
  },

  // Success styles
  {
    from: /style=\{\{ backgroundColor: theme\.success \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ backgroundColor: theme\.success \}\}/g,
    to: 'className="$1bg-[var(--theme-success)] hover:bg-green-700 text-white transition-colors duration-200"',
  },

  // Warning styles
  {
    from: /style=\{\{ backgroundColor: theme\.warning \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ backgroundColor: theme\.warning \}\}/g,
    to: 'className="$1bg-[var(--theme-warning)] hover:bg-orange-700 text-white transition-colors duration-200"',
  },

  // Surface/background styles
  {
    from: /style=\{\{ backgroundColor: theme\.surface \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ backgroundColor: theme\.surface \}\}/g,
    to: 'className="$1bg-[var(--theme-surface)] transition-colors duration-200"',
  },

  // Text color styles
  {
    from: /style=\{\{ color: theme\.text \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ color: theme\.text \}\}/g,
    to: 'className="$1text-[var(--theme-text)]"',
  },

  // Border styles
  {
    from: /style=\{\{ borderColor: theme\.border \}\}\s*/g,
    to: '',
  },
  {
    from: /className="([^"]*?)"\s+style=\{\{ borderColor: theme\.border \}\}/g,
    to: 'className="$1border-[var(--theme-border)]"',
  },
];

// Files to process
const filesToProcess = [
  'src/components/applications/application-form.tsx',
  'src/components/applications/applications-list.tsx',
  'src/components/applications/edit-application-form.tsx',
  'src/components/auth/login-form.tsx',
  'src/components/auth/register-form.tsx',
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

    // Clean up empty style attributes and duplicate classes
    content = content.replace(/\s+style=\{\{\s*\}\}/g, '');
    content = content.replace(/className="([^"]*)\s+"/g, 'className="$1"');

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

console.log('🔄 Processing Application and Auth components...\n');

filesToProcess.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✨ Application components migration complete!');
console.log('🧪 Run: node check-inline-styles.js to verify results.');
