import { TEXT_CAPS } from '../../validation'

function truncate(value: string, max: number): string {
  const characters = [...value]
  return characters.length <= max ? value : characters.slice(0, max).join('')
}

/**
 * The default-language snapshot a journey-list item takes of its journey:
 * the journey's own title and description, cut to the caps an author's edit
 * is held to so a later save of the same text is always valid.
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
