import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Search from '@mui/icons-material/Search'

interface VideoSearchProps {
  value?: string
  onChange: (value: string) => void
}

export function VideoSearch({
  value,
  onChange
}: VideoSearchProps): ReactElement {
  return (
    <TextField
      hiddenLabel
      variant="filled"
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{
        'data-testid': 'VideoSearch',
        'aria-label': 'Search'
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Search />
          </InputAdornment>
        )
      }}
      sx={{
        px: 6,
        py: 8
      }}
    />
  )
}
