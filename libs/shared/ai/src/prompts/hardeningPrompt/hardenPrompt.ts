/**
 * Function to harden prompts by enclosing them in guillemets to prevent injection attacks
 * This is a token-efficient approach that maintains security
 *
 * @param prompt - The string to be hardened against prompt injection
 * @returns String enclosed in security markers with escaped special characters
 */
export function hardenPrompt(prompt: string): string {
  if (prompt == null) return ''

  // Escape special characters to prevent breaking out of markers
  const escaped = prompt
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/`/g, '\\`') // Escape backticks
    .replace(/«/g, '\\u00AB') // Escape opening guillemet
    .replace(/»/g, '\\u00BB') // Escape closing guillemet

  // Use guillemets (angle quotes) as boundary markers
  return `«${escaped}»`
}
