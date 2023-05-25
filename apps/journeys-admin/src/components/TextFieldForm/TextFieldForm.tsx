import { ReactElement, ReactNode } from 'react'
import { Formik, Form } from 'formik'
import TextField, { TextFieldProps } from '@mui/material/TextField'

type IconPosition = 'start' | 'end'

type FieldProps = Pick<
  TextFieldProps,
  | 'id'
  | 'label'
  | 'placeholder'
  | 'disabled'
  | 'helperText'
  | 'hiddenLabel'
  | 'inputProps'
  | 'sx'
>

interface TextFieldFormProps extends FieldProps {
  initialValues?: string
  validationSchema?: any
  handleSubmit: (value?: string) => void
  resetField?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  iconPosition?: IconPosition
}

export function TextFieldForm({
  id,
  label,
  initialValues,
  validationSchema,
  helperText,
  inputProps,
  hiddenLabel,
  placeholder,
  handleSubmit,
  resetField = false,
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
      {({ values, touched, errors, handleChange, handleBlur, resetForm }) => (
        <Form>
          <TextField
            id={id}
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
              // todo: manage reset
            }}
            onChange={(e) => {
              handleChange(e)
              // todo: manage reset
            }}
          />
        </Form>
      )}
    </Formik>
  )
}
