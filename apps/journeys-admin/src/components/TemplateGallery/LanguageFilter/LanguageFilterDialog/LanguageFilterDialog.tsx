import { Form, Formik, FormikValues } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import {
  Language,
  MultipleLanguageAutocomplete
} from '@core/shared/ui/MultipleLanguageAutocomplete'

import { getLanguage } from '../getLanguages'

interface LanguageFilterDialogProps {
  open: boolean
  onClose: () => void
  onChange: (values: string[]) => void
  languages?: Language[]
  languageId: string
  loading: boolean
}

export function LanguageFilterDialog({
  open,
  onClose,
  onChange,
  languages,
  languageId,
  loading
}: LanguageFilterDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  // update to be taking in languageIds

  const handleSubmit = (values: FormikValues): void => {
    const ids = values.languages.map((language) => language.id)
    onChange(ids)
    onClose()
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(
        () =>
          resetForm({
            values: {
              language: getLanguage(languageId, languages)
            }
          }),
        500
      )
    }
  }

  return (
    <Formik
      initialValues={{
        languages:
          languages != null ? getLanguage(languageId, languages) : undefined
      }}
      onSubmit={handleSubmit}
    >
      {({ values, handleSubmit, resetForm, setFieldValue }) => (
        <Dialog
          open={open}
          onClose={handleClose(resetForm)}
          dialogTitle={{ title: t('Filter By Language') }}
          dialogAction={{
            onSubmit: handleSubmit,
            closeLabel: t('Cancel')
          }}
        >
          <Form>
            <MultipleLanguageAutocomplete
              onChange={async (values) =>
                await setFieldValue('languages', values)
              }
              value={values.languages}
              languages={languages}
              loading={loading}
            />
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
