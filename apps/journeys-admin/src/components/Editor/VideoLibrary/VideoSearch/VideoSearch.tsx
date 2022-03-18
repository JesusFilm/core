import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Search from '@mui/icons-material/Search'

interface VideoSearchProps {
  title?: string
  setTitle: (title: string) => void
}

export function VideoSearch({
  title,
  setTitle
}: VideoSearchProps): ReactElement {
  return (
    <TextField
      id="videoSearch"
      name="videoSearch"
      variant="filled"
      fullWidth
      value={title}
      onChange={(e) => setTitle(e.target.value)}
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
