import type {
  JourneyIssue,
  JourneySimple,
  JourneySimpleCard,
  JourneyValidationResult
} from './types'

const FORBIDDEN_VIDEO_FIELDS: ReadonlyArray<keyof JourneySimpleCard> = [
  'heading',
  'text',
  'button',
  'poll',
  'image',
  'backgroundImage'
]

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

interface IssueBuilder {
  push(issue: Omit<JourneyIssue, 'id'>): void
  toArray(): JourneyIssue[]
}

function createIssueBuilder(): IssueBuilder {
  const issues: JourneyIssue[] = []
  let counter = 0
  return {
    push(issue) {
      counter += 1
      issues.push({ ...issue, id: `${issue.code}-${counter}` })
    },
    toArray() {
      return issues
    }
  }
}

export function validateJourney(input: unknown): JourneyValidationResult {
  const builder = createIssueBuilder()

  if (!isObject(input) || !Array.isArray((input as { cards?: unknown }).cards)) {
    builder.push({
      severity: 'error',
      code: 'E001',
      message:
        'Journey JSON is not a valid JourneySimple document: missing top-level "cards" array.'
    })
    return {
      summary: {
        errorCount: 1,
        warningCount: 0,
        totalCards: 0,
        entryCardId: null
      },
      issues: builder.toArray()
    }
  }

  const journey = input as unknown as JourneySimple
  const cards = journey.cards

  const idCounts = new Map<string, number>()
  for (const card of cards) {
    if (typeof card?.id !== 'string') continue
    idCounts.set(card.id, (idCounts.get(card.id) ?? 0) + 1)
  }

  for (const [id, count] of idCounts) {
    if (count > 1) {
      builder.push({
        severity: 'error',
        code: 'E002',
        cardId: id,
        message: `Card id "${id}" appears ${count} times. Card ids must be unique.`
      })
    }
  }

  const idSet = new Set(idCounts.keys())
  const adjacency = new Map<string, Set<string>>()
  const entryId = cards[0]?.id ?? null

  for (const card of cards) {
    if (typeof card?.id !== 'string') continue
    const targets = new Set<string>()

    const recordTarget = (target: unknown, label: string): void => {
      if (typeof target !== 'string') return
      if (!idSet.has(target)) {
        builder.push({
          severity: 'error',
          code: 'E003',
          cardId: card.id,
          message: `${label} on card "${card.id}" points at unknown card "${target}".`
        })
        return
      }
      targets.add(target)
    }

    const recordNavObject = (
      obj: unknown,
      kind: string,
      index?: number
    ): void => {
      if (!isObject(obj)) return
      const hasNext =
        typeof obj.nextCard === 'string' && obj.nextCard.length > 0
      const hasUrl = typeof obj.url === 'string' && obj.url.length > 0
      if (hasNext === hasUrl) {
        builder.push({
          severity: 'error',
          code: 'E005',
          cardId: card.id,
          message:
            hasNext && hasUrl
              ? `${kind}${index != null ? `[${index}]` : ''} on card "${card.id}" has both nextCard and url. Exactly one is required.`
              : `${kind}${index != null ? `[${index}]` : ''} on card "${card.id}" has neither nextCard nor url. Exactly one is required.`
        })
      }
      if (hasNext) recordTarget(obj.nextCard, `${kind} nextCard`)
    }

    if (isObject(card.video)) {
      for (const forbidden of FORBIDDEN_VIDEO_FIELDS) {
        if (card[forbidden] !== undefined) {
          builder.push({
            severity: 'error',
            code: 'E006',
            cardId: card.id,
            message: `Video card "${card.id}" has forbidden field "${String(forbidden)}". Video cards must have only id, video, and defaultNextCard.`
          })
        }
      }
      if (typeof card.defaultNextCard !== 'string') {
        builder.push({
          severity: 'error',
          code: 'E007',
          cardId: card.id,
          message: `Video card "${card.id}" is missing required defaultNextCard.`
        })
      } else {
        recordTarget(card.defaultNextCard, 'defaultNextCard')
      }

      const startAt = card.video.startAt
      const endAt = card.video.endAt
      if (
        typeof startAt === 'number' &&
        typeof endAt === 'number' &&
        endAt <= startAt
      ) {
        builder.push({
          severity: 'error',
          code: 'E008',
          cardId: card.id,
          message: `Video on card "${card.id}" has endAt (${endAt}) <= startAt (${startAt}).`
        })
      }
    } else {
      if (isObject(card.button)) recordNavObject(card.button, 'button')
      if (Array.isArray(card.poll)) {
        card.poll.forEach((option, index) =>
          recordNavObject(option, 'poll', index)
        )
      }
      if (typeof card.defaultNextCard === 'string') {
        recordTarget(card.defaultNextCard, 'defaultNextCard')
      }

      const hasButton = isObject(card.button)
      const hasPoll = Array.isArray(card.poll) && card.poll.length > 0
      const hasDefault = typeof card.defaultNextCard === 'string'
      if (!hasButton && !hasPoll && !hasDefault) {
        builder.push({
          severity: 'error',
          code: 'E004',
          cardId: card.id,
          message: `Card "${card.id}" has no navigation. Add a button, poll, or defaultNextCard.`
        })
      }

      const hasContent =
        typeof card.heading === 'string' ||
        typeof card.text === 'string' ||
        hasButton ||
        hasPoll ||
        isObject(card.image) ||
        isObject(card.backgroundImage)
      if (!hasContent) {
        builder.push({
          severity: 'warning',
          code: 'W103',
          cardId: card.id,
          message: `Card "${card.id}" has no visible content (no heading, text, button, poll, or image).`
        })
      }
    }

    if (targets.size === 1 && targets.has(card.id)) {
      builder.push({
        severity: 'warning',
        code: 'W102',
        cardId: card.id,
        message: `Card "${card.id}" only navigates to itself. This will trap the user.`
      })
    }

    adjacency.set(card.id, targets)
  }

  const reachable = new Set<string>()
  if (entryId != null) reachable.add(entryId)
  const queue = entryId != null ? [entryId] : []
  while (queue.length > 0) {
    const next = queue.shift()
    if (next == null) break
    const targets = adjacency.get(next) ?? new Set<string>()
    for (const target of targets) {
      if (!reachable.has(target)) {
        reachable.add(target)
        queue.push(target)
      }
    }
  }

  for (const card of cards) {
    if (typeof card?.id !== 'string') continue
    if (!reachable.has(card.id)) {
      builder.push({
        severity: 'warning',
        code: 'W101',
        cardId: card.id,
        message: `Card "${card.id}" is not reachable from the entry card "${entryId ?? '(none)'}".`
      })
    }
  }

  const positionMap = new Map<string, string>()
  for (const card of cards) {
    if (typeof card?.id !== 'string') continue
    if (typeof card.x !== 'number' || typeof card.y !== 'number') continue
    const key = `${card.x},${card.y}`
    const existing = positionMap.get(key)
    if (existing != null && existing !== card.id) {
      builder.push({
        severity: 'warning',
        code: 'W104',
        cardId: card.id,
        message: `Cards "${existing}" and "${card.id}" share identical position (${card.x}, ${card.y}).`
      })
    } else {
      positionMap.set(key, card.id)
    }
  }

  const issues = builder.toArray()
  return {
    summary: {
      errorCount: issues.filter((issue) => issue.severity === 'error').length,
      warningCount: issues.filter((issue) => issue.severity === 'warning').length,
      totalCards: cards.length,
      entryCardId: entryId
    },
    issues
  }
}
