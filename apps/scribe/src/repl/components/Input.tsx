import { Box, Text, useInput } from 'ink'
import { type ReactElement, useEffect, useState } from 'react'

import { filterCommands } from '../commands/registry'
import type { CommandContext, SlashCommand } from '../commands/types'

interface InputProps {
  /** Whether the input accepts keystrokes. False while the agent is running. */
  enabled: boolean
  placeholder: string
  onSubmit: (value: string) => void
  /**
   * Used to gate availability-restricted slash commands (e.g. /impersonate
   * is only shown to superadmins). Pass null while still booting.
   */
  commandContext: CommandContext | null
}

const CURSOR_BLINK_MS = 500

export function Input({
  enabled,
  placeholder,
  onSubmit,
  commandContext
}: InputProps): ReactElement {
  const [value, setValue] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)
  const [menuIndex, setMenuIndex] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(
      () => setCursorVisible((v) => !v),
      CURSOR_BLINK_MS
    )
    return () => clearInterval(interval)
  }, [enabled])

  const slashMatches = computeSlashMatches(value, commandContext)
  const showMenu = slashMatches != null && slashMatches.length > 0

  // Clamp menu selection when matches shrink.
  useEffect(() => {
    if (showMenu && menuIndex >= (slashMatches?.length ?? 0)) {
      setMenuIndex(0)
    }
  }, [showMenu, slashMatches?.length, menuIndex])

  useInput(
    (input, key) => {
      if (!enabled) return

      if (key.return) {
        const trimmed = value.trim()
        if (trimmed.length === 0) return
        // If the slash menu is open and a single match is highlighted, expand
        // to that command name (preserving any args after it).
        if (showMenu && slashMatches != null && slashMatches.length > 0) {
          const completed = applyMenuSelection(value, slashMatches[menuIndex])
          setValue('')
          setMenuIndex(0)
          onSubmit(completed)
          return
        }
        setValue('')
        setMenuIndex(0)
        onSubmit(trimmed)
        return
      }

      if (key.tab && showMenu && slashMatches != null) {
        const completed = applyMenuSelection(value, slashMatches[menuIndex])
        setValue(completed)
        return
      }

      if (key.upArrow && showMenu && slashMatches != null) {
        setMenuIndex((i) => (i - 1 + slashMatches.length) % slashMatches.length)
        return
      }

      if (key.downArrow && showMenu && slashMatches != null) {
        setMenuIndex((i) => (i + 1) % slashMatches.length)
        return
      }

      if (key.escape) {
        setValue('')
        setMenuIndex(0)
        return
      }

      if (key.backspace || key.delete) {
        setValue((v) => v.slice(0, -1))
        return
      }

      if (key.ctrl || key.meta) return

      // Filter out other non-printable keys.
      if (input.length === 0) return

      setValue((v) => v + input)
    },
    { isActive: enabled }
  )

  const cursor = enabled && cursorVisible ? '█' : ' '

  return (
    <Box flexDirection="column">
      {showMenu && slashMatches != null ? (
        <SlashMenu matches={slashMatches} selectedIndex={menuIndex} />
      ) : null}
      <Box>
        <Text color="cyan">› </Text>
        <Text>
          {value.length === 0 ? (
            <Text color="gray">{placeholder}</Text>
          ) : (
            value
          )}
        </Text>
        <Text>{cursor}</Text>
      </Box>
    </Box>
  )
}

function computeSlashMatches(
  value: string,
  context: CommandContext | null
): SlashCommand[] | null {
  if (!value.startsWith('/')) return null
  const afterSlash = value.slice(1)
  // Once the user types a space, they have committed to a command name and
  // are typing arguments — don't show completions.
  if (afterSlash.includes(' ')) return null
  return filterCommands(afterSlash, context)
}

function applyMenuSelection(value: string, command: SlashCommand): string {
  const remainderAfterName = value.slice(value.indexOf('/') + 1)
  const trailing = remainderAfterName.includes(' ')
    ? remainderAfterName.slice(remainderAfterName.indexOf(' '))
    : ''
  return `/${command.name}${trailing}`
}

interface SlashMenuProps {
  matches: SlashCommand[]
  selectedIndex: number
}

function SlashMenu({ matches, selectedIndex }: SlashMenuProps): ReactElement {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      {matches.map((cmd, index) => {
        const isSelected = index === selectedIndex
        return (
          <Box key={cmd.name}>
            <Text color={isSelected ? 'black' : undefined} backgroundColor={isSelected ? 'cyan' : undefined}>
              {' '}/{cmd.name}
              {cmd.argHint != null ? ` ${cmd.argHint}` : ''}
              {' '}
            </Text>
            <Text color="gray"> {cmd.description}</Text>
          </Box>
        )
      })}
      <Text color="gray">↑/↓ to select · Tab to complete · Enter to run · Esc to clear</Text>
    </Box>
  )
}
