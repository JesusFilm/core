import SearchIcon from '@mui/icons-material/Search'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { ReactElement } from 'react'

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
            placeholder="Search by keyword"
            value={values.src}
            onChange={handleChange}
            fullWidth
            inputProps={{
              'aria-label': 'UnsplashSearch',
              enterkeyhint: 'Search'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
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
