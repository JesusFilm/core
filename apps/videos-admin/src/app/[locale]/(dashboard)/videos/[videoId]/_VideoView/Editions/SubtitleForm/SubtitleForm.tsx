import { Button, Stack } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslations } from 'next-intl'
import { ReactElement, useMemo } from 'react'
import { InferType, boolean, object, string } from 'yup'

import { FormCheckbox } from '../../../../../../../../components/FormCheckbox'
import { FormLanguageSelect } from '../../../../../../../../components/FormLanguageSelect'
import { FileUpload } from '../../Metadata/VideoImage/FileUpload'

import { SubtitleUpload } from './SubtitleUpload'

const createValidationSchema = (t) => {
  return object().shape({
    language: string().required(t('Name is required')),
    primary: boolean().required(t('Primary is required')),
    vttSrc: string(),
    srtSrc: string()
  })
}

export type SubtitleValidationSchema = InferType<
  ReturnType<typeof createValidationSchema>
>

interface SubtitleFormProps {
  variant: 'create' | 'edit'
  initialValues: SubtitleValidationSchema
  onSubmit: (values: SubtitleValidationSchema) => void
}

export function SubtitleForm({
  variant,
  initialValues,
  onSubmit
}: SubtitleFormProps): ReactElement {
  const t = useTranslations()
  const validationSchema = useMemo(() => createValidationSchema(t), [t])

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form data-testId="SubtitleForm">
        <Stack gap={2}>
          <FormLanguageSelect name="language" label={t('Language')} />
          <FormCheckbox name="primary" label={t('Primary')} />
          <SubtitleUpload />
          <Button variant="contained" type="submit" fullWidth>
            {variant === 'create' ? t('Create') : t('Update')}
          </Button>
        </Stack>
      </Form>
    </Formik>
  )
}
