/**
 * Matches journey editor routes: `/journeys/:id` or `/journeys/:id/edit`.
 * AddJourneyButton → `/journeys/:id`; create-custom → `/journeys/:id/edit`.
 */
export const journeyEditorUrlRegex = /\/journeys\/[^/?#]+(\/edit)?/
