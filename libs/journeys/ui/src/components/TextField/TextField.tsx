import MuiTextField, {
  OutlinedTextFieldProps as MuiTextFieldProps
} from '@mui/material/TextField'
import { FieldInputProps, useFormikContext } from 'formik'
import { ReactElement } from 'react'

interface TextFieldProps
  extends Omit<MuiTextFieldProps, 'variant' | 'error' | 'fullWidth'> {}

/**
 * TextField component - A form field component that integrates with Formik.
 *
 * This component wraps MUI's TextField with Formik integration for easier form handling.
 * It automatically connects to Formik context if available, handling field values,
 * errors, and validation states.
 *
 * The component is designed to be used as a subcomponent of form blocks
 * (e.g., SignUp, TextResponse) within the Journeys UI.
 *
 * @param {TextFieldProps} props - Component props
 * @param {string} [props.name=''] - Field name, used for Formik form state mapping
 * @param {string} [props.helperText] - Helper text displayed below the input field
 * @param {Object} props.muiFieldProps - Additional MUI TextField props forwarded to the underlying component
 *
 * @returns {ReactElement} The rendered TextField component
 *
 * @example
 * // Basic usage with Formik
 * <TextField name="email" label="Email Address" />
 *
 * @example
 * // With additional props
 * <TextField
 *   name="description"
 *   label="Description"
 *   multiline
 *   minRows={3}
 *   helperText="Enter your description here"
 * />
 */
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

  // dynamically assign to prevent TypeError cannot assing undefined to onChange at runtime
  if (formik?.handleChange != null)
    formikFieldProps.onChange = formik?.handleChange
  // dynamically assign to prevent TypeError cannot assing undefined to onBlur at runtime
  if (formik?.handleBlur != null) formikFieldProps.onBlur = formik?.handleBlur

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
