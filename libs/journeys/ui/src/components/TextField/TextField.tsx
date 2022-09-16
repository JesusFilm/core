import { ReactElement } from 'react'
import { useField } from 'formik'

import MuiTextField, {
  OutlinedTextFieldProps as MuiTextFieldProps
} from '@mui/material/TextField'

export interface TextFieldProps
  extends Pick<
    MuiTextFieldProps,
    | 'id'
    | 'name'
    | 'label'
    | 'focused'
    | 'disabled'
    | 'value'
    | 'helperText'
    | 'multiline'
    | 'onBlur'
    | 'onChange'
  > {}

// Use as subcomponent of form blocks (eg SignUp, TextResponse)
export function TextField({
  name = '',
  helperText,
  ...muiFieldProps
}: TextFieldProps): ReactElement {
  const [formikFieldProps, meta] = useField(name)

  const hasError = meta.error !== undefined && meta.touched

  return (
    <MuiTextField
      {...muiFieldProps}
      {...formikFieldProps}
      fullWidth
      name={name}
      // TODO: Switch to filled & clarify styling in cooldown
      variant="outlined"
      error={hasError}
      helperText={hasError ? meta.error : helperText ?? ' '}
    />
  )
}
