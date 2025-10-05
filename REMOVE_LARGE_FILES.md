# Removing Large Files from Git History

## Issue
The file `client/node_modules/.cache/default-development/5.pack` (61.38 MB) has been committed to the repository and is causing GitHub warnings about large files.

## Solution
Since this is a cache file that should never have been committed, we need to remove it from the Git history.

## Steps to Remove Large Files

### Option 1: Remove the file from the most recent commit (if it was just added)

If the large file was added in the most recent commit:

```bash
# Remove the file from the staging area
git rm --cached client/node_modules/.cache/default-development/5.pack

# Commit the removal
git commit --amend -C HEAD

# Force push to update the remote repository
git push --force-with-lease
```

### Option 2: Remove the file from entire Git history (if it's in multiple commits)

If the file has been in the repository for a while, you'll need to use git filter-branch or BFG Repo-Cleaner:

#### Using git filter-branch (built-in Git command):

```bash
# Remove the file from entire history
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch client/node_modules/.cache/default-development/5.pack' \
--prune-empty --tag-name-filter cat -- --all

# Force push to update all remote branches
git push --force --all

# Clean up
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now
```

#### Using BFG Repo-Cleaner (recommended for large repositories):

1. Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
2. Run the following command:
```bash
java -jar bfg.jar --delete-files 5.pack
```

3. Then run:
```bash
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

4. Force push:
```bash
git push --force --all
```

## Prevention

The updated `.gitignore` file should prevent similar issues in the future. Additionally:

1. Always check `git status` before committing to see what files are being added
2. Regularly review the `.gitignore` file to ensure it covers all generated files
3. Consider adding a pre-commit hook to warn about large files

## Important Notes

- These operations modify Git history and should be done carefully
- Other collaborators will need to re-clone the repository after history is modified
- Always backup your repository before performing these operations
- The `--force` flag is necessary but should be used with caution

## Support

For any issues with removing large files from the repository, please contact the development team.