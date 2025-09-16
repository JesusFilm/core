module.exports = {
  pattern:
    /^(\(HEAD detached at pull\/[0-9]+\/merge\)|(00-00-RB-.*)|stage|main|([0-9]{2}-[0-9]{2}-[A-Z]{2}-(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)-[a-z0-9-]+[a-z0-9])|(feature\/[0-9]{2}-[0-9]{2}-[A-Z]{2}-[a-z0-9-]+[a-z0-9])|[a-z0-9]{3,4}-[0-9]+-[a-z0-9-]+|[a-z]+\/[a-z0-9]{3,4}-[0-9]+-[a-z0-9-]+|(cursor\/.*))$/,
  errorMsg:
    'Your branch does not match the naming convention (https://github.com/JesusFilm/core/wiki/Repository-Best-Practice#naming-your-branch)'
}
