import { ReactElement, ReactNode } from 'react'
import { Formik, Form } from 'formik'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import EditRounded from '@mui/icons-material/EditRounded'

interface TextFieldFormProps {
  initialValues?: string
  validationSchema?: any
  handleSubmit?: (value?: string) => void
  iconPosition?: boolean
  icon?: ReactNode
}

export function TextFieldForm({
  initialValues,
  validationSchema,
  handleSubmit,
  iconPosition,
  icon
}: TextFieldFormProps): ReactElement {
  return (
    <Formik
      initialValues={{
        link: initialValues ?? ''
      }}
      validationSchema={validationSchema}
      onSubmit={async (values): Promise<void> => {
        if (handleSubmit != null) await handleSubmit(values.link)
      }}
      enableReinitialize
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Form>
          <TextField
            id="link"
            name="link"
            variant="filled"
            label="Navigate to"
            fullWidth
            value={values.link}
            error={touched.link === true && Boolean(errors.link)}
            helperText={touched.link === true && errors.link}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <EditRounded sx={{ color: 'divider' }} />
                </InputAdornment>
              )
            }}
            onBlur={(e) => {
              handleBlur(e)
              errors.link == null &&
                handleSubmit != null &&
                handleSubmit(e.target.value)
            }}
            onChange={handleChange}
          />
        </Form>
      )}
    </Formik>
  )
}
