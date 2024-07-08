import Search1Icon from '@core/shared/ui/icons/Search1'
import { InputAdornment, TextField } from '@mui/material'
import { ReactElement } from 'react'

export function SearchBar(): ReactElement {
  return (
    <TextField
      placeholder="Search by topic, occasion, or audience ..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search1Icon />
          </InputAdornment>
        )
      }}
    />
  )
}
