import { Form, Formik, FormikValues } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'
import type {
  Language,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

interface LanguageFilterDialogProps {
  open: boolean
  onClose: () => void
  onChange: (value) => void
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
  const handleSubmit = (values: FormikValues): void => {
    onChange(values.language.id)
    onClose()
  }

  function getLanguage(languageId: string): LanguageOption {
    const language = languages?.find((language) => language?.id === languageId)

    const id = language?.id ?? ''
    const localName = language?.name?.find(({ primary }) => !primary)?.value
    const nativeName = language?.name?.find(({ primary }) => primary)?.value

    return {
      id,
      localName,
      nativeName
    }
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(
        () =>
          resetForm({
            values: {
              language: getLanguage(languageId)
            }
          }),
        500
      )
    }
  }

  return (
    <Formik
      initialValues={{
        language: languages != null ? getLanguage(languageId) : undefined
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
            <LanguageAutocomplete
              // update to be true on multiple language changes
              multiple={false}
              onChange={async (value) => await setFieldValue('language', value)}
              value={values.language}
              languages={languages}
              loading={loading}
            />
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
