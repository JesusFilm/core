/**
 * Checks `process.argv` for a boolean CLI flag (e.g. `--apply`), so a write
 * requires deliberate command-line intent rather than an environment
 * variable that can be left set from a previous invocation.
 */
export function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(`--${name}`)
}
