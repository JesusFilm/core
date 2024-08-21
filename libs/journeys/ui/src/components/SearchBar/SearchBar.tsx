import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik } from 'formik'
import type { SearchBoxConnectorParams } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useState } from 'react'
import { useInstantSearch, useRefinementList, useSearchBox } from 'react-instantsearch'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
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

interface SearchBarProps {
  showLanguageButton?: boolean
  props?: SearchBoxConnectorParams
  handleLanguageClick: () => void
}

export function SearchBar({
  showLanguageButton = true,
  props,
  handleLanguageClick
}: SearchBarProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const { query, refine } = useSearchBox(props)
  const { results } = useInstantSearch()
  const [languageButtonVisable] = useState(showLanguageButton)

  const initialValues = {
    title: query
  }

  function handleSubmit(values: typeof initialValues): void {
    refine(values.title)
  }

  const { items } = useRefinementList({
    attribute: 'languageEnglishName',
    limit: 5000,
  })

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
                ),
                endAdornment: languageButtonVisable ? (
                  <InputAdornment position="end">
                    <Box
                      component="button"
                      data-testid="LanguageSelect"
                      onClick={handleLanguageClick}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: 'background.default',
                        color: 'text.secondary'
                      }}
                    >
                      <Typography>{`${results.nbHits} videos, ${items.length} language filters`}</Typography>
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                          height: 35,
                          alignSelf: 'center',
                          mx: 6
                        }}
                        variant="middle"
                      />
                      <Globe1Icon />
                      <Typography
                        sx={{
                          px: 2
                        }}
                      >
                        {t('Language')}
                      </Typography>
                      <ChevronDown />
                    </Box>
                  </InputAdornment>
                ) : (
                  <></>
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
