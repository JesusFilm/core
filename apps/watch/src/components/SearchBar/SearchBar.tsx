import Search1Icon from '@core/shared/ui/icons/Search1'
import { Box, InputAdornment, TextField, styled } from '@mui/material'
import { ReactElement } from 'react'

export function SearchBar(): ReactElement {
  /* Styles below used to fake a gradient border because the 
  css attributes border-radius and border-image-source are not compatible */

  const ColoredBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    '& .MuiOutlinedInput-root': {
      position: 'relative',
      background: theme.palette.background.default,
      borderRadius: '8px',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        zIndex: -1,
        borderRadius: '12px',
        background:
          'linear-gradient(90deg, #0C79B3 0%, #0FDABC 51%, #E72DBB 100%)'
      },
      fieldset: {
        borderColor: 'transparent',
        borderRadius: '12px' // Same border radius as :before
      },
      input: {
        transform: 'none'
      }
    }
  }))

  const ColoredTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset, fieldset': {
        borderRadius: '12px'
      },
      '& fieldset': {
        border: 'none'
      }
    }
  })

  return (
    <ColoredBox>
      <ColoredTextField
        placeholder="Search by topic, occasion, or audience ..."
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search1Icon />
            </InputAdornment>
          )
        }}
      />
    </ColoredBox>
  )
}
