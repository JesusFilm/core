import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

export interface AutocompleteOption {
  value: string
  label: string
}

interface TagAutocompleteProps {
  parentId: string
  tags: AutocompleteOption[]
  selectedTagIds?: string[]
  label?: string
  placeholder?: string
  limit?: number
  onChange: (parentId: string, tags: readonly AutocompleteOption[]) => void
}

export function TagAutocomplete({
  parentId,
  tags,
  selectedTagIds,
  label,
  placeholder,
  limit = -1,
  onChange
}: TagAutocompleteProps): ReactElement {
  const selectedTags = tags.filter((tag) => selectedTagIds?.includes(tag.value))

  return (
    <Autocomplete
      multiple
      data-testid={`${label ?? placeholder ?? ''}-tag-autocomplete`}
      options={tags}
      value={selectedTags}
      limitTags={limit}
      disableCloseOnSelect
      onChange={(e, value) => {
        onChange(parentId, value)
      }}
      fullWidth
      getOptionLabel={(option) => option.label}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox sx={{ mr: 2 }} checked={selected} />
          {option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          rows={1}
          maxRows={1}
          label={label}
          placeholder={placeholder}
        />
      )}
    />
  )
}
