import Search1Icon from '@core/shared/ui/icons/Search1'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import { SearchBoxConnectorParams } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { useInstantSearch, useSearchBox } from 'react-instantsearch'

/* Styles below used to fake a gradient border because the 
css attributes border-radius and border-image-source are not compatible */
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: theme.palette.background.default,
    borderRadius: 8,
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

export function SearchBar(props: SearchBoxConnectorParams): ReactElement {
  const { t } = useTranslation('apps-watch')

  const { query, refine } = useSearchBox(props)
  const [inputValue, setInputValue] = useState(query)

  function setQuery(newQuery: string) {
    setInputValue(newQuery)
    refine(newQuery)
  }

  return (
    <Box
      sx={{
        borderRadius: 3,
        background:
          'linear-gradient(90deg, #0C79B3 0%, #0FDABC 51%, #E72DBB 100%)',
        p: 1
      }}
      data-testid="SearchBar"
    >
      <StyledTextField
        {...props}
        placeholder={t('Search by topic, occasion, or audience ...')}
        fullWidth
        type="search"
        value={inputValue}
        onChange={(event) => {
          setQuery(event.currentTarget.value)
        }}
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
