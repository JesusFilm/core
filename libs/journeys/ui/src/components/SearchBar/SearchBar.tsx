import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import { styled, useTheme } from '@mui/material/styles'
import TextField, {
  BaseTextFieldProps,
  TextFieldProps
} from '@mui/material/TextField'
import { Formik } from 'formik'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import {
  type FocusEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useRefinementList, useSearchBox } from 'react-instantsearch'

import Search1Icon from '@core/shared/ui/icons/Search1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import {
  languageRefinementProps,
  useSearchBar
} from '../../libs/algolia/SearchBarProvider'
import { useLanguagesContinentsLazyQuery } from '../../libs/useLanguagesContinentsQuery'
import { sortLanguageContinents } from '../../libs/useLanguagesContinentsQuery/sortLanguageContinents'

const SearchbarDropdown = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "SearchBar/SearchbarDropdown" */ './SearchDropdown'
    ).then((mod) => mod.SearchbarDropdown),
  { ssr: false }
)

const LanguageButtons = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "SearchBar/LanguageButtons" */ './LanguageButtons'
    ).then((mod) => mod.LanguageButtons),
  { ssr: false }
)

interface StyledTextFieldProps extends BaseTextFieldProps {
  showLanguageButton?: boolean
}

/* Styles below used to fake a gradient border because the 
css attributes border-radius and border-image-source are not compatible */
const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'showLanguageButton'
})<StyledTextFieldProps>(({ theme, showLanguageButton }) => ({
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
    [theme.breakpoints.down('lg')]: showLanguageButton === true && {
      borderRadius: 0,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8
    }
  }
}))

interface SearchBarProps {
  showDropdown?: boolean
  showLanguageButton?: boolean
  props?: TextFieldProps
  onFocus?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function SearchBar({
  showDropdown = false,
  showLanguageButton = false,
  props,
  onFocus,
  onBlur
}: SearchBarProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const theme = useTheme()

  const popperRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [tabValue, setTabValue] = useState<number>(0)
  const [countryCode, setCountryCode] = useState<string>()

  const { dispatch } = useSearchBar()
  const { query, refine } = useSearchBox()
  const refinements = useRefinementList(languageRefinementProps)

  function handleSubmit(values: { title: string }): void {
    refine(values.title)
  }

  function openSuggestionsDropdown(): void {
    void prepareDropdown()
    setAnchorEl(popperRef.current)
    setOpen(true)
  }

  function handleLanguageClick(): void {
    setAnchorEl(popperRef.current)
    setTabValue(1)
    setOpen(!open)
  }

  const [isPreparingDropdown, setIsPreparingDropdown] = useState(false)
  const [getLanguages] = useLanguagesContinentsLazyQuery()

  async function getLanguageContinents(): Promise<void> {
    const result = await getLanguages()
    const languages = sortLanguageContinents({
      languages: result.data?.languages ?? []
    })
    dispatch({
      type: 'SetAllContinentLanguages',
      continentLanguages: languages
    })
  }

  async function prepareDropdown(): Promise<void> {
    if (!isPreparingDropdown) {
      setIsPreparingDropdown(true)
      await getLanguageContinents()
    }
  }

  const findUserCountry = useCallback(async () => {
    const response = await fetch('/api/geolocation')
    const { country } = await response.json()

    if (country != null) {
      setCountryCode(country)
    }
  }, [])

  useEffect(() => {
    void findUserCountry()
  }, [findUserCountry])

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
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
          onMouseEnter={prepareDropdown}
          onTouchStart={prepareDropdown}
          onClick={prepareDropdown}
          onFocus={prepareDropdown}
        >
          <Formik
            initialValues={{
              title: query
            }}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, handleChange, handleBlur: formikHandleBlur }) => (
              <>
                <StyledTextField
                  data-testid="SearchBarInput"
                  value={values.title}
                  name="title"
                  type="search"
                  placeholder={t('Search by topic, occasion, or audience ...')}
                  fullWidth
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={(event) => {
                    formikHandleBlur(event)
                    onBlur?.(event)
                  }}
                  onFocus={(event) => {
                    openSuggestionsDropdown()
                    onFocus?.(event)
                  }}
                  onClick={openSuggestionsDropdown}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setOpen(false)
                  }}
                  onMouseEnter={prepareDropdown}
                  onTouchStart={prepareDropdown}
                  showLanguageButton={showLanguageButton}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search1Icon />
                      </InputAdornment>
                    ),
                    endAdornment: showLanguageButton ? (
                      <InputAdornment
                        position="end"
                        sx={{
                          [theme.breakpoints.down('lg')]: { display: 'none' }
                        }}
                      >
                        <LanguageButtons
                          onClick={handleLanguageClick}
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
          {showLanguageButton && (
            <Box
              sx={{
                [theme.breakpoints.up('lg')]: { display: 'none' }
              }}
            >
              <Divider variant="middle" orientation="horizontal" />
              <LanguageButtons
                onClick={handleLanguageClick}
                refinements={refinements}
              />
            </Box>
          )}
        </Box>
        {showDropdown && (
          <SearchbarDropdown
            open={open}
            refinements={refinements}
            countryCode={countryCode}
            id={open ? 'simple-popper' : undefined}
            anchorEl={anchorEl}
            tabIndex={tabValue}
            handleTabValueChange={setTabValue}
          />
        )}
      </Box>
    </ClickAwayListener>
  )
}
