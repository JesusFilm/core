// Use the same globber i18next-cli itself uses to resolve `input`, so this
// guard matches files identically to extraction (and avoids Node's
// experimental `fs.globSync`).
const { globSync } = require('glob')

/**
 * Validates that the extract `input` globs match at least one source file, then
 * returns them unchanged so it can wrap an `input` array inline.
 *
 * Guards against the silent zero-key extraction in NES-1723: the nx
 * `extract-translations` target runs from the workspace root, so cwd-relative
 * globs (`src/**`) matched nothing and extraction reported success while
 * updating no catalog. A 0-file match now fails the target loudly instead.
 *
 * Only runs during `i18next-cli extract` (not status/types/lint).
 *
 * @param {string[]} globs input globs, relative to the workspace root
 * @returns {string[]} the same globs
 */
module.exports = function assertExtractInput(globs) {
  // i18next-cli places the subcommand at argv[2]: `i18next-cli <subcommand>
  // [options]`. If a future CLI version nests subcommands differently, update
  // this check — otherwise the guard would silently no-op.
  if (process.argv[2] !== 'extract') return globs

  const matchCount = globs.reduce(
    (count, pattern) => count + globSync(pattern).length,
    0
  )

  if (matchCount === 0) {
    throw new Error(
      `i18next extract: input globs matched 0 source files from cwd "${process.cwd()}".\n` +
        'Globs must be relative to the workspace root (the nx target runs ' +
        'there, not the project directory). Received:\n' +
        globs.map((glob) => `  - ${glob}`).join('\n') +
        '\nSee https://linear.app/jesus-film-project/issue/NES-1723'
    )
  }

  return globs
}
