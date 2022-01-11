import { ReactElement } from 'react'
import { useField } from 'formik'

import * as MuiTextField from '@mui/material/TextField'
import { OutlinedTextFieldProps as MuiTextFieldProps } from '@mui/material'

export interface TextFieldProps
  extends Pick<
    MuiTextFieldProps,
    'id' | 'name' | 'label' | 'focused' | 'disabled'
  > {}

export function TextField({
  name = '',
  ...muiFieldProps
}: TextFieldProps): ReactElement {
  const [formikFieldProps, meta] = useField(name)

  const Field = MuiTextField.default
  const hasError = meta.error !== undefined && meta.touched

  return (
    <Field
      {...muiFieldProps}
      {...formikFieldProps}
      sx={{
        marginBottom: '16px'
      }}
      fullWidth
      name={name}
      variant="outlined"
      error={hasError}
      helperText={hasError ? meta.error : ' '}
    />
  )
}
