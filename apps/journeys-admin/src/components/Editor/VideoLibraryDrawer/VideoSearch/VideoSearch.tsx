import { ReactElement, useRef } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Search from '@mui/icons-material/Search'

export function VideoSearch(): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = (): void => inputRef.current?.select()

  return (
    <TextField
      variant="filled"
      sx={{
        width: 296,
        height: 56
      }}
      label="Search video by title..."
      inputRef={inputRef}
      inputProps={{ onFocus: handleFocus }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton aria-label="Copy">
              <Search />
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  )
}
