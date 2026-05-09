import { Box, Text } from 'ink'
import { type ReactElement, useEffect, useState } from 'react'

import type { ReplState } from '../state/types'

import { Spinner } from './Spinner'

interface ActivityIndicatorProps {
  status: ReplState['status']
  currentToolName: string | null
  startedAt: number | null
}

export function ActivityIndicator({
  status,
  currentToolName,
  startedAt
}: ActivityIndicatorProps): ReactElement | null {
  const [, forceTick] = useState(0)

  // Bump every second so the elapsed counter advances. We only need to
  // re-render once per second; the spinner has its own faster timer.
  useEffect(() => {
    if (status === 'idle') return
    const handle = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(handle)
  }, [status])

  if (status === 'idle') return null

  const label =
    status === 'tool'
      ? currentToolName != null
        ? `Running ${currentToolName}`
        : 'Running tool'
      : 'Thinking'
  const color = status === 'tool' ? 'magenta' : 'yellow'
  const elapsed = startedAt != null ? formatElapsed(Date.now() - startedAt) : null

  return (
    <Box>
      <Spinner color={color} />
      <Text> </Text>
      <Text color={color}>{label}…</Text>
      {elapsed != null ? <Text color="gray"> ({elapsed})</Text> : null}
    </Box>
  )
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}
