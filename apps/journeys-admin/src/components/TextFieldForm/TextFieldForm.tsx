import InputAdornment from '@mui/material/InputAdornment'
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
  | 'size'
  | 'onFocus'
  | 'slotProps'
  | 'variant'
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
  validate: () => void
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
  const formikRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    focus: () => textFieldRef.current?.focus(),
    validate: () => {
      if (formikRef.current) {
        formikRef.current.handleSubmit()
      }
    }
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
        handleSubmit,
        ...formikProps
      }) => {
        // Store formik instance in ref for external access
        formikRef.current = { handleSubmit, ...formikProps }

        return (
          <Form style={{ width: '100%' }}>
            <TextField
              {...muiFieldProps}
              id={id}
              fullWidth
              name={id}
              inputRef={textFieldRef}
              variant={muiFieldProps.variant ?? 'filled'}
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
                  handleSubmit()
                } else if (values[id] === '' && initialValue) {
                  // Revert to initial value if field is empty and has an initial value
                  void setFieldValue(id, initialValue)
                }
              }}
              onChange={(e) => {
                handleChange(e)
              }}
              data-testid="JourneysAdminTextFieldForm"
            />
          </Form>
        )
      }}
    </Formik>
  )
}
