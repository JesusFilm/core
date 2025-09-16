import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { styled } from '@mui/material/styles'
import TextField, {
  BaseTextFieldProps,
  TextFieldProps
} from '@mui/material/TextField'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import {
  type FocusEvent,
  type ReactElement,
  useState
} from 'react'

import Search1Icon from '@core/shared/ui/icons/Search1'
import X1Icon from '@core/shared/ui/icons/X1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

interface StyledTextFieldProps extends BaseTextFieldProps {}

const StyledTextField = styled(TextField)<StyledTextFieldProps>(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 35,
    transition: 'background 0.2s ease-in-out',
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.8)'
    },
    '&.Mui-focused fieldset, fieldset': {
      borderRadius: 35
    },
    fieldset: {
      border: 'none'
    },
    input: {
      transform: 'none',
      color: 'white',
      fontSize: '18px',
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    },
    '&.Mui-focused input': {
      color: 'black'
    },
    '&.Mui-focused input::placeholder': {
      color: 'rgba(0, 0, 0, 0.6)'
    }
  }
}))

interface SimpleSearchBarProps {
  loading?: boolean
  value?: string
  onSearch?: (query: string) => void
  props?: TextFieldProps
  onFocus?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function SimpleSearchBar({
  loading = false,
  value = '',
  onSearch,
  props,
  onFocus,
  onBlur
}: SimpleSearchBarProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [isFocused, setIsFocused] = useState(false)

  function handleSubmit(values: { title: string }): void {
    if (onSearch) {
      onSearch(values.title)
    }
  }

  return (
    <Box
      sx={{
        borderRadius: 35,
        p: 1
      }}
      data-testid="SearchBar"
    >
      <Formik
        initialValues={{
          title: value
        }}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur: formikHandleBlur, setFieldValue }) => (
          <>
            <StyledTextField
              data-testid="SearchBarInput"
              value={values.title}
              name="title"
              type="text"
              placeholder={t('Search by topic, occasion, or audience ...')}
              fullWidth
              autoComplete="off"
              onChange={(event) => {
                // Only update the form value, don't trigger search
                handleChange(event)
              }}
              onBlur={(event) => {
                setIsFocused(false)
                formikHandleBlur(event)
                onBlur?.(event)
              }}
              onFocus={(event) => {
                setIsFocused(true)
                onFocus?.(event)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (onSearch) {
                    onSearch(values.title)
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search1Icon sx={{ color: isFocused ? 'black' : 'white' }} />
                  </InputAdornment>
                ),
                endAdornment: values.title.trim().length > 0 ? (
                  <InputAdornment position="end">
                    {loading ? (
                      <CircularProgress size={20} sx={{ color: isFocused ? 'black' : 'white' }} />
                    ) : (
                      <IconButton
                        aria-label="clear search"
                        onClick={() => {
                          setFieldValue('title', '')
                          if (onSearch) {
                            onSearch('')
                          }
                        }}
                        edge="end"
                        size="small"
                        sx={{ color: isFocused ? 'black' : 'white' }}
                      >
                        <X1Icon />
                      </IconButton>
                    )}
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