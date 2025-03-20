import MuiTextField, {
  OutlinedTextFieldProps as MuiTextFieldProps
} from '@mui/material/TextField'
import { FieldInputProps, useFormikContext } from 'formik'
import { ReactElement } from 'react'

interface TextFieldProps
  extends Omit<MuiTextFieldProps, 'variant' | 'error' | 'fullWidth'> {}

// Use as subcomponent of form blocks (eg SignUp, TextResponse)
export function TextField({
  name = '',
  helperText,
  ...muiFieldProps
}: TextFieldProps): ReactElement {
  const formik = useFormikContext<{
    [key: string]: string
  }>()

  const formikFieldProps: Partial<FieldInputProps<string>> = {
    value: formik?.values?.[name] ?? ''
  }

  formik?.handleChange != null &&
    (formikFieldProps.onChange = formik?.handleChange)
  formik?.handleBlur != null && (formikFieldProps.onBlur = formik?.handleBlur)

  const hasError =
    formik?.errors?.[name] !== undefined && formik?.touched?.[name]
  const hint = helperText != null ? helperText : ' '

  return (
    <MuiTextField
      {...muiFieldProps}
      {...formikFieldProps}
      fullWidth
      name={name}
      variant="outlined"
      error={hasError}
      helperText={hasError ? formik?.errors?.[name] : hint}
      data-testid="JourneysTextField"
    />
  )
}
