// Script to set up Git hooks to prevent large files from being committed

const fs = require('fs');
const path = require('path');

// Create the hooks directory if it doesn't exist
const hooksDir = path.join(__dirname, '..', '..', '.git', 'hooks');
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

// Pre-commit hook to check for large files
const preCommitHook = `#!/bin/sh
# Pre-commit hook to prevent large files from being committed

# Check for files larger than 50MB
large_files=$(git diff --cached --name-only --diff-filter=AM | xargs ls -l 2>/dev/null | awk '$5 > 52428800 { print $9 " (" int($5/1024/1024) "MB)" }')

if [ -n "$large_files" ]; then
  echo "Error: Attempting to commit large files (>50MB):"
  echo "$large_files"
  echo ""
  echo "Please remove these files from the commit or add them to .gitignore"
  echo "To remove a file from staging: git rm --cached <file>"
  echo "To bypass this check (NOT RECOMMENDED): git commit --no-verify"
  exit 1
fi

# Check for node_modules being committed
if git diff --cached --name-only | grep -q "node_modules/"; then
  echo "Error: Attempting to commit node_modules directory"
  echo "This is not allowed as it contains generated files"
  echo "Please add node_modules to .gitignore or remove it from staging:"
  echo "git rm -r --cached node_modules"
  exit 1
fi

echo "Pre-commit checks passed"
exit 0
`;

// Write the pre-commit hook
const preCommitPath = path.join(hooksDir, 'pre-commit');
fs.writeFileSync(preCommitPath, preCommitHook);

// Make the hook executable (Unix-like systems)
try {
  fs.chmodSync(preCommitPath, '755');
  console.log('Git pre-commit hook installed successfully');
  console.log('This hook will prevent large files (>50MB) and node_modules from being committed');
} catch (err) {
  console.log('Git pre-commit hook installed but chmod failed (this is normal on Windows)');
  console.log('The hook will still work on Unix-like systems');
}

console.log('');
console.log('To manually run the hook checks:');
console.log('  cd .git/hooks');
console.log('  ./pre-commit');