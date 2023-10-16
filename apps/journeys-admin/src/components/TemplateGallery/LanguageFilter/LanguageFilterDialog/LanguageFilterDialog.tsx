// import Checkbox from '@mui/material/Checkbox'
// import Typography from '@mui/material/Typography'
// import Stack from '@mui/system/Stack'
import { Form, Formik, FormikValues } from 'formik'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'
import type {
  Language,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

export interface LanguageFilterDialogProps {
  open: boolean
  onClose: () => void
  onChange: (value) => void
  languages?: Language[]
  loading: boolean
}

const DEFAULT_LANGUAGE_ID = '529'

export function LanguageFilterDialog({
  open,
  onClose,
  onChange,
  languages,
  loading
}: LanguageFilterDialogProps): ReactElement {
  const handleSubmit = (values: FormikValues): void => {
    onChange(values.language.id)
    onClose()
  }

  function getLanguage(languageId: string): LanguageOption {
    const id = languages?.find((language) => language?.id === languageId)?.id
    const localName = languages
      ?.find((language) => language?.id === id)
      ?.name?.find(({ primary }) => !primary)?.value
    const nativeName = languages
      ?.find((language) => language?.id === id)
      ?.name?.find(({ primary }) => primary)?.value

    return {
      id: id != null ? id : '',
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
              language: getLanguage(DEFAULT_LANGUAGE_ID)
            }
          }),
        500
      )
    }
  }

  return (
    <Formik
      initialValues={{
        language:
          languages != null ? getLanguage(DEFAULT_LANGUAGE_ID) : undefined
      }}
      onSubmit={handleSubmit}
    >
      {({ values, handleSubmit, resetForm, setFieldValue }) => (
        <Dialog
          open={open}
          onClose={handleClose(resetForm)}
          dialogTitle={{ title: 'Edit Language' }}
          dialogAction={{
            onSubmit: handleSubmit,
            closeLabel: 'Cancel'
          }}
        >
          <Form>
            <LanguageAutocomplete
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
