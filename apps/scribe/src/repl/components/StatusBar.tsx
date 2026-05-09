import { Box, Text } from 'ink'
import type { ReactElement } from 'react'

import type { ActiveSession } from '../../auth/login'
import type { ReplState } from '../state/types'

interface StatusBarProps {
  session: ActiveSession
  status: ReplState['status']
  usage: ReplState['usage']
}

const ENV_COLORS: Record<string, string> = {
  dev: 'green',
  stage: 'yellow',
  prod: 'red'
}

export function StatusBar({
  session,
  status,
  usage
}: StatusBarProps): ReactElement {
  const envColor = ENV_COLORS[session.environment.id] ?? 'white'
  const who = session.email ?? session.userId ?? 'anonymous'
  const totalInput = usage.inputTokens + usage.cacheReadInputTokens
  const cacheHits =
    usage.inputTokens + usage.cacheReadInputTokens > 0
      ? Math.round(
          (usage.cacheReadInputTokens /
            (usage.inputTokens + usage.cacheReadInputTokens)) *
            100
        )
      : 0
  const statusLabel =
    status === 'thinking'
      ? 'thinking…'
      : status === 'tool'
        ? 'tool call…'
        : 'ready'
  const statusColor =
    status === 'thinking' ? 'yellow' : status === 'tool' ? 'magenta' : 'green'

  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
    >
      <Box>
        <Text bold color={envColor}>
          {session.environment.id.toUpperCase()}
        </Text>
        <Text color="gray"> · </Text>
        <Text>{who}</Text>
      </Box>
      <Box>
        <Text color="gray">in </Text>
        <Text>{formatTokens(totalInput)}</Text>
        {usage.cacheReadInputTokens > 0 ? (
          <Text color="gray"> ({cacheHits}% cached)</Text>
        ) : null}
        <Text color="gray"> · out </Text>
        <Text>{formatTokens(usage.outputTokens)}</Text>
        <Text color="gray"> · turns </Text>
        <Text>{usage.turns}</Text>
        <Text color="gray"> · </Text>
        <Text color={statusColor}>{statusLabel}</Text>
      </Box>
    </Box>
  )
}

function formatTokens(value: number): string {
  if (value < 1000) return value.toString()
  if (value < 1000 * 1000) return `${(value / 1000).toFixed(1)}k`
  return `${(value / 1000 / 1000).toFixed(2)}M`
}
