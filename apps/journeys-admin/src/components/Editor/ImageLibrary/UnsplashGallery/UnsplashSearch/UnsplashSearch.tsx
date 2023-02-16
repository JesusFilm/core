import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { Formik, Form } from 'formik'

interface UnsplashSearchProps {
  handleSubmit: (value?: string | null) => void
  value?: string
}

export function UnsplashSearch({
  handleSubmit,
  value
}: UnsplashSearchProps): ReactElement {
  return (
    <Formik
      initialValues={{
        src: value
      }}
      onSubmit={async (e) => handleSubmit(e.src)}
    >
      {({ values, handleChange }) => (
        <Form>
          <TextField
            id="src"
            name="src"
            variant="filled"
            hiddenLabel
            value={values.src ?? 'Search by keyword'}
            onChange={handleChange}
            fullWidth
            inputProps={{
              'aria-label': 'UnsplashSearch'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Form>
      )}
    </Formik>
  )
}
