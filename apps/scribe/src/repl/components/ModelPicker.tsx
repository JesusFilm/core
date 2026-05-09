import { Box, Text, useInput } from 'ink'
import { type ReactElement, useState } from 'react'

interface ModelPickerProps {
  activeModel: string | null
  onSelect: (model: string | null) => void
  onCancel: () => void
}

interface PresetOption {
  key: string
  label: string
  detail: string
  /** Value handed to setModel. `null` clears the override. */
  value: string | null
}

const PRESETS: PresetOption[] = [
  {
    key: 'opus',
    label: 'opus',
    detail: 'Most capable; slower and higher cost.',
    value: 'opus'
  },
  {
    key: 'sonnet',
    label: 'sonnet',
    detail: 'Balanced quality and speed.',
    value: 'sonnet'
  },
  {
    key: 'haiku',
    label: 'haiku',
    detail: 'Fastest and cheapest.',
    value: 'haiku'
  },
  {
    key: 'default',
    label: 'SDK default',
    detail: 'Clear the override and use the SDK default.',
    value: null
  }
]

const OTHER_KEY = '__other__'

export function ModelPicker({
  activeModel,
  onSelect,
  onCancel
}: ModelPickerProps): ReactElement {
  const presetIndex = PRESETS.findIndex((p) => p.value === activeModel)
  const initialIndex = presetIndex >= 0 ? presetIndex : 0
  const [index, setIndex] = useState(initialIndex)
  const [mode, setMode] = useState<'choose' | 'text'>('choose')
  // Pre-fill the text input with the current model so editing a custom ID is
  // a one-character tweak rather than a full retype.
  const [text, setText] = useState(
    activeModel != null && presetIndex < 0 ? activeModel : ''
  )

  // Total option count = presets + the trailing "Other…" entry.
  const totalOptions = PRESETS.length + 1

  useInput((input, key) => {
    if (mode === 'choose') {
      if (key.escape) {
        onCancel()
        return
      }
      if (key.upArrow) {
        setIndex((i) => (i - 1 + totalOptions) % totalOptions)
        return
      }
      if (key.downArrow) {
        setIndex((i) => (i + 1) % totalOptions)
        return
      }
      if (key.return) {
        if (index < PRESETS.length) {
          onSelect(PRESETS[index].value)
          return
        }
        setMode('text')
      }
      return
    }
    // mode === 'text'
    if (key.escape) {
      setMode('choose')
      return
    }
    if (key.return) {
      const trimmed = text.trim()
      if (trimmed.length === 0) return
      onSelect(trimmed)
      return
    }
    if (key.backspace || key.delete) {
      setText((t) => t.slice(0, -1))
      return
    }
    if (key.ctrl || key.meta) return
    if (input.length === 0) return
    setText((t) => t + input)
  })

  if (mode === 'text') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold>Enter a custom model ID</Text>
        <Box>
          <Text color="cyan">› </Text>
          <Text>{text.length === 0 ? <Text color="gray">claude-…</Text> : text}</Text>
          <Text>█</Text>
        </Box>
        <Text color="gray">
          Enter to apply · Esc to go back · type any alias or full model ID
        </Text>
      </Box>
    )
  }

  const otherSelected = index === PRESETS.length

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Text bold>Select a model</Text>
      {activeModel != null && presetIndex < 0 ? (
        <Text color="gray">Current: {activeModel}</Text>
      ) : null}
      {PRESETS.map((option, i) => (
        <PickerRow
          key={option.key}
          label={option.label}
          detail={option.detail}
          selected={i === index}
          isActive={option.value === activeModel}
        />
      ))}
      <PickerRow
        key={OTHER_KEY}
        label="Other…"
        detail="Type a custom model ID."
        selected={otherSelected}
        isActive={false}
      />
      <Text color="gray">↑/↓ to move · Enter to select · Esc to cancel</Text>
    </Box>
  )
}

interface PickerRowProps {
  label: string
  detail: string
  selected: boolean
  isActive: boolean
}

function PickerRow({
  label,
  detail,
  selected,
  isActive
}: PickerRowProps): ReactElement {
  return (
    <Box>
      <Text color={selected ? 'cyan' : 'gray'}>{selected ? '› ' : '  '}</Text>
      <Text bold={selected}>{label}</Text>
      {isActive ? <Text color="green"> (active)</Text> : null}
      <Text color="gray"> · {detail}</Text>
    </Box>
  )
}
