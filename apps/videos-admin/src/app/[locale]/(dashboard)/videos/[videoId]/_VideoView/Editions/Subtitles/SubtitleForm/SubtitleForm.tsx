import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { Form, Formik } from 'formik'
import { useTranslations } from 'next-intl'
import { ReactElement, useMemo } from 'react'
import { InferType, boolean, mixed, object, string } from 'yup'

import { FormCheckbox } from '../../../../../../../../../components/FormCheckbox'
import { FormLanguageSelect } from '../../../../../../../../../components/FormLanguageSelect'
import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { ArrayElement } from '../../../../../../../../../types/array-types'

import { SubtitleFileUpload } from './SubtitleFileUpload'

const createValidationSchema = (t) => {
  return object().shape({
    language: string().required(t('Language is required')),
    primary: boolean().required(t('Primary is required')),
    file: mixed().nullable()
  })
}

export type SubtitleValidationSchema = InferType<
  ReturnType<typeof createValidationSchema>
>

type Edition = ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>
type Subtitle = ArrayElement<Edition['videoSubtitles']>

interface SubtitleFormProps {
  subtitle?: Subtitle
  variant: 'create' | 'edit'
  initialValues: SubtitleValidationSchema
  onSubmit: (values: SubtitleValidationSchema) => void
  loading?: boolean
}

export function SubtitleForm({
  subtitle,
  variant,
  initialValues,
  onSubmit,
  loading
}: SubtitleFormProps): ReactElement {
  const t = useTranslations()
  const validationSchema = useMemo(() => createValidationSchema(t), [t])

  const initialLanguage = {
    id: subtitle?.language?.id ?? '529',
    localName: subtitle?.language?.name?.find(({ primary }) => !primary)?.value,
    nativeName: subtitle?.language?.name?.find(({ primary }) => primary)?.value,
    slug: subtitle?.language?.slug
  }

  const buttonText = variant === 'create' ? t('Create') : t('Update')

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
          <SubtitleFileUpload />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : buttonText}
          </Button>
        </Stack>
      </Form>
    </Formik>
  )
}
