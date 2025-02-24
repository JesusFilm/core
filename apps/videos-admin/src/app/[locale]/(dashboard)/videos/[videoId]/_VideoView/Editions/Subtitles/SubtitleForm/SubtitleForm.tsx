import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Form, Formik } from 'formik'
import { useTranslations } from 'next-intl'
import { ReactElement, useMemo } from 'react'
import { InferType, boolean, object, string } from 'yup'

import { FormCheckbox } from '../../../../../../../../../components/FormCheckbox'
import { FormLanguageSelect } from '../../../../../../../../../components/FormLanguageSelect'

import { SubtitleUpload } from './SubtitleUpload'

const createValidationSchema = (t) => {
  return object().shape({
    language: string().required(t('Language is required')),
    primary: boolean().required(t('Primary is required')),
    vttSrc: string(),
    srtSrc: string()
  })
}

export type SubtitleValidationSchema = InferType<
  ReturnType<typeof createValidationSchema>
>

interface SubtitleFormProps {
  subtitle?: any
  edition: any
  variant: 'create' | 'edit'
  initialValues: SubtitleValidationSchema
  onSubmit: (values: SubtitleValidationSchema) => void
}

export function SubtitleForm({
  subtitle,
  edition,
  variant,
  initialValues,
  onSubmit
}: SubtitleFormProps): ReactElement {
  const t = useTranslations()
  const validationSchema = useMemo(() => createValidationSchema(t), [t])

  const initialLanguage = {
    id: subtitle?.language?.id,
    localName: subtitle?.language?.name?.find(({ primary }) => !primary)?.value,
    nativeName: subtitle?.language?.name?.find(({ primary }) => primary)?.value,
    slug: subtitle?.language?.slug
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form data-testId="SubtitleForm">
        <Stack gap={2}>
          <FormLanguageSelect
            name="language"
            label={t('Language')}
            initialLanguage={initialLanguage}
          />
          <FormCheckbox name="primary" label={t('Primary')} />
          <SubtitleUpload edition={edition} />
          <Button variant="contained" type="submit" fullWidth>
            {variant === 'create' ? t('Create') : t('Update')}
          </Button>
        </Stack>
      </Form>
    </Formik>
  )
}
