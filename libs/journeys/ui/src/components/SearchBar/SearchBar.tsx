import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import { Formik } from 'formik'
import { SearchBoxConnectorParams } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { useSearchBox } from 'react-instantsearch'

import Search1Icon from '@core/shared/ui/icons/Search1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

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

  const initialValues = {
    title: query
  }

  function handleSubmit(values: typeof initialValues): void {
    refine(values.title)
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
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, handleChange, handleBlur }) => (
          <>
            <StyledTextField
              value={values.title}
              name="title"
              type="search"
              placeholder={t('Search by topic, occasion, or audience ...')}
              fullWidth
              autoComplete="off"
              onChange={handleChange}
              onBlur={handleBlur}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search1Icon />
                  </InputAdornment>
                )
              }}
              {...props}
            />
            <SubmitListener />
          </>
        )}
      </Formik>
    </Box>
  )
}
