import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Form, Formik } from 'formik'
import { ReactElement, useMemo } from 'react'
import { InferType, object, string } from 'yup'

import { FormTextField } from '../../../../../../../components/FormTextField'

const createValidationSchema = () => {
  return object().shape({
    name: string().required('Name is required')
  })
}

export type EditionValidationSchema = InferType<
  ReturnType<typeof createValidationSchema>
>

interface EditionFormProps {
  variant: 'create' | 'edit'
  initialValues: EditionValidationSchema
  onSubmit: (values: EditionValidationSchema) => void
}

export function EditionForm({
  variant,
  initialValues,
  onSubmit
}: EditionFormProps): ReactElement {
  const validationSchema = useMemo(() => createValidationSchema(), [])

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      <Form data-testId="EditionForm">
        <Stack gap={2}>
          <FormTextField name="name" label="Name" fullWidth />
          <Stack direction="row" gap={1}>
            <Button variant="contained" type="submit" fullWidth>
              {variant === 'create' ? 'Create' : 'Update'}
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Formik>
  )
}
