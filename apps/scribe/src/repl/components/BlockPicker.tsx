import { Box, Text, useInput } from 'ink'
import { type ReactElement, useEffect, useMemo, useState } from 'react'

import type { JourneySimpleCard } from '../../tools/journey/types'
import type { BlockKind } from '../state/types'

interface BlockPickerProps {
  card: JourneySimpleCard | null
  activeBlock: BlockKind | null
  onSelect: (block: BlockKind) => void
  onCancel: () => void
}

interface BlockEntry {
  kind: BlockKind
  label: string
  snippet: string
}

const KIND_LABEL: Record<BlockKind, string> = {
  heading: 'heading',
  text: 'text',
  button: 'button',
  poll: 'poll',
  image: 'image',
  backgroundImage: 'background image',
  video: 'video'
}

export function BlockPicker({
  card,
  activeBlock,
  onSelect,
  onCancel
}: BlockPickerProps): ReactElement {
  const entries = useMemo(() => collectBlocks(card), [card])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index >= entries.length && entries.length > 0) setIndex(0)
  }, [entries.length, index])

  useInput((_input, key) => {
    if (key.escape) {
      onCancel()
      return
    }
    if (entries.length === 0) return
    if (key.return) {
      const choice = entries[index]
      if (choice != null) onSelect(choice.kind)
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
  })

  if (card == null) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1}>
        <Text color="gray">No card active. Run /card first.</Text>
        <Text color="gray">Esc to dismiss.</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Box>
        <Text bold>Select a block</Text>
        <Text color="gray"> · card </Text>
        <Text>{card.id}</Text>
      </Box>
      {entries.length === 0 ? (
        <Text color="gray">This card has no content blocks.</Text>
      ) : (
        entries.map((entry, i) => {
          const selected = i === index
          const isActive = activeBlock === entry.kind
          return (
            <BlockRow
              key={entry.kind}
              entry={entry}
              selected={selected}
              isActive={isActive}
            />
          )
        })
      )}
      <Text color="gray">↑/↓ to move · Enter to select · Esc to cancel</Text>
    </Box>
  )
}

function BlockRow({
  entry,
  selected,
  isActive
}: {
  entry: BlockEntry
  selected: boolean
  isActive: boolean
}): ReactElement {
  return (
    <Box>
      <Text color={selected ? 'cyan' : 'gray'}>{selected ? '› ' : '  '}</Text>
      <Text bold={selected}>{entry.label}</Text>
      {entry.snippet.length > 0 ? (
        <>
          <Text color="gray"> · </Text>
          <Text color="gray">{entry.snippet}</Text>
        </>
      ) : null}
      {isActive ? <Text color="green"> (active)</Text> : null}
    </Box>
  )
}

export function collectBlocks(card: JourneySimpleCard | null): BlockEntry[] {
  if (card == null) return []
  const entries: BlockEntry[] = []
  if (card.heading != null && card.heading.length > 0) {
    entries.push({
      kind: 'heading',
      label: KIND_LABEL.heading,
      snippet: truncate(card.heading, 50)
    })
  }
  if (card.text != null && card.text.length > 0) {
    entries.push({
      kind: 'text',
      label: KIND_LABEL.text,
      snippet: truncate(card.text, 50)
    })
  }
  if (card.button != null) {
    entries.push({
      kind: 'button',
      label: KIND_LABEL.button,
      snippet: truncate(card.button.text, 50)
    })
  }
  if (card.poll != null && card.poll.length > 0) {
    entries.push({
      kind: 'poll',
      label: KIND_LABEL.poll,
      snippet: `${card.poll.length} option${card.poll.length === 1 ? '' : 's'}`
    })
  }
  if (card.image != null) {
    entries.push({
      kind: 'image',
      label: KIND_LABEL.image,
      snippet: truncate(card.image.alt, 50)
    })
  }
  if (card.backgroundImage != null) {
    entries.push({
      kind: 'backgroundImage',
      label: KIND_LABEL.backgroundImage,
      snippet: truncate(card.backgroundImage.alt, 50)
    })
  }
  if (card.video != null) {
    entries.push({
      kind: 'video',
      label: KIND_LABEL.video,
      snippet: truncate(card.video.url, 50)
    })
  }
  return entries
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

const KIND_ALIASES: Record<string, BlockKind> = {
  heading: 'heading',
  headline: 'heading',
  title: 'heading',
  text: 'text',
  body: 'text',
  paragraph: 'text',
  button: 'button',
  cta: 'button',
  poll: 'poll',
  options: 'poll',
  image: 'image',
  img: 'image',
  background: 'backgroundImage',
  backgroundimage: 'backgroundImage',
  bg: 'backgroundImage',
  video: 'video'
}

export function findBlockByQuery(
  card: JourneySimpleCard | null,
  query: string
): BlockKind | null {
  if (card == null) return null
  const trimmed = query.trim().toLowerCase()
  if (trimmed.length === 0) return null
  const alias = KIND_ALIASES[trimmed]
  if (alias == null) return null
  const available = collectBlocks(card).map((entry) => entry.kind)
  return available.includes(alias) ? alias : null
}
