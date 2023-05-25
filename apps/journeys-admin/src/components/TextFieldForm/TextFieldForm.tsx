import { ReactElement, ReactNode } from 'react'
import { Formik, Form } from 'formik'
import TextField, { TextFieldProps } from '@mui/material/TextField'

type IconPosition = 'start' | 'end'

// add id to the components affected
interface TextFieldFormProps
  extends Pick<
    TextFieldProps,
    | 'id'
    | 'label'
    | 'placeholder'
    | 'disabled'
    | 'helperText'
    | 'hiddenLabel'
    | 'inputProps'
    | 'sx'
  > {
  initialValues?: string
  validationSchema?: any
  handleSubmit: (value?: string) => void
  startIcon?: ReactNode
  endIcon?: ReactNode
  iconPosition?: IconPosition
}

export function TextFieldForm({
  label,
  initialValues,
  validationSchema,
  helperText,
  inputProps,
  hiddenLabel,
  placeholder,
  handleSubmit,
  startIcon,
  endIcon,
  iconPosition
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
            fullWidth
            label={label}
            placeholder={placeholder}
            hiddenLabel={hiddenLabel}
            inputProps={inputProps}
            value={values.value}
            error={touched.value === true && Boolean(errors.value)}
            helperText={
              touched.value === true && errors.value != null
                ? errors.value
                : helperText
            }
            InputProps={{
              startAdornment: iconPosition === 'start' && startIcon,
              endAdornment: iconPosition === 'end' && endIcon
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
