import Search1Icon from '@core/shared/ui/icons/Search1'
import { InputAdornment, TextField, styled } from '@mui/material'
import { ReactElement } from 'react'

export function SearchBar(): ReactElement {
  const CssTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset, fieldset': {
        border: '4px solid',
        borderImageSource:
          'linear-gradient(90deg, #0C79B3 0%, #0FDABC 51%, #E72DBB 100%)',
        borderImageSlice: 1,
        borderRadius: '12px' // not working!
      }
    }
  })

  return (
    <CssTextField
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
