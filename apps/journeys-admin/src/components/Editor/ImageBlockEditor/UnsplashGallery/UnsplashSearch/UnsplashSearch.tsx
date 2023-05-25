import { ReactElement } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { TextFieldForm } from '../../../../TextFieldForm'

interface UnsplashSearchProps {
  handleSubmit: (value?: string | null) => void
  value?: string
}

export function UnsplashSearch({
  handleSubmit,
  value
}: UnsplashSearchProps): ReactElement {
  return (
    <TextFieldForm
      id="src"
      initialValues={value}
      placeholder="Search by keyword"
      handleSubmit={handleSubmit}
      hiddenLabel
      inputProps={{
        'aria-label': 'UnsplashSearch'
      }}
      startIcon={
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      }
      iconPosition="start"
    />
  )
}
