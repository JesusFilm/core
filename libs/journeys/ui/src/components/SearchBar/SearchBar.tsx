import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Popper from '@mui/material/Popper'
import { styled } from '@mui/material/styles'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useRef, useState } from 'react'
import { useSearchBox } from 'react-instantsearch'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
import Search1Icon from '@core/shared/ui/icons/Search1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import { LangaugeRefinement } from '../LanguageRefinement'


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
  props?: TextFieldProps
}

export function SearchBar({
  showLanguageButton = false,
  props
}: SearchBarProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const { query, refine } = useSearchBox()
  const [languageButtonVisable] = useState(showLanguageButton)

  const initialValues = {
    title: query
  }

  function handleSubmit(values: typeof initialValues): void {
    refine(values.title)
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [open, setOpen] = useState(false);
  const popperRef = useRef(null)

  const handleClick = (): void => {
    setAnchorEl(popperRef.current)
    setOpen((prevOpen) => !prevOpen)
  }

  const id = open ? 'simple-popper' : undefined

  return (
    <Box>
      <Box
        sx={{
          borderRadius: 3,
          background:
            'linear-gradient(90deg, #0C79B3 0%, #0FDABC 51%, #E72DBB 100%)',
          p: 1
        }}
        data-testid="SearchBar"
        ref={popperRef}
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
                      onClick={handleClick}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: 'background.default',
                        color: 'text.secondary'
                      }}
                    >
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                          height: 35,
                          alignSelf: 'center',
                          marginRight: 6
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
      <Popper id={id} open={open} anchorEl={anchorEl} placement='bottom-end' sx={{width: anchorEl?.clientWidth}} data-testid='SearchLangaugeFilter'>
        <Box sx={{ p: 8, bgcolor: 'background.paper', mt: 3 }} borderRadius={3} boxShadow='0px 4px 4px 0px #00000040'>
          <Box color='text.primary'>
            <LangaugeRefinement/>
          </Box>
        </Box>
      </Popper>
    </Box>
  )
}
