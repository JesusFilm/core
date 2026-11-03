import { TEXT_CAPS, truncate } from '../../validation'

/**
 * The default-language snapshot a journey-list item or a Share Language takes
 * of its journey: the journey's own title and description, cut to the caps an
 * author's edit is held to so a later save of the same text is always valid.
 */
export function snapshotOf(journey: {
  title: string
  description: string | null
}): { title: string; description: string | null } {
  return {
    title: truncate(journey.title, TEXT_CAPS.journeyTitle),
    description:
      journey.description == null
        ? null
        : truncate(journey.description, TEXT_CAPS.journeyDescription)
  }
}
