import TextField, { TextFieldProps } from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { Form, Formik } from 'formik'
import { ClipboardEvent, ComponentProps, ReactElement, ReactNode } from 'react'

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
  | 'type'
  | 'onFocus'
>

interface TextFieldFormProps extends FieldProps {
  id: string
  initialValue?: string
  validationSchema?: ComponentProps<typeof Formik>['validationSchema']
  onSubmit: (value?: string) => void
  onPaste?: (e: ClipboardEvent) => void
  startIcon?: ReactNode
  endIcon?: ReactNode
}

interface ValidationSchema {
  tests: Array<{ name: string; params: unknown }>
}

export function TextFieldForm({
  id,
  initialValue,
  validationSchema,
  onSubmit,
  onPaste,
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
      // Fix issue 3: https://github.com/jaredpalmer/formik/issues/811#issuecomment-1378298565
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
            value={values[id]}
            error={Boolean(errors[id])}
            helperText={errors[id] != null ? errors[id] : helperText}
            InputProps={{
              startAdornment: startIcon ? (
                <InputAdornment data-testid="startAdornment" position="start">
                  {startIcon}
                </InputAdornment>
              ) : undefined,
              endAdornment: endIcon ? (
                <InputAdornment data-testid="endAdornment" position="end">
                  {endIcon}
                </InputAdornment>
              ) : undefined
            }}
            onPaste={onPaste}
            onBlur={async (e) => {
              handleBlur(e)
              if (errors[id] == null) {
                onSubmit(e.target.value)
              } else if (isRequired) {
                await setFieldValue(id, initialValue)
              }
            }}
            onChange={(e) => {
              handleChange(e)
            }}
            data-testid="JourneysAdminTextFieldForm"
          />
        </Form>
      )}
    </Formik>
  )
}
