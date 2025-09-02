import TextField, { OutlinedTextFieldProps } from '@mui/material/TextField'
import { useField } from 'formik'
import { ReactElement } from 'react'

interface FormTextFieldProps
  extends Omit<OutlinedTextFieldProps, 'variant' | 'error'> {
  name: string
  label: string
}

export function FormTextField({
  name,
  helperText = '',
  placeholder = undefined,
  ...fieldProps
}: FormTextFieldProps): ReactElement {
  const [formikProps, meta] = useField(name)

  const hasError = meta.error !== undefined && meta.touched

  return (
    <TextField
      {...fieldProps}
      {...formikProps}
      placeholder={placeholder}
      helperText={hasError ? meta.error : helperText}
      error={hasError}
    />
  )
}
