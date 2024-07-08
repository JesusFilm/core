import Globe1Icon from '@core/shared/ui/icons/Globe1'
import { InputAdornment, TextField } from '@mui/material'
import { ReactElement } from 'react'

export function SearchBar(): ReactElement {
  return (
    <TextField
      placeholder="Search by topic, occasion, or audience ..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Globe1Icon />
          </InputAdornment>
        )
      }}
    />
  )
}
