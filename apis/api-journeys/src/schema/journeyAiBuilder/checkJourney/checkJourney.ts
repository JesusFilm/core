import type { ContentItem, Journey, JourneyAction } from '../journeySchema'

import { youTubeId } from './youTubeId'

export interface CheckResult {
  /** One line each, naming the step and item, with a fix hint. Sent back to the builder's repair round. */
  errors: string[]
  /** Reported but never block the journey. */
  warnings: string[]
}

/**
 * Checks the rules the schema cannot hold because they need the whole
 * journey (ENG-3767 "Rules: schema or checker"). Assumes the journey already
 * passed `journeySchema`.
 */
export function checkJourney(journey: Journey): CheckResult {
  const errors: string[] = []
  const warnings: string[] = []
  const stepNames = journey.steps.map((step) => step.name)
  const stepList = stepNames.join(', ')

  const seen = new Set<string>()
  function claimName(name: string, where: string): void {
    if (seen.has(name)) {
      errors.push(
        `${where}: name \`${name}\` is used more than once. Names must be unique across the journey.`
      )
      return
    }
    seen.add(name)
  }

  const linkedSteps = new Set<string>()
  function checkAction(action: JourneyAction, where: string): void {
    if ('goTo' in action) {
      linkedSteps.add(action.goTo)
      if (!stepNames.includes(action.goTo))
        errors.push(
          `${where}: goTo \`${action.goTo}\` doesn't exist. Use one of: ${stepList}.`
        )
      return
    }
    if (!isHttpUrl(action.url))
      errors.push(
        `${where}: url \`${action.url}\` must start with http:// or https://.`
      )
  }

  journey.steps.forEach((step, index) => {
    const stepWhere = `step \`${step.name}\``
    claimName(step.name, stepWhere)
    claimName(step.card.name, `${stepWhere}, card \`${step.card.name}\``)

    if (step.next != null) {
      linkedSteps.add(step.next)
      if (!stepNames.includes(step.next))
        errors.push(
          `${stepWhere}: next \`${step.next}\` doesn't exist. Use one of: ${stepList}.`
        )
    }

    const content = step.card.content
    content.forEach((item, itemIndex) => {
      const where = `${stepWhere}, item \`${item.name}\``
      claimName(item.name, where)
      checkItem(item, where, itemIndex)
    })

    const hasVideo = content.some((item) => item.type === 'video')
    if (hasVideo && content.length > 1)
      errors.push(
        `${stepWhere}: a card with a video must hold only the video. Move the other items to another step.`
      )

    const isLast = index === journey.steps.length - 1
    const hasWayForward =
      step.next != null ||
      content.some(
        (item) =>
          item.type === 'button' || item.type === 'poll' || item.type === 'video'
      )
    if (!isLast && !hasWayForward)
      errors.push(
        `${stepWhere}: has no way forward. Add a button or poll, or set next.`
      )

    function checkItem(
      item: ContentItem,
      where: string,
      itemIndex: number
    ): void {
      switch (item.type) {
        case 'button':
          checkAction(item.action, where)
          return
        case 'poll':
          item.options.forEach((option) => {
            const optionWhere = `${where}, option \`${option.name}\``
            claimName(option.name, optionWhere)
            checkAction(option.action, optionWhere)
          })
          return
        case 'multiselect':
          item.options.forEach((option) =>
            claimName(option.name, `${where}, option \`${option.name}\``)
          )
          if (item.min != null && item.max != null && item.min > item.max)
            errors.push(`${where}: min must not be more than max.`)
          if (item.max != null && item.max > item.options.length)
            errors.push(
              `${where}: max is more than the number of options (${item.options.length}).`
            )
          checkFollowedByButton(where, itemIndex, 'multiselect')
          return
        case 'textResponse':
          checkFollowedByButton(where, itemIndex, 'text response')
          return
        case 'video':
          if (youTubeId(item.url) == null)
            errors.push(
              `${where}: \`${item.url}\` is not a YouTube video link. Only YouTube videos are supported.`
            )
          if (
            item.startAt != null &&
            item.endAt != null &&
            item.startAt >= item.endAt
          )
            errors.push(`${where}: startAt must be before endAt.`)
          return
        default:
          return
      }
    }

    function checkFollowedByButton(
      where: string,
      itemIndex: number,
      label: string
    ): void {
      const followed = content
        .slice(itemIndex + 1)
        .some((item) => item.type === 'button')
      if (!followed)
        errors.push(
          `${where}: a ${label} must be followed by a button on the same card.`
        )
    }
  })

  journey.steps.slice(1).forEach((step) => {
    if (!linkedSteps.has(step.name))
      warnings.push(`step \`${step.name}\`: nothing links to it.`)
  })

  return { errors, warnings }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
