module.exports = {
  pattern:
    '^(dependabot/.*)|stage|([0-9]{2}-[0-9]{2}-[A-Z]{2}-(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)-[a-z0-9-]+[a-z0-9])$',
  errorMsg:
    'Your branch does not match the naming convention (https://github.com/JesusFilm/core/wiki/Repository-Best-Practice#naming-your-branch)'
}
