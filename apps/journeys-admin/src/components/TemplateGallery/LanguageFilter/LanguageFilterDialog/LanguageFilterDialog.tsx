import { Form, Formik, FormikValues } from 'formik'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

interface Language {
  id: string
  name: Translation[]
}

interface Translation {
  value: string
  primary: boolean
}

interface LangaugeFilterDialogProps {
  open: boolean
  onClose: () => void
  languages?: Language[]
  loading
}

export interface LanguageOption {
  id: string
  localName?: string
  nativeName?: string
}

export function LanguageFilterDialog({
  open,
  onClose,
  languages,
  loading
}: LangaugeFilterDialogProps): ReactElement {
  const router = useRouter()

  const handleSubmit = (values: FormikValues): void => {
    void router.push(
      {
        pathname: '/templates',
        query: { languageIds: [values.language.id] }
      },
      undefined,
      { shallow: true }
    )
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
              language: getLanguage('529')
            }
          }),
        500
      )
    }
  }

  return (
    <Formik
      initialValues={{
        language: languages != null ? getLanguage('529') : undefined
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
