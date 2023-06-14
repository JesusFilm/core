import { ReactElement, ReactNode } from 'react'
import { Formik, Form } from 'formik'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { ObjectSchema } from 'yup'
import { ObjectShape } from 'yup/lib/object'

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
  validationSchema?: ObjectSchema<ObjectShape>
  handleSubmit: (value?: string) => void
  startIcon?: ReactNode
  endIcon?: ReactNode
}

export function TextFieldForm({
  id = 'textFieldValue',
  label = 'Label',
  initialValues,
  validationSchema,
  helperText,
  inputProps,
  hiddenLabel,
  placeholder,
  disabled,
  handleSubmit,
  startIcon,
  endIcon
}: TextFieldFormProps): ReactElement {
  return (
    <Formik
      initialValues={{
        [id]: initialValues
      }}
      validationSchema={validationSchema}
      onSubmit={async (values): Promise<void> => {
        await handleSubmit(values[id])
      }}
      enableReinitialize
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Form>
          <TextField
            id={id}
            name={id}
            variant="filled"
            fullWidth
            label={label}
            placeholder={placeholder}
            hiddenLabel={hiddenLabel}
            disabled={disabled}
            inputProps={inputProps}
            value={values[id]}
            error={touched[id] === true && Boolean(errors[id])}
            helperText={
              touched[id] === true && errors[id] != null
                ? errors[id]
                : helperText
            }
            InputProps={{
              startAdornment: startIcon,
              endAdornment: endIcon
            }}
            onBlur={(e) => {
              handleBlur(e)
              errors[id] == null && handleSubmit(e.target.value)
            }}
            onChange={(e) => {
              handleChange(e)
            }}
          />
        </Form>
      )}
    </Formik>
  )
}
