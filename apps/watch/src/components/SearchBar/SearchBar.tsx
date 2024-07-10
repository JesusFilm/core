import Search1Icon from '@core/shared/ui/icons/Search1'
import { Box, InputAdornment, TextField, styled } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

/* Styles below used to fake a gradient border because the 
css attributes border-radius and border-image-source are not compatible */
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: theme.palette.background.default,
    borderRadius: '8px',
    '&.Mui-focused fieldset, fieldset': {
      borderRadius: 4
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

export function SearchBar(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box
      sx={{
        borderRadius: '12px',
        background:
          'linear-gradient(90deg, #0C79B3 0%, #0FDABC 51%, #E72DBB 100%)',
        p: 1
      }}
      data-testid="SearchBar"
    >
      <StyledTextField
        placeholder={t('Search by topic, occasion, or audience ...')}
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
