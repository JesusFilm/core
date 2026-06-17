import { Box, Text } from 'ink'
import type { ReactElement } from 'react'

import type { TranscriptEntry } from '../state/types'

interface TranscriptProps {
  entries: TranscriptEntry[]
}

export function Transcript({ entries }: TranscriptProps): ReactElement {
  return (
    <Box flexDirection="column">
      {entries.map((entry) => (
        <TranscriptRow key={entry.id} entry={entry} />
      ))}
    </Box>
  )
}

function TranscriptRow({ entry }: { entry: TranscriptEntry }): ReactElement {
  switch (entry.kind) {
    case 'user':
      return (
        <Box marginBottom={1}>
          <Text color="cyan">› </Text>
          <Text>{entry.text}</Text>
        </Box>
      )
    case 'assistant':
      return (
        <Box marginBottom={1} flexDirection="column">
          <Text>{entry.text}</Text>
        </Box>
      )
    case 'tool_call':
      return (
        <Box marginBottom={1}>
          <Text color="magenta">⏵ </Text>
          <Text color="gray">{entry.name}</Text>
          <Text color="gray"> {summariseInput(entry.input)}</Text>
        </Box>
      )
    case 'system': {
      const color =
        entry.tone === 'error'
          ? 'red'
          : entry.tone === 'warn'
            ? 'yellow'
            : 'cyan'
      return (
        <Box marginBottom={1} flexDirection="column">
          <Text color={color}>{entry.text}</Text>
        </Box>
      )
    }
  }
}

function summariseInput(input: unknown): string {
  if (input == null) return ''
  if (typeof input !== 'object') return String(input)
  try {
    const json = JSON.stringify(input)
    if (json.length <= 80) return json
    return `${json.slice(0, 77)}...`
  } catch {
    return ''
  }
}
