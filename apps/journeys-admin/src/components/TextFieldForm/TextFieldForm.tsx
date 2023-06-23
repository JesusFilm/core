import { ReactElement, ReactNode } from 'react'
import { Formik, Form } from 'formik'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { ObjectSchema } from 'yup'
import { ObjectShape } from 'yup/lib/object'

type FieldProps = Pick<
  TextFieldProps,
  | 'label'
  | 'placeholder'
  | 'focused'
  | 'disabled'
  | 'helperText'
  | 'hiddenLabel'
  | 'inputProps'
  | 'sx'
>

interface TextFieldFormProps extends FieldProps {
  id: string
  initialValue?: string
  validationSchema?: ObjectSchema<ObjectShape>
  onSubmit: (value?: string) => void
  startIcon?: ReactNode
  endIcon?: ReactNode
}

interface ValidationSchema {
  tests: Array<{ name: string; params: unknown }>
}

export function TextFieldForm({
  id,
  label = 'Label',
  initialValue,
  validationSchema,
  onSubmit,
  startIcon,
  endIcon,
  helperText,
  ...muiFieldProps
}: TextFieldFormProps): ReactElement {
  const isRequired =
    validationSchema != null
      ? Boolean(
          (
            validationSchema.fields[id].describe() as ValidationSchema
          ).tests.find((test) => test.name === 'required')
        )
      : false

  return (
    <Formik
      key={`field-${id}-${initialValue ?? ''}`}
      initialValues={{
        [id]: initialValue
      }}
      validationSchema={validationSchema}
      onSubmit={async (values): Promise<void> => {
        await onSubmit(values[id])
      }}
      enableReinitialize
    >
      {({ values, errors, handleChange, handleBlur, setFieldValue }) => (
        <Form>
          <TextField
            {...muiFieldProps}
            id={id}
            name={id}
            variant="filled"
            fullWidth
            label={label}
            value={values[id]}
            error={Boolean(errors[id])}
            helperText={errors[id] != null ? errors[id] : helperText}
            InputProps={{
              startAdornment: startIcon,
              endAdornment: endIcon
            }}
            onBlur={(e) => {
              handleBlur(e)
              if (errors[id] == null) {
                onSubmit(e.target.value)
              } else if (isRequired) {
                setFieldValue(id, initialValue)
              }
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
