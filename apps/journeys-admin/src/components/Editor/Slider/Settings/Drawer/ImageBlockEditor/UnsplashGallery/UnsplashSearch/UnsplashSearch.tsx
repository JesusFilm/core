import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Search1Icon from '@core/shared/ui/icons/Search1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

interface UnsplashSearchProps {
  handleSubmit: (value?: string | null) => void
  value?: string
}

export function UnsplashSearch({
  handleSubmit,
  value
}: UnsplashSearchProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Formik
      initialValues={{
        src: value
      }}
      onSubmit={async (e) => {
        handleSubmit(e.src)
      }}
      enableReinitialize
    >
      {({ values, handleChange }) => (
        <Form>
          <TextField
            id="src"
            name="src"
            variant="filled"
            hiddenLabel
            placeholder={t('Search by keyword')}
            value={values.src}
            onChange={handleChange}
            fullWidth
            inputProps={{
              'aria-label': 'UnsplashSearch',
              enterKeyHint: 'search'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search1Icon />
                </InputAdornment>
              )
            }}
            data-testid="UnsplashSearch"
          />
          <SubmitListener />
        </Form>
      )}
    </Formik>
  )
}
