#!/usr/bin/env node

import { readFileSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';

// This script adds the shebang line to bin.js after TypeScript compilation
// and makes the file executable

const binFilePath = join(process.cwd(), 'dist', 'bin.js');

try {
  const content = readFileSync(binFilePath, 'utf8');
  
  // Only add shebang if it doesn't already exist
  if (!content.startsWith('#!/usr/bin/env node')) {
    const newContent = `#!/usr/bin/env node\n${content}`;
    writeFileSync(binFilePath, newContent);
    console.log('Added shebang to bin.js');
  }
  
  // Make the file executable (chmod +x)
  chmodSync(binFilePath, '755');
  console.log('Made bin.js executable');
} catch (error) {
  console.error('Error fixing shebangs:', error);
  process.exit(1);
} 