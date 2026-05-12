import { Box, Text } from 'ink'
import type { ReactElement } from 'react'

import type { ActiveSession } from '../../auth/login'
import type { JourneyListItem } from '../../tools/journey/api'
import type { JourneySimpleCard } from '../../tools/journey/types'
import type {
  BlockKind,
  ImpersonationSession,
  JourneysLoadState,
  ReplState,
  TeamSelection,
  TeamsLoadState
} from '../state/types'

import { ImpersonationCountdown } from './ImpersonationCountdown'
import { Spinner } from './Spinner'

interface StatusBarProps {
  session: ActiveSession
  status: ReplState['status']
  usage: ReplState['usage']
  teams: TeamsLoadState
  activeTeam: TeamSelection | null
  journeys: JourneysLoadState
  activeJourney: JourneyListItem | null
  activeCard: JourneySimpleCard | null
  activeBlock: BlockKind | null
  impersonating: ImpersonationSession | null
  model: string | null
}

const ENV_COLORS: Record<string, string> = {
  dev: 'green',
  stage: 'yellow',
  prod: 'red'
}

export function StatusBar({
  session,
  status,
  usage,
  teams,
  activeTeam,
  journeys,
  activeJourney,
  activeCard,
  activeBlock,
  impersonating,
  model
}: StatusBarProps): ReactElement {
  const envColor = ENV_COLORS[session.environment.id] ?? 'white'
  const who = session.email ?? session.userId ?? 'anonymous'
  const teamLabel = describeTeam(teams, activeTeam)
  const teamColor = activeTeam == null ? 'gray' : 'magenta'
  const journeyLabel = describeJourney(journeys, activeJourney)
  const journeyColor = activeJourney == null ? 'gray' : 'cyan'
  const cardLabel = describeCard(activeCard)
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
    <Box flexDirection="column">
      {impersonating != null ? (
        <Box paddingX={1} backgroundColor="red" justifyContent="space-between">
          <Box>
            <Text color="white" bold>
              {' '}
              IMPERSONATING {impersonating.email}{' '}
            </Text>
            <Text color="white"> · /stop-impersonate to return</Text>
          </Box>
          <Box>
            <ImpersonationCountdown expiresAt={impersonating.expiresAt} />
          </Box>
        </Box>
      ) : null}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
      >
        <Box justifyContent="space-between">
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
          </Box>
        </Box>
        <Box justifyContent="space-between">
          <Box>
            <Text color={teamColor}>{teamLabel}</Text>
            <Text color="gray"> · </Text>
            <Text color={journeyColor}>{journeyLabel}</Text>
            {cardLabel != null ? (
              <>
                <Text color="gray"> › </Text>
                <Text color="cyan">{cardLabel}</Text>
              </>
            ) : null}
            {activeBlock != null ? (
              <>
                <Text color="gray"> › </Text>
                <Text color="cyan">{activeBlock}</Text>
              </>
            ) : null}
            {model != null ? (
              <>
                <Text color="gray"> · </Text>
                <Text color="blue">{model}</Text>
              </>
            ) : null}
          </Box>
          <Box>
            {status === 'idle' ? (
              <Text color={statusColor}>{statusLabel}</Text>
            ) : (
              <>
                <Spinner color={statusColor} />
                <Text color={statusColor}> {statusLabel}</Text>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function formatTokens(value: number): string {
  if (value < 1000) return value.toString()
  if (value < 1000 * 1000) return `${(value / 1000).toFixed(1)}k`
  return `${(value / 1000 / 1000).toFixed(2)}M`
}

function describeTeam(
  teams: TeamsLoadState,
  active: TeamSelection | null
): string {
  if (active != null) {
    return active.kind === 'shared' ? 'Shared with me' : active.team.title
  }
  if (teams.status === 'loading') return 'team: loading…'
  if (teams.status === 'error') return 'team: error'
  return 'no team'
}

function describeJourney(
  journeys: JourneysLoadState,
  active: JourneyListItem | null
): string {
  if (active != null) return truncate(active.title, 30)
  if (journeys.status === 'loading') return 'journey: loading…'
  if (journeys.status === 'error') return 'journey: error'
  return 'no journey'
}

function describeCard(active: JourneySimpleCard | null): string | null {
  if (active == null) return null
  const label = active.heading ?? active.text ?? active.id
  return truncate(label, 25)
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}
