import type { JourneySimple, JourneySimpleCard } from './types'

export interface CardChange {
  path: string
  before: unknown
  after: unknown
}

export interface JourneyDiff {
  title: { before: string | null; after: string | null } | null
  description: { before: string | null; after: string | null } | null
  cards: {
    added: Array<{ id: string; summary: string }>
    removed: Array<{ id: string; summary: string }>
    changed: Array<{ id: string; changes: CardChange[] }>
  }
}

function indexCards(journey: JourneySimple): Map<string, JourneySimpleCard> {
  const map = new Map<string, JourneySimpleCard>()
  if (!Array.isArray(journey?.cards)) return map
  for (const card of journey.cards) {
    if (typeof card?.id === 'string') map.set(card.id, card)
  }
  return map
}

function summarize(card: JourneySimpleCard): string {
  if (card.video != null) {
    return `video card → ${card.defaultNextCard ?? '(none)'}`
  }
  return (card.heading ?? card.text ?? '').slice(0, 80)
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ao = a as Record<string, unknown>
    const bo = b as Record<string, unknown>
    const ak = Object.keys(ao).sort()
    const bk = Object.keys(bo).sort()
    if (ak.length !== bk.length) return false
    for (let i = 0; i < ak.length; i += 1) {
      if (ak[i] !== bk[i]) return false
      if (!deepEqual(ao[ak[i]], bo[bk[i]])) return false
    }
    return true
  }
  return false
}

function diffCard(
  before: JourneySimpleCard,
  after: JourneySimpleCard
): CardChange[] {
  const changes: CardChange[] = []
  const beforeRecord = before as unknown as Record<string, unknown>
  const afterRecord = after as unknown as Record<string, unknown>
  const keys = new Set<string>([
    ...Object.keys(beforeRecord),
    ...Object.keys(afterRecord)
  ])
  for (const key of keys) {
    const a = beforeRecord[key]
    const b = afterRecord[key]
    if (!deepEqual(a, b)) {
      changes.push({ path: key, before: a ?? null, after: b ?? null })
    }
  }
  return changes
}

export function diffJourney(
  before: JourneySimple,
  after: JourneySimple
): JourneyDiff {
  const beforeCards = indexCards(before)
  const afterCards = indexCards(after)

  const added: JourneyDiff['cards']['added'] = []
  const removed: JourneyDiff['cards']['removed'] = []
  const changed: JourneyDiff['cards']['changed'] = []

  for (const [id, card] of afterCards) {
    if (!beforeCards.has(id)) added.push({ id, summary: summarize(card) })
  }
  for (const [id, card] of beforeCards) {
    if (!afterCards.has(id)) removed.push({ id, summary: summarize(card) })
  }
  for (const [id, beforeCard] of beforeCards) {
    const afterCard = afterCards.get(id)
    if (afterCard == null) continue
    const cardChanges = diffCard(beforeCard, afterCard)
    if (cardChanges.length > 0) changed.push({ id, changes: cardChanges })
  }

  const titleDiff =
    (before?.title ?? null) === (after?.title ?? null)
      ? null
      : { before: before?.title ?? null, after: after?.title ?? null }
  const descriptionDiff =
    (before?.description ?? null) === (after?.description ?? null)
      ? null
      : { before: before?.description ?? null, after: after?.description ?? null }

  return {
    title: titleDiff,
    description: descriptionDiff,
    cards: { added, removed, changed }
  }
}
