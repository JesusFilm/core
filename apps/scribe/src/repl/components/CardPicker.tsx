import { Box, Text, useInput } from 'ink'
import { type ReactElement, useEffect, useMemo, useState } from 'react'

import type { JourneySimpleCard } from '../../tools/journey/types'
import type { CardsLoadState } from '../state/types'

interface CardPickerProps {
  cards: CardsLoadState
  activeCard: JourneySimpleCard | null
  onSelect: (card: JourneySimpleCard) => void
  onCancel: () => void
}

const MAX_VISIBLE = 10

export function CardPicker({
  cards,
  activeCard,
  onSelect,
  onCancel
}: CardPickerProps): ReactElement {
  const [filter, setFilter] = useState('')
  const [index, setIndex] = useState(0)

  const list = useMemo(() => {
    if (cards.status !== 'loaded') return [] as JourneySimpleCard[]
    return cards.cards
  }, [cards])

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    if (needle.length === 0) return list
    return list.filter(
      (card) =>
        card.id.toLowerCase().includes(needle) ||
        (card.heading?.toLowerCase().includes(needle) ?? false) ||
        (card.text?.toLowerCase().includes(needle) ?? false)
    )
  }, [filter, list])

  useEffect(() => {
    if (index >= filtered.length && filtered.length > 0) setIndex(0)
  }, [filtered.length, index])

  useInput((input, key) => {
    if (key.escape) {
      onCancel()
      return
    }
    if (cards.status !== 'loaded') return
    if (key.return) {
      const choice = filtered[index]
      if (choice != null) onSelect(choice)
      return
    }
    if (key.upArrow) {
      if (filtered.length === 0) return
      setIndex((i) => (i - 1 + filtered.length) % filtered.length)
      return
    }
    if (key.downArrow) {
      if (filtered.length === 0) return
      setIndex((i) => (i + 1) % filtered.length)
      return
    }
    if (key.backspace || key.delete) {
      setFilter((value) => value.slice(0, -1))
      return
    }
    if (key.ctrl || key.meta || input.length === 0) return
    setFilter((value) => value + input)
  })

  if (cards.status === 'loading') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text color="gray">Loading cards…</Text>
      </Box>
    )
  }

  if (cards.status === 'error') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="red" paddingX={1}>
        <Text color="red">Could not load cards: {cards.message}</Text>
        <Text color="gray">Esc to dismiss.</Text>
      </Box>
    )
  }

  if (cards.status === 'idle') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1}>
        <Text color="gray">No journey active. Run /journey first.</Text>
        <Text color="gray">Esc to dismiss.</Text>
      </Box>
    )
  }

  const visibleStart = computeWindowStart(index, filtered.length)
  const visible = filtered.slice(visibleStart, visibleStart + MAX_VISIBLE)

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Box>
        <Text bold>Select a card</Text>
        <Text color="gray">
          {' '}
          · {filtered.length} match{filtered.length === 1 ? '' : 'es'}
        </Text>
      </Box>
      <Box>
        <Text color="cyan">filter › </Text>
        <Text>{filter}</Text>
        <Text color="gray">{filter.length === 0 ? 'type to filter…' : ''}</Text>
      </Box>
      {filtered.length === 0 ? (
        <Text color="gray">No cards match.</Text>
      ) : (
        visible.map((card, i) => {
          const absoluteIndex = visibleStart + i
          const selected = absoluteIndex === index
          const isActive = activeCard?.id === card.id
          return (
            <CardRow
              key={card.id}
              card={card}
              selected={selected}
              isActive={isActive}
            />
          )
        })
      )}
      {filtered.length > MAX_VISIBLE ? (
        <Text color="gray">
          showing {visibleStart + 1}–{Math.min(visibleStart + MAX_VISIBLE, filtered.length)} of {filtered.length}
        </Text>
      ) : null}
      <Text color="gray">↑/↓ to move · Enter to select · Esc to cancel</Text>
    </Box>
  )
}

function CardRow({
  card,
  selected,
  isActive
}: {
  card: JourneySimpleCard
  selected: boolean
  isActive: boolean
}): ReactElement {
  const label = card.heading ?? card.text ?? '(no heading)'
  return (
    <Box>
      <Text color={selected ? 'cyan' : 'gray'}>{selected ? '› ' : '  '}</Text>
      <Text color="gray">{card.id}</Text>
      <Text> </Text>
      <Text bold={selected}>{truncate(label, 60)}</Text>
      {isActive ? <Text color="green"> (active)</Text> : null}
    </Box>
  )
}

function computeWindowStart(index: number, total: number): number {
  if (total <= MAX_VISIBLE) return 0
  const half = Math.floor(MAX_VISIBLE / 2)
  if (index < half) return 0
  if (index >= total - half) return total - MAX_VISIBLE
  return index - half
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

export function findCardByQuery(
  cards: JourneySimpleCard[],
  query: string
): JourneySimpleCard | null {
  const trimmed = query.trim()
  if (trimmed.length === 0) return null
  const exactId = cards.find((c) => c.id === trimmed)
  if (exactId != null) return exactId
  const lower = trimmed.toLowerCase()
  const exactHeading = cards.find((c) => c.heading?.toLowerCase() === lower)
  if (exactHeading != null) return exactHeading
  const matches = cards.filter(
    (c) =>
      c.id.toLowerCase().includes(lower) ||
      (c.heading?.toLowerCase().includes(lower) ?? false)
  )
  if (matches.length === 1) return matches[0]
  return null
}
