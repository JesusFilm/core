import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import InputAdornment from '@mui/material/InputAdornment'
import { styled } from '@mui/material/styles'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useRef, useState } from 'react'
import { useSearchBox } from 'react-instantsearch'

import Search1Icon from '@core/shared/ui/icons/Search1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import { LanguageButton } from './LanguageButton'
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

  const popperRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [languageButtonVisable] = useState(showLanguageButton)
  const [dropdownVarient, setDropdownVarient] = useState<string>('suggestions')
  const { query, refine } = useSearchBox()

  const initialValues = {
    title: query
  }

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
    setDropdownVarient('suggestions')
    openDropwdown()
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
                      <InputAdornment position="end">
                        <LanguageButton onClick={openLanguagesDropdown} />
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
        <SearchbarDropdown
          open={open}
          id={open ? 'simple-popper' : undefined}
          anchorEl={anchorEl}
          varient={dropdownVarient}
        />
      </Box>
    </ClickAwayListener>
  )
}
