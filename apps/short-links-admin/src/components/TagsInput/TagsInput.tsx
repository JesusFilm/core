import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

interface TagsInputProps {
  value: string[]
  onChange: (value: string[]) => void
  label?: string
  helperText?: string
  disabled?: boolean
  id?: string
}

function normalizeTags(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const trimmed = value.trim()
    if (trimmed === '' || seen.has(trimmed)) continue
    seen.add(trimmed)
    result.push(trimmed)
  }
  return result
}

export function TagsInput({
  value,
  onChange,
  label = 'Tags',
  helperText,
  disabled = false,
  id = 'tags'
}: TagsInputProps): ReactElement {
  function handleChange(_event: unknown, next: string[]): void {
    onChange(normalizeTags(next))
  }

  return (
    <Autocomplete
      id={id}
      multiple
      freeSolo
      options={[]}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      renderValue={(selected, getItemProps) =>
        selected.map((option, index) => {
          const { key, ...itemProps } = getItemProps({ index })
          return <Chip key={key} size="small" label={option} {...itemProps} />
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={helperText ?? 'Press Enter to add a tag'}
        />
      )}
    />
  )
}
