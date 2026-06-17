import { Box, Text, useInput } from 'ink'
import { type ReactElement, useState } from 'react'

import type { Team } from '../../tools/team/api'
import type { TeamSelection, TeamsLoadState } from '../state/types'

interface TeamPickerProps {
  teams: TeamsLoadState
  activeTeam: TeamSelection | null
  onSelect: (selection: TeamSelection) => void
  onCancel: () => void
}

interface PickerOption {
  key: string
  label: string
  detail: string | null
  selection: TeamSelection
}

export function TeamPicker({
  teams,
  activeTeam,
  onSelect,
  onCancel
}: TeamPickerProps): ReactElement {
  const options = buildOptions(teams)
  const initialIndex = options.findIndex((opt) =>
    isSameSelection(opt.selection, activeTeam)
  )
  const [index, setIndex] = useState(initialIndex >= 0 ? initialIndex : 0)

  useInput((_input, key) => {
    if (key.escape) {
      onCancel()
      return
    }
    if (options.length === 0) return
    if (key.upArrow) {
      setIndex((i) => (i - 1 + options.length) % options.length)
      return
    }
    if (key.downArrow) {
      setIndex((i) => (i + 1) % options.length)
      return
    }
    if (key.return) {
      onSelect(options[index].selection)
    }
  })

  if (teams.status === 'loading') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text color="gray">Loading teams…</Text>
      </Box>
    )
  }

  if (teams.status === 'error') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="red" paddingX={1}>
        <Text color="red">Could not load teams: {teams.message}</Text>
        <Text color="gray">Esc to dismiss.</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Text bold>Select a team</Text>
      {options.map((option, i) => (
        <TeamRow
          key={option.key}
          option={option}
          selected={i === index}
          isActive={isSameSelection(option.selection, activeTeam)}
        />
      ))}
      <Text color="gray">↑/↓ to move · Enter to select · Esc to cancel</Text>
    </Box>
  )
}

function TeamRow({
  option,
  selected,
  isActive
}: {
  option: PickerOption
  selected: boolean
  isActive: boolean
}): ReactElement {
  return (
    <Box>
      <Text color={selected ? 'cyan' : 'gray'}>{selected ? '› ' : '  '}</Text>
      <Text bold={selected}>{option.label}</Text>
      {isActive ? <Text color="green"> (active)</Text> : null}
      {option.detail != null ? (
        <Text color="gray"> · {option.detail}</Text>
      ) : null}
    </Box>
  )
}

function buildOptions(teams: TeamsLoadState): PickerOption[] {
  const options: PickerOption[] = []
  if (teams.status === 'loaded') {
    for (const team of teams.teams) {
      options.push({
        key: team.id,
        label: team.title,
        detail: team.publicTitle != null && team.publicTitle !== team.title
          ? team.publicTitle
          : null,
        selection: { kind: 'team', team }
      })
    }
  }
  options.push({
    key: '__shared__',
    label: 'Shared with me',
    detail: 'Journeys shared with you outside any team.',
    selection: { kind: 'shared' }
  })
  return options
}

export function isSameSelection(
  a: TeamSelection,
  b: TeamSelection | null
): boolean {
  if (b == null) return false
  if (a.kind === 'shared' && b.kind === 'shared') return true
  if (a.kind === 'team' && b.kind === 'team') return a.team.id === b.team.id
  return false
}

export function describeSelection(selection: TeamSelection | null): string {
  if (selection == null) return '—'
  if (selection.kind === 'shared') return 'Shared with me'
  return selection.team.title
}

export function findSelectionByName(
  teams: Team[],
  name: string
): TeamSelection | null {
  const normalised = name.trim().toLowerCase()
  if (normalised === 'shared' || normalised === 'shared with me') {
    return { kind: 'shared' }
  }
  const team = teams.find(
    (t) =>
      t.title.toLowerCase() === normalised ||
      t.publicTitle?.toLowerCase() === normalised ||
      t.id === name
  )
  return team != null ? { kind: 'team', team } : null
}
