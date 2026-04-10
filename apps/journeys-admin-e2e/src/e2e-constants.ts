/**
 * Matches journey editor routes: `/journeys/:id` or `/journeys/:id/edit` as the
 * full path (optional `?` / `#` only). Does not match longer paths like `/journeys/:id/foo`.
 */
export const journeyEditorUrlRegex =
  /\/journeys\/[^/?#]+(?:\/edit)?\/?(?=[?#]|$)/
