const fs = require('fs')

/**
 * Validates that the extract `input` globs match at least one source file, then
 * returns them unchanged so it can wrap an `input` array inline.
 *
 * Guards against the silent zero-key extraction in NES-1723: the nx
 * `extract-translations` target runs from the workspace root, so cwd-relative
 * globs (`src/**`) matched nothing and extraction reported success while
 * updating no catalog. A 0-file match now fails the target loudly instead.
 *
 * Only runs during `i18next-cli extract` (not status/types/lint), and uses the
 * Node built-in glob — no extra dependencies.
 *
 * @param {string[]} globs input globs, relative to the workspace root
 * @returns {string[]} the same globs
 */
module.exports = function assertExtractInput(globs) {
  // The subcommand is argv[2] (e.g. `i18next-cli extract --config ...`).
  if (process.argv[2] !== 'extract') return globs

  // fs.globSync is experimental in Node 22 and emits a one-time warning;
  // silence it only for the duration of these synchronous calls.
  const originalEmitWarning = process.emitWarning
  process.emitWarning = () => {}
  let matchCount = 0
  try {
    for (const pattern of globs) {
      matchCount += fs.globSync(pattern).length
    }
  } finally {
    process.emitWarning = originalEmitWarning
  }

  if (matchCount === 0) {
    throw new Error(
      `i18next extract: input globs matched 0 source files from cwd "${process.cwd()}".\n` +
        'Globs must be relative to the workspace root. Received:\n' +
        globs.map((glob) => `  - ${glob}`).join('\n') +
        '\nSee NES-1723.'
    )
  }

  return globs
}
