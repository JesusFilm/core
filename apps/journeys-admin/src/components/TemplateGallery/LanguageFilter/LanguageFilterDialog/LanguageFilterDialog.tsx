import { Form, Formik, FormikValues } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import {
  Language,
  MultipleLanguageAutocomplete
} from '@core/shared/ui/MultipleLanguageAutocomplete'

import { getLanguages } from '../getLanguages'

interface LanguageFilterDialogProps {
  open: boolean
  onClose: () => void
  onChange: (values: string[]) => void
  languages?: Language[]
  languageIds: string[]
  loading: boolean
}

export function LanguageFilterDialog({
  open,
  onClose,
  onChange,
  languages,
  languageIds,
  loading
}: LanguageFilterDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const ENGLISH_LANGUAGE_ID = '529'

  const handleSubmit = (values: FormikValues): void => {
    const ids = values.languages.map((language) => language.id)
    onChange(ids)
    onClose()
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    if (languageIds.length === 0) {
      onChange([ENGLISH_LANGUAGE_ID])
    }
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(
        () =>
          resetForm({
            values: {
              languages:
                languageIds.length > 0
                  ? getLanguages(languageIds, languages)
                  : getLanguages([ENGLISH_LANGUAGE_ID], languages)
            }
          }),
        500
      )
    }
  }

  return (
    <>
      {languages != null && (
        <Formik
          initialValues={{
            languages:
              languages != null
                ? getLanguages(languageIds, languages)
                : undefined
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
                  values={values.languages}
                  languages={languages}
                  loading={loading}
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
