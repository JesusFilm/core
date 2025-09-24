import TextField, { TextFieldProps } from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import {
  ClipboardEvent,
  ComponentProps,
  ReactElement,
  ReactNode,
  useImperativeHandle,
  useRef
} from 'react'

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
  ref?: React.RefObject<TextFieldFormRef | null>
}

export interface TextFieldFormRef {
  focus: () => void
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
  ref,
  ...muiFieldProps
}: TextFieldFormProps): ReactElement {
  const textFieldRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => ({
    focus: () => textFieldRef.current?.focus()
  }))

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
      {({
        values,
        errors,
        handleChange,
        handleBlur,
        setFieldValue,
        handleSubmit
      }) => (
        <Form>
          <TextField
            {...muiFieldProps}
            id={id}
            name={id}
            inputRef={textFieldRef}
            variant="filled"
            fullWidth
            value={values[id]}
            error={Boolean(errors[id])}
            helperText={errors[id] != null ? errors[id] : helperText}
            InputProps={{
              startAdornment: startIcon,
              endAdornment: endIcon
            }}
            onPaste={onPaste}
            onBlur={async (e) => {
              handleBlur(e)
              if (errors[id] == null) {
                handleSubmit()
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
