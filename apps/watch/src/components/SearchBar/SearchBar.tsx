import Search1Icon from '@core/shared/ui/icons/Search1'
import { Box, InputAdornment, TextField, styled } from '@mui/material'
import { ReactElement } from 'react'

export function SearchBar(): ReactElement {
  /* Styles below used to fake a gradient border because the 
  css attributes border-radius and border-image-source are not compatible */

  const ColoredTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      background: theme.palette.background.default,
      borderRadius: '8px',
      '&.Mui-focused fieldset, fieldset': {
        borderRadius: '12px'
      },
      fieldset: {
        border: 'none'
      },
      input: {
        // Overriding the default set in components.tsx
        transform: 'none'
      }
    }
  }))

  return (
    <Box
      sx={{
        borderRadius: '12px',
        background:
          'linear-gradient(90deg, #0C79B3 0%, #0FDABC 51%, #E72DBB 100%)',
        p: '4px'
      }}
      data-testid="SearchBar"
    >
      <ColoredTextField
        placeholder="Search by topic, occasion, or audience ..."
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search1Icon />
            </InputAdornment>
          )
        }}
      />
    </Box>
  )
}
