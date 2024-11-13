import MuiFormLabel, { FormLabelProps } from '@mui/material/FormLabel'
import TextField, { OutlinedTextFieldProps } from '@mui/material/TextField'
import { useField } from 'formik'
import { ReactElement } from 'react'

function FormLabel(params: FormLabelProps): ReactElement {
  return <MuiFormLabel {...params} />
}

interface FormTextFieldProps
  extends Omit<OutlinedTextFieldProps, 'variant' | 'error'> {
  name: string
  label: string
}

export function FormTextField({
  name,
  helperText = '',
  ...fieldProps
}: FormTextFieldProps): ReactElement {
  const [formikProps, meta] = useField(name)

  const hasError = meta.error !== undefined && meta.touched

  return (
    <TextField
      {...fieldProps}
      {...formikProps}
      helperText={hasError ? meta.error : helperText}
      error={hasError}
      slots={{
        inputLabel: FormLabel
      }}
    />
  )
}
