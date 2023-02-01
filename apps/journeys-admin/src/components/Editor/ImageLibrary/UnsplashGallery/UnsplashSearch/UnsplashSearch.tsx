import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import LinkIcon from '@mui/icons-material/Link'
import { Formik, Form } from 'formik'

interface UnsplashSearchProps {
  handleSubmit: (value: string) => Promise<void>
}

export function UnsplashSearch({
  handleSubmit
}: UnsplashSearchProps): ReactElement {
  return (
    <Formik
      initialValues={{
        src: ''
      }}
      onSubmit={async (e) => await handleSubmit(e.src)}
    >
      {({ values, handleChange }) => (
        <Form>
          <TextField
            id="src"
            name="src"
            variant="filled"
            label="Search free images"
            value={values.src}
            onChange={handleChange}
            fullWidth
            inputProps={{
              'aria-label': 'UnsplashSearch'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              )
            }}
          />
        </Form>
      )}
    </Formik>
  )
}
