import { ReactElement } from 'react'
import { useField } from 'formik'

import MuiTextField, {
  OutlinedTextFieldProps as MuiTextFieldProps
} from '@mui/material/TextField'

interface TextFieldProps
  extends Omit<MuiTextFieldProps, 'variant' | 'error' | 'fullWidth'> {}

// Use as subcomponent of form blocks (eg SignUp, TextResponse)
export function TextField({
  name = '',
  helperText,
  ...muiFieldProps
}: TextFieldProps): ReactElement {
  const [formikFieldProps, meta] = useField(name)

  const hasError = meta.error !== undefined && meta.touched
  const hint = helperText != null && helperText !== '' ? helperText : ' '

  return (
    <MuiTextField
      {...muiFieldProps}
      {...formikFieldProps}
      fullWidth
      name={name}
      // TODO: Switch to filled & clarify styling in cooldown
      variant="outlined"
      error={hasError}
      helperText={hasError ? meta.error : hint}
    />
  )
}
