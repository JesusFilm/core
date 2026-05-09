import { Box, Text, useInput } from 'ink'
import { type ReactElement, useEffect, useMemo, useState } from 'react'

import type { JourneyListItem } from '../../tools/journey/api'
import type { JourneysLoadState } from '../state/types'

interface JourneyPickerProps {
  journeys: JourneysLoadState
  activeJourney: JourneyListItem | null
  onSelect: (journey: JourneyListItem) => void
  onCancel: () => void
}

const MAX_VISIBLE = 8

const STATUS_COLORS: Record<JourneyListItem['status'], string> = {
  draft: 'yellow',
  published: 'green',
  archived: 'gray',
  trashed: 'red',
  deleted: 'red'
}

export function JourneyPicker({
  journeys,
  activeJourney,
  onSelect,
  onCancel
}: JourneyPickerProps): ReactElement {
  const [filter, setFilter] = useState('')
  const [index, setIndex] = useState(0)

  const sortedJourneys = useMemo(() => {
    if (journeys.status !== 'loaded') return [] as JourneyListItem[]
    return [...journeys.journeys].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    )
  }, [journeys])

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    if (needle.length === 0) return sortedJourneys
    return sortedJourneys.filter(
      (j) =>
        j.title.toLowerCase().includes(needle) ||
        j.slug.toLowerCase().includes(needle) ||
        j.id === filter.trim()
    )
  }, [filter, sortedJourneys])

  // Keep the highlighted index in range as the filtered list shrinks/grows.
  useEffect(() => {
    if (index >= filtered.length && filtered.length > 0) setIndex(0)
  }, [filtered.length, index])

  useInput((input, key) => {
    if (key.escape) {
      onCancel()
      return
    }
    if (journeys.status !== 'loaded') return
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

  if (journeys.status === 'loading') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text color="gray">Loading journeys…</Text>
      </Box>
    )
  }

  if (journeys.status === 'error') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="red" paddingX={1}>
        <Text color="red">Could not load journeys: {journeys.message}</Text>
        <Text color="gray">Esc to dismiss.</Text>
      </Box>
    )
  }

  const visibleStart = computeWindowStart(index, filtered.length)
  const visible = filtered.slice(visibleStart, visibleStart + MAX_VISIBLE)

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Box>
        <Text bold>Select a journey</Text>
        <Text color="gray"> · {filtered.length} match{filtered.length === 1 ? '' : 'es'}</Text>
      </Box>
      <Box>
        <Text color="cyan">filter › </Text>
        <Text>{filter}</Text>
        <Text color="gray">{filter.length === 0 ? 'type to filter…' : ''}</Text>
      </Box>
      {filtered.length === 0 ? (
        <Text color="gray">No journeys match.</Text>
      ) : (
        visible.map((journey, i) => {
          const absoluteIndex = visibleStart + i
          const selected = absoluteIndex === index
          const isActive = activeJourney?.id === journey.id
          return (
            <JourneyRow
              key={journey.id}
              journey={journey}
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

function JourneyRow({
  journey,
  selected,
  isActive
}: {
  journey: JourneyListItem
  selected: boolean
  isActive: boolean
}): ReactElement {
  const statusColor = STATUS_COLORS[journey.status] ?? 'gray'
  return (
    <Box>
      <Text color={selected ? 'cyan' : 'gray'}>{selected ? '› ' : '  '}</Text>
      <Text color={statusColor}>[{journey.status[0].toUpperCase()}]</Text>
      <Text> </Text>
      <Text bold={selected}>{truncate(journey.title, 50)}</Text>
      <Text color="gray"> · {journey.slug}</Text>
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

export function findJourneyByQuery(
  journeys: JourneyListItem[],
  query: string
): JourneyListItem | null {
  const trimmed = query.trim()
  if (trimmed.length === 0) return null
  const exactId = journeys.find((j) => j.id === trimmed)
  if (exactId != null) return exactId
  const exactSlug = journeys.find((j) => j.slug === trimmed)
  if (exactSlug != null) return exactSlug
  const lower = trimmed.toLowerCase()
  const exactTitle = journeys.find((j) => j.title.toLowerCase() === lower)
  if (exactTitle != null) return exactTitle
  // Fall back to a substring match — but only if it's unambiguous.
  const matches = journeys.filter(
    (j) =>
      j.title.toLowerCase().includes(lower) ||
      j.slug.toLowerCase().includes(lower)
  )
  if (matches.length === 1) return matches[0]
  return null
}
