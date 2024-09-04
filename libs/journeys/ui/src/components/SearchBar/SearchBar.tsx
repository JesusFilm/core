import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import { styled, useTheme } from '@mui/material/styles'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useRef, useState } from 'react'
import { useRefinementList, useSearchBox } from 'react-instantsearch'

import Search1Icon from '@core/shared/ui/icons/Search1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import { LanguageButtons } from './LanguageButtons'
import { SearchbarDropdown } from './SearchDropdown'

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
    },
    [theme.breakpoints.down('lg')]: {
      borderRadius: 0,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8
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
  const theme = useTheme()
  const { t } = useTranslation('apps-watch')

  const popperRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [languageButtonVisable] = useState(showLanguageButton)
  const [dropdownVarient, setDropdownVarient] = useState<string>('suggestions')
  const { query, refine } = useSearchBox()

  const initialValues = {
    title: query
  }

  const refinements = useRefinementList({
    attribute: 'languageEnglishName',
    showMore: true,
    limit: 5,
    showMoreLimit: 5000
  })

  function handleSubmit(values: typeof initialValues): void {
    refine(values.title)
  }

  function openDropwdown(): void {
    setOpen(true)
  }

  function closeDropwdown(): void {
    setOpen(false)
  }

  function openSuggestionsDropdown(): void {
    if (!open) {
      setDropdownVarient('suggestions')
      openDropwdown()
    }
  }

  function openLanguagesDropdown(): void {
    setDropdownVarient('languages')
    openDropwdown()
  }

  return (
    <ClickAwayListener onClickAway={closeDropwdown}>
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
          onClick={() => setAnchorEl(popperRef.current)}
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
                  onFocus={openSuggestionsDropdown}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search1Icon />
                      </InputAdornment>
                    ),
                    endAdornment: languageButtonVisable ? (
                      <InputAdornment
                        position="end"
                        sx={{
                          [theme.breakpoints.down('lg')]: { display: 'none' }
                        }}
                      >
                        <LanguageButtons
                          onClick={openLanguagesDropdown}
                          refinements={refinements}
                        />
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
          <Box
            sx={{
              [theme.breakpoints.up('lg')]: { display: 'none' }
            }}
          >
            <Divider variant="middle" orientation="horizontal" />
            <LanguageButtons
              onClick={openLanguagesDropdown}
              refinements={refinements}
            />
          </Box>
        </Box>
        <SearchbarDropdown
          open={open}
          refinements={refinements}
          id={open ? 'simple-popper' : undefined}
          anchorEl={anchorEl}
          variant={dropdownVarient}
        />
      </Box>
    </ClickAwayListener>
  )
}
