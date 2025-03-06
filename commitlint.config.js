module.exports = {
  extends: ['@vidavidorra/commitlint-config'],
  defaultIgnores: true,
  ignores: [
    (commit) => {
      // Get the current branch name
      const branchName = require('child_process')
        .execSync('git rev-parse --abbrev-ref HEAD')
        .toString()
        .trim()

      // Only run commitlint on the main branch
      return branchName !== 'main'
    }
  ]
}
