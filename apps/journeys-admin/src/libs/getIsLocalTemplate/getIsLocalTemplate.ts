/**
 * A local template is a journey that has been published as a template by a
 * regular team (not the global "jfp-team" gallery owner). Local templates are
 * editable in-place and not surfaced in the public gallery.
 */
export function getIsLocalTemplate(
  journey?: {
    template?: boolean | null
    team?: { id?: string | null } | null
  } | null
): boolean {
  return journey?.template === true && journey?.team?.id !== 'jfp-team'
}
