import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik, FormikValues } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import {
  Language,
  LanguageOption,
  MultipleLanguageAutocomplete
} from '@core/shared/ui/MultipleLanguageAutocomplete'

interface LanguageFilterDialogProps {
  open: boolean
  onClose: () => void
  onChange: (values: string[]) => void
  languages?: Language[]
  value: LanguageOption[]
  loading: boolean
}

export function LanguageFilterDialog({
  open,
  onClose,
  onChange,
  languages,
  value,
  loading
}: LanguageFilterDialogProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { t } = useTranslation('apps-journeys-admin')

  const handleSubmit = (values: FormikValues): void => {
    const ids = values.languages.map((language) => language.id)
    onChange(ids)
    onClose()
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() => resetForm({ values: { languages: value } }), 500)
    }
  }

  return (
    <>
      {languages != null && (
        <Formik
          initialValues={{
            languages: value
          }}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, handleSubmit, resetForm, setFieldValue }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogTitle={{ title: t('Available Languages') }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: t('Cancel')
              }}
              fullscreen={!smUp}
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
