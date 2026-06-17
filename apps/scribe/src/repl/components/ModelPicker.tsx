import { Box, Text, useInput } from 'ink'
import { type ReactElement, useEffect, useMemo, useState } from 'react'

import type { ProviderId } from '../../config/providers'
import type { ModelsLoadState } from '../state/types'

interface ModelPickerProps {
  activeModel: string | null
  provider: ProviderId
  models: ModelsLoadState
  onSelect: (model: string | null) => void
  onRefresh: () => void
  onCancel: () => void
}

interface CatalogEntry {
  kind: 'model'
  id: string
  label: string
  detail: string | null
}

interface DefaultEntry {
  kind: 'default'
}

interface OtherEntry {
  kind: 'other'
}

type Entry = CatalogEntry | DefaultEntry | OtherEntry

const VISIBLE_LIMIT = 8

export function ModelPicker({
  activeModel,
  provider,
  models,
  onSelect,
  onRefresh,
  onCancel
}: ModelPickerProps): ReactElement {
  const [filter, setFilter] = useState('')
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<'choose' | 'text'>('choose')
  const [customText, setCustomText] = useState(activeModel ?? '')

  const catalog = useMemo<CatalogEntry[]>(() => {
    if (models.status !== 'loaded') return []
    return models.models.map((m) => ({
      kind: 'model' as const,
      id: m.id,
      label: m.label != null && m.label.length > 0 ? m.label : m.id,
      detail: m.description != null && m.description.length > 0 ? m.description : null
    }))
  }, [models])

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    if (needle.length === 0) return catalog
    return catalog.filter(
      (entry) =>
        entry.id.toLowerCase().includes(needle) ||
        entry.label.toLowerCase().includes(needle)
    )
  }, [catalog, filter])

  const entries: Entry[] = useMemo(
    () => [...filtered, { kind: 'default' }, { kind: 'other' }],
    [filtered]
  )

  // Keep selection in bounds whenever the filter narrows the catalog or the
  // catalog reloads — without this, hitting Enter on a stale index would
  // either index into `undefined` or pick the wrong entry.
  useEffect(() => {
    if (index >= entries.length && entries.length > 0) {
      setIndex(entries.length - 1)
    }
  }, [entries.length, index])

  useInput((input, key) => {
    if (mode === 'text') {
      if (key.escape) {
        setMode('choose')
        return
      }
      if (key.return) {
        const trimmed = customText.trim()
        if (trimmed.length === 0) return
        onSelect(trimmed)
        return
      }
      if (key.backspace || key.delete) {
        setCustomText((t) => t.slice(0, -1))
        return
      }
      if (key.ctrl || key.meta) return
      if (input.length === 0) return
      setCustomText((t) => t + input)
      return
    }

    if (key.escape) {
      onCancel()
      return
    }
    if (key.upArrow) {
      setIndex((i) => (i - 1 + entries.length) % entries.length)
      return
    }
    if (key.downArrow) {
      setIndex((i) => (i + 1) % entries.length)
      return
    }
    if (key.return) {
      const entry = entries[index]
      if (entry == null) return
      if (entry.kind === 'default') {
        onSelect(null)
        return
      }
      if (entry.kind === 'other') {
        setMode('text')
        setCustomText(activeModel ?? '')
        return
      }
      onSelect(entry.id)
      return
    }
    // Filter input — type to narrow the list, backspace to clear chars.
    if (key.backspace || key.delete) {
      setFilter((f) => f.slice(0, -1))
      setIndex(0)
      return
    }
    if (key.tab) {
      onRefresh()
      return
    }
    if (key.ctrl || key.meta) return
    if (input.length === 0) return
    setFilter((f) => f + input)
    setIndex(0)
  })

  if (mode === 'text') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold>Enter a custom model ID</Text>
        <Box>
          <Text color="cyan">› </Text>
          <Text>
            {customText.length === 0 ? (
              <Text color="gray">model-id…</Text>
            ) : (
              customText
            )}
          </Text>
          <Text>█</Text>
        </Box>
        <Text color="gray">
          Enter to apply · Esc to go back · type any model ID accepted by{' '}
          {provider}
        </Text>
      </Box>
    )
  }

  // Build the visible window around the selected index so long catalogs
  // (OpenRouter has hundreds of models) stay readable.
  const start = clampStart(index, filtered.length, VISIBLE_LIMIT)
  const visibleModels = filtered.slice(start, start + VISIBLE_LIMIT)
  const moreAbove = start > 0
  const moreBelow = start + visibleModels.length < filtered.length

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Box>
        <Text bold>Select a model</Text>
        <Text color="gray"> · {provider}</Text>
        {filtered.length !== catalog.length ? (
          <Text color="gray">
            {' '}
            · {filtered.length}/{catalog.length}
          </Text>
        ) : catalog.length > 0 ? (
          <Text color="gray"> · {catalog.length}</Text>
        ) : null}
      </Box>
      <Box>
        <Text color="gray">filter: </Text>
        <Text>{filter.length === 0 ? '(type to filter)' : filter}</Text>
        <Text>█</Text>
      </Box>
      <CatalogStatus
        status={models.status}
        errorMessage={models.status === 'error' ? models.message : null}
      />
      {moreAbove ? <Text color="gray">  …{start} above</Text> : null}
      {visibleModels.map((entry, i) => {
        const absoluteIndex = start + i
        return (
          <ModelRow
            key={entry.id}
            label={entry.label}
            id={entry.id}
            detail={entry.detail}
            selected={absoluteIndex === index}
            isActive={entry.id === activeModel}
          />
        )
      })}
      {moreBelow ? (
        <Text color="gray">
          {`  …${filtered.length - (start + visibleModels.length)} below`}
        </Text>
      ) : null}
      {filtered.length === 0 && models.status === 'loaded' ? (
        <Text color="gray">
          {filter.length === 0
            ? '  (this provider returned no models)'
            : '  (no matches for filter)'}
        </Text>
      ) : null}
      <SpecialRow
        label="SDK default"
        detail="Clear the override and use the provider default."
        selected={index === filtered.length}
        isActive={activeModel == null}
      />
      <SpecialRow
        label="Other…"
        detail="Type a custom model ID."
        selected={index === filtered.length + 1}
        isActive={false}
      />
      <Text color="gray">
        ↑/↓ to move · Enter to select · type to filter · Tab to refresh · Esc to cancel
      </Text>
    </Box>
  )
}

function clampStart(index: number, total: number, limit: number): number {
  if (index < limit) return 0
  if (index >= total) return Math.max(0, total - limit)
  return Math.max(0, Math.min(index - Math.floor(limit / 2), total - limit))
}

interface CatalogStatusProps {
  status: ModelsLoadState['status']
  errorMessage: string | null
}

function CatalogStatus({
  status,
  errorMessage
}: CatalogStatusProps): ReactElement | null {
  if (status === 'idle') {
    return <Text color="gray">  (no catalog — provider not ready)</Text>
  }
  if (status === 'loading') {
    return <Text color="gray">  loading models…</Text>
  }
  if (status === 'error') {
    return (
      <Text color="red">
        {`  could not load models: ${errorMessage ?? 'unknown error'}`}
      </Text>
    )
  }
  return null
}

interface ModelRowProps {
  label: string
  id: string
  detail: string | null
  selected: boolean
  isActive: boolean
}

function ModelRow({
  label,
  id,
  detail,
  selected,
  isActive
}: ModelRowProps): ReactElement {
  const showId = label !== id
  return (
    <Box>
      <Text color={selected ? 'cyan' : 'gray'}>{selected ? '› ' : '  '}</Text>
      <Text bold={selected}>{label}</Text>
      {showId ? <Text color="gray">{` (${id})`}</Text> : null}
      {isActive ? <Text color="green"> (active)</Text> : null}
      {detail != null ? <Text color="gray">{` · ${truncate(detail, 60)}`}</Text> : null}
    </Box>
  )
}

interface SpecialRowProps {
  label: string
  detail: string
  selected: boolean
  isActive: boolean
}

function SpecialRow({
  label,
  detail,
  selected,
  isActive
}: SpecialRowProps): ReactElement {
  return (
    <Box>
      <Text color={selected ? 'cyan' : 'gray'}>{selected ? '› ' : '  '}</Text>
      <Text bold={selected}>{label}</Text>
      {isActive ? <Text color="green"> (active)</Text> : null}
      <Text color="gray">{` · ${detail}`}</Text>
    </Box>
  )
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}
