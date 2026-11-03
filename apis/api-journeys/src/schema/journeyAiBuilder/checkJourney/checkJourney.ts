import type {
  ContentItem,
  Journey,
  JourneyAction,
  JourneyImage
} from '../journeySchema'
import { LIBRARY_VIDEOS } from '../libraryVideos/catalog'

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
  function checkAction(action: JourneyAction | undefined, where: string): void {
    if (action == null || 'none' in action) return
    if ('goTo' in action) {
      linkedSteps.add(action.goTo)
      if (!stepNames.includes(action.goTo))
        errors.push(
          `${where}: goTo \`${action.goTo}\` doesn't exist. Use one of: ${stepList}.`
        )
      return
    }
    if ('email' in action || 'phone' in action) return
    const url = 'chatUrl' in action ? action.chatUrl : action.url
    if (!isHttpUrl(url))
      errors.push(
        `${where}: url \`${url}\` must start with http:// or https://.`
      )
  }

  function checkVideo(
    video: NonNullable<Journey['steps'][number]['card']['backgroundVideo']>,
    where: string
  ): void {
    const sources = [
      video.url,
      video.libraryVideo,
      video.libraryVideoId,
      video.librarySearch,
      video.muxVideoId
    ].filter((value) => value != null && value !== '')
    if (sources.length !== 1)
      errors.push(
        `${where}: choose exactly one of url, libraryVideo, libraryVideoId, librarySearch or muxVideoId.`
      )
    if (video.url != null && youTubeId(video.url) == null)
      errors.push(
        `${where}: \`${video.url}\` is not a YouTube video link. Use a YouTube link or an approved libraryVideo.`
      )
    if (video.libraryVideo != null) {
      const duration = LIBRARY_VIDEOS[video.libraryVideo].duration
      if (
        (video.startAt ?? 0) >= duration ||
        (video.endAt ?? duration) > duration
      )
        errors.push(
          `${where}: clip must fit within the video's ${duration} seconds.`
        )
    }
    if (video.endAt != null && (video.startAt ?? 0) >= video.endAt)
      errors.push(`${where}: startAt must be before endAt.`)
    if (video.poster != null) checkImage(video.poster, `${where}, poster`)
  }

  function checkImage(image: JourneyImage, where: string): void {
    if (image.assetUrl != null) {
      if (!isHttpUrl(image.assetUrl))
        errors.push(`${where}: assetUrl must use http(s).`)
      return
    }
    if (!image.search?.trim())
      errors.push(`${where}: provide a stock search or an exact assetUrl.`)
  }

  journey.steps.forEach((step, index) => {
    const stepWhere = `step \`${step.name}\``
    claimName(step.name, stepWhere)
    claimName(step.card.name, `${stepWhere}, card \`${step.card.name}\``)
    if (step.card.backgroundImage != null)
      checkImage(step.card.backgroundImage, `${stepWhere}, background image`)

    if (step.next != null) {
      linkedSteps.add(step.next)
      if (!stepNames.includes(step.next))
        errors.push(
          `${stepWhere}: next \`${step.next}\` doesn't exist. Use one of: ${stepList}.`
        )
    }

    if (step.card.backgroundVideo != null) {
      if (step.card.backgroundImage != null)
        errors.push(
          `${stepWhere}: choose backgroundImage or backgroundVideo, not both.`
        )
      checkVideo(step.card.backgroundVideo, `${stepWhere}, background video`)
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
          item.type === 'button' ||
          item.type === 'poll' ||
          item.type === 'video'
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
        case 'signUp':
          checkAction(item.action, where)
          return
        case 'image':
          checkImage(item.image, where)
          return
        case 'text':
          if (item.variant == null && item.style == null)
            errors.push(`${where}: choose an editor text variant.`)
          return
        case 'spacer':
          if (item.spacing == null && item.size == null)
            errors.push(`${where}: provide spacing in pixels or a legacy size.`)
          return
        case 'poll':
          item.options.forEach((option) => {
            const optionWhere = `${where}, option \`${option.name}\``
            claimName(option.name, optionWhere)
            checkAction(option.action, optionWhere)
            if (option.image != null) checkImage(option.image, optionWhere)
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
          if (item.min != null && item.min > item.options.length)
            errors.push(
              `${where}: min is more than the number of options (${item.options.length}).`
            )
          checkFollowedByButton(where, itemIndex, 'multiselect')
          return
        case 'textResponse':
          if (item.routeId != null && item.integrationId == null)
            errors.push(
              `${where}: a route requires its existing integrationId.`
            )
          checkFollowedByButton(where, itemIndex, 'text response')
          return
        case 'video':
          checkVideo(item, where)
          checkAction(item.action, where)
          item.triggers?.forEach((trigger) => {
            claimName(trigger.name, `${where}, trigger`)
            checkAction(trigger.action, `${where}, trigger`)
            if (item.endAt != null && trigger.triggerStart > item.endAt)
              errors.push(`${where}: trigger starts after the clip ends.`)
          })
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
