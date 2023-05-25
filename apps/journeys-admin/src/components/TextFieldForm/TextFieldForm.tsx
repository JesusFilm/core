import { ReactElement, ReactNode } from 'react'
import { Formik, Form } from 'formik'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

interface TextFieldFormProps {
  label: string
  initialValues?: string
  validationSchema?: any
  handleSubmit: (value?: string) => void
  endIcon?: ReactNode
}

export function TextFieldForm({
  label,
  initialValues,
  validationSchema,
  handleSubmit,
  endIcon
}: TextFieldFormProps): ReactElement {
  return (
    <Formik
      initialValues={{
        value: initialValues ?? ''
      }}
      validationSchema={validationSchema}
      onSubmit={async (values): Promise<void> => {
        await handleSubmit(values.value)
      }}
      enableReinitialize
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Form>
          <TextField
            id="value"
            name="value"
            variant="filled"
            label={label}
            fullWidth
            value={values.value}
            error={touched.value === true && Boolean(errors.value)}
            helperText={touched.value === true && errors.value}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{endIcon}</InputAdornment>
              )
            }}
            onBlur={(e) => {
              handleBlur(e)
              errors.value == null && handleSubmit(e.target.value)
            }}
            onChange={handleChange}
          />
        </Form>
      )}
    </Formik>
  )
}
