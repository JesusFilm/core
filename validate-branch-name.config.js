module.exports = {
  pattern: new RegExp(
    '^(' +
      '\\(HEAD detached at pull\\/[0-9]+\\/merge\\)|' + // 1. Detached HEAD
      '(00-00-RB-.*)|' + // 2. Renovate Bot branches
      'stage|main|' + // 3. Stage and Main branches
      '([0-9]{2}-[0-9]{2}-[A-Z]{2}-(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)-[a-z0-9-]+[a-z0-9])|' + // 4. cycle followed by type and description
      '(feature\\/[0-9]{2}-[0-9]{2}-[A-Z]{2}-[a-z0-9-]+[a-z0-9])|' + // 5. Feature branches with cycle followed by description
      '[a-z0-9]{2,4}-[0-9]+-[a-z0-9-]+|' + // 6. prefix-number-description
      '[a-z]+\\/[a-z0-9]{2,4}-[0-9]+-[a-z0-9-]+|' + // 7. username/prefix-number-description
      '(cursor\\/.*)' + // 8. Cursor AI branches
      ')$'
  ),
  errorMsg:
    'Your branch does not match the naming convention (https://github.com/JesusFilm/core/wiki/Repository-Best-Practice#naming-your-branch)'
}
