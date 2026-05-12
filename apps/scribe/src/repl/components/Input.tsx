import { Box, Text, useInput } from 'ink'
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import { filterCommands } from '../commands/registry'
import type { CommandContext, SlashCommand } from '../commands/types'

/**
 * Prompt history API owned by the parent (so it survives mount/unmount of
 * the Input when slash commands open pickers). Implemented with refs to
 * avoid stale-closure issues in Ink's keypress handler.
 */
export interface PromptHistory {
  /** Append `text` unless it is an exact duplicate of the most recent entry. */
  push: (text: string) => void
  /**
   * Step back through history. On the first call after editing, snapshot
   * `currentValue` so it can be restored by recallNext past the newest entry.
   * Returns the recalled value, or `null` when there's nothing to recall.
   */
  recallPrev: (currentValue: string) => string | null
  /**
   * Step forward through history. Returns the next entry, the saved draft
   * when stepping past the newest entry, or `null` if not currently navigating.
   */
  recallNext: () => string | null
  /** Reset navigation state — index back to "not navigating", drop the draft. */
  reset: () => void
}

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
  history: PromptHistory
}

const CURSOR_BLINK_MS = 500

export function Input({
  enabled,
  placeholder,
  onSubmit,
  commandContext,
  history
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
        const submitted =
          showMenu && slashMatches != null && slashMatches.length > 0
            ? applyMenuSelection(value, slashMatches[menuIndex])
            : trimmed
        history.push(submitted)
        setValue('')
        setMenuIndex(0)
        onSubmit(submitted)
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

      // Up arrow with no slash menu — recall the previous prompt from history.
      if (key.upArrow) {
        const recalled = history.recallPrev(value)
        if (recalled != null) setValue(recalled)
        return
      }

      // Down arrow with no slash menu — walk forward through history, then
      // back to the original draft when past the newest entry.
      if (key.downArrow) {
        const recalled = history.recallNext()
        if (recalled != null) setValue(recalled)
        return
      }

      if (key.escape) {
        setValue('')
        setMenuIndex(0)
        history.reset()
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

/**
 * Owns the prompt history state in refs so the Input component can stay
 * stateless about its own past. Call this once at the app level — the
 * returned API survives Input mount/unmount cycles (e.g. when a slash
 * command opens a picker).
 */
export function usePromptHistory(): PromptHistory {
  const historyRef = useRef<string[]>([])
  // `historyRef.current.length` means "not navigating" — the next up arrow
  // starts a recall.
  const indexRef = useRef(0)
  const draftRef = useRef('')

  return useMemo<PromptHistory>(
    () => ({
      push(text) {
        const prev = historyRef.current
        // Skip exact-duplicate of the most recent entry.
        const isDuplicate = prev[prev.length - 1] === text
        const next = isDuplicate ? prev : [...prev, text]
        historyRef.current = next
        indexRef.current = next.length
        draftRef.current = ''
      },
      recallPrev(currentValue) {
        const list = historyRef.current
        if (list.length === 0) return null
        const cur = indexRef.current
        if (cur === list.length) {
          // First step back — snapshot the in-progress draft so we can
          // restore it later via recallNext.
          draftRef.current = currentValue
        }
        const nextIndex = Math.max(0, cur - 1)
        indexRef.current = nextIndex
        return list[nextIndex]
      },
      recallNext() {
        const list = historyRef.current
        const cur = indexRef.current
        if (cur >= list.length) return null
        const nextIndex = cur + 1
        indexRef.current = nextIndex
        return nextIndex === list.length ? draftRef.current : list[nextIndex]
      },
      reset() {
        indexRef.current = historyRef.current.length
        draftRef.current = ''
      }
    }),
    []
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
